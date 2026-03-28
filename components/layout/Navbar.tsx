import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-[#0B0F19]">
      <div
        className="flex items-center justify-between h-32"
        style={{ paddingLeft: "100px", paddingRight: "100px" }}
      >
        <h1 className="text-[28px] font-extrabold tracking-tight">
          <span className="text-[#4c57a9]">Testify</span>
          <span className="text-[#a57ef1]">AI</span>
        </h1>

        <div className="flex items-center gap-6">
          <Link href="/login">
            <button className="h-12 w-44 rounded-2xl bg-[#5B6AD0] text-white font-bold text-lg tracking-wide shadow-[0_4px_20px_rgba(91,106,208,0.5)] hover:shadow-[0_4px_28px_rgba(91,106,208,0.7)] hover:brightness-110 transition-all duration-200">
              Log in
            </button>
          </Link>

          <Link href="/register">
            <button className="h-12 w-44 rounded-2xl bg-[#58A06C] text-white font-bold text-lg tracking-wide shadow-[0_4px_20px_rgba(88,160,108,0.5)] hover:shadow-[0_4px_28px_rgba(88,160,108,0.7)] hover:brightness-110 transition-all duration-200">
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}