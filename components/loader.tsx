export function FullPageLoader() {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#0a4a68]/95 via-[#0d5a7d]/90 to-[#083d57]/95 backdrop-blur-md">
        <div className="flex flex-col items-center gap-8">
          <div className="relative h-28 w-28">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-white/5 shadow-2xl"></div>
            <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-400 border-r-amber-400/50 animate-spin"></div>
            <div
              className="absolute inset-3 rounded-full border-4 border-transparent border-t-white/60 border-l-white/30 animate-spin"
              style={{ animationDuration: "1.2s", animationDirection: "reverse" }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-400/40 animate-pulse">
                <span className="text-[#0a4a68] text-xl font-bold">B</span>
              </div>
            </div>
          </div>
  
          <div className="flex flex-col items-center gap-4">
            <p className="text-lg font-bold text-white tracking-wide drop-shadow-lg">يرجى الانتظار</p>
            <div className="flex gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-bounce shadow-lg shadow-amber-400/50"
                style={{ animationDelay: "0ms", animationDuration: "0.6s" }}
              ></span>
              <span
                className="h-2.5 w-2.5 rounded-full bg-white animate-bounce shadow-lg shadow-white/50"
                style={{ animationDelay: "150ms", animationDuration: "0.6s" }}
              ></span>
              <span
                className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-bounce shadow-lg shadow-amber-400/50"
                style={{ animationDelay: "300ms", animationDuration: "0.6s" }}
              ></span>
            </div>
          </div>
        </div>
      </div>
    )
  }
  