"use client"

import { useEffect, useState } from "react"
import { Smartphone } from "lucide-react"

export function MobileOnlyWrapper({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(true)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const mobileKeywords = ['android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone', 'mobile']
      const isMobileDevice = mobileKeywords.some(keyword => userAgent.includes(keyword))
      const isSmallScreen = window.innerWidth <= 768
      
      setIsMobile(isMobileDevice || isSmallScreen)
      setIsChecking(false)
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  if (isChecking) {
    return null
  }

  if (!isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a4a68] via-[#0d5a7d] to-[#083d57] flex items-center justify-center p-6">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-10 max-w-md text-center animate-fade-in-up">
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-400/30">
            <Smartphone className="w-12 h-12 text-[#0a4a68]" />
          </div>
          
          <h1 className="text-2xl font-bold text-[#0a4a68] mb-4" dir="rtl">
            يرجى استخدام الهاتف المحمول
          </h1>
          
          <p className="text-gray-600 mb-6 leading-relaxed" dir="rtl">
            هذه الخدمة متاحة فقط على الأجهزة المحمولة. يرجى زيارة الموقع من هاتفك الذكي للاستمرار.
          </p>
          
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
            <p className="text-sm text-gray-500 mb-3" dir="rtl">قم بمسح الكود للوصول السريع</p>
            <div className="w-32 h-32 mx-auto bg-white rounded-xl border-2 border-gray-200 flex items-center justify-center">
              <div className="text-4xl">📱</div>
            </div>
            <p className="text-xs text-gray-400 mt-3" dir="rtl">أو افتح الرابط من متصفح هاتفك</p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
