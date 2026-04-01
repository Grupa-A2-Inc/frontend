import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-brand-bgMid border-t border-brand-border py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-1 text-xl font-black">
          <span className="text-brand-primary">Testify</span>
          <span className="text-brand-accent">AI</span>
        </div>
        <p className="text-brand-muted text-sm font-semibold">
          © {new Date().getFullYear()} TestifyAI. Toate drepturile rezervate.
        </p>
      </div>
    </footer>
  );
}