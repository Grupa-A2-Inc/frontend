export default function Navbar() {
  return (
    <nav className="w-full">
      <div className="flex items-center justify-between h-32" style={{ paddingLeft: '100px', paddingRight: '100px' }}>
        
        {/* Logo */}
        <h1 className="text-[28px] font-extrabold tracking-tight">
          <span className="text-[#4c57a9]">Testify</span>
          <span className="text-[#a57ef1]">AI</span>
        </h1>

        {/* Buttons */}
        <div className="flex items-center gap-6">
          <button className="h-12 w-44 rounded-2xl bg-[#4c57a9] text-white font-bold text-lg tracking-wide shadow-[0_4px_20px_rgba(91,106,208,0.5)] hover:shadow-[0_4px_28px_rgba(91,106,208,0.7)] hover:brightness-110 transition-all duration-200">
            Log in
          </button>
          <button className="h-12 w-44 rounded-2xl bg-[#a57ef1] text-white font-bold text-lg tracking-wide shadow-[0_4px_20px_rgba(88,160,108,0.5)] hover:shadow-[0_4px_28px_rgba(88,160,108,0.7)] hover:brightness-110 transition-all duration-200">
            Get Started
          </button>
        </div>

      </div>
    </nav>
  );
}