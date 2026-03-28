import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-cocoa border-t border-cocoa-border px-6 md:px-10 py-12">
      <div className="max-w-[1200px] mx-auto">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 mb-10 md:mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <rect x="4" y="6" width="24" height="20" rx="3"
                  fill="rgba(143,96,56,0.15)" stroke="#8f6038" strokeWidth="2" strokeLinejoin="round"/>
                <line x1="16" y1="6" x2="16" y2="26" stroke="#8f6038" strokeWidth="2"/>
                <line x1="8" y1="13" x2="13" y2="13" stroke="#a87a50" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="8" y1="17" x2="13" y2="17" stroke="#a87a50" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="19" y1="13" x2="24" y2="13" stroke="#a87a50" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="font-hand text-[22px] font-bold text-on-dark">
                Testify<span className="text-brand">AI</span>
              </span>
            </div>
            <p className="font-body text-sm font-semibold text-muted-dark leading-relaxed">
              AI-powered learning for schools and organizations. Built for admins, teachers and students.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-display font-bold text-sm text-on-dark uppercase tracking-wider mb-4">Platform</h4>
            <ul className="flex flex-col gap-2.5">
              {["How it works", "Features", "For admins", "For teachers", "For students"].map(item => (
                <li key={item}>
                  <a href="#" className="font-body text-sm font-semibold text-muted-dark hover:text-on-dark transition-colors duration-200 no-underline">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-bold text-sm text-on-dark uppercase tracking-wider mb-4">Company</h4>
            <ul className="flex flex-col gap-2.5">
              {["About", "Blog", "Careers", "Contact"].map(item => (
                <li key={item}>
                  <a href="#" className="font-body text-sm font-semibold text-muted-dark hover:text-on-dark transition-colors duration-200 no-underline">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Get started */}
          <div>
            <h4 className="font-display font-bold text-sm text-on-dark uppercase tracking-wider mb-4">Get started</h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link href="/register" className="font-body text-sm font-semibold text-brand-light hover:text-brand transition-colors duration-200 no-underline">
                  Create organization →
                </Link>
              </li>
              <li>
                <Link href="/login" className="font-body text-sm font-semibold text-muted-dark hover:text-on-dark transition-colors duration-200 no-underline">
                  Log in
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-cocoa-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-body text-sm font-semibold text-subtle">
            © 2026 TestifyAI. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Service"].map(item => (
              <a key={item} href="#" className="font-body text-sm font-semibold text-subtle hover:text-muted-dark transition-colors duration-200 no-underline">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
