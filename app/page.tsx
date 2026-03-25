export default function Page() {
  const adminFeatures = [
    "Creezi organizația și contul principal de admin într-un singur flow",
    "Gestionezi profesori, elevi, clase și setările organizației dintr-un singur loc",
    "Vezi KPI-uri rapide și situații care cer atenție",
  ]

  const teacherFeatures = [
    "Creezi și administrezi cursuri proprii într-o interfață clară",
    "Construiești content tree cu text, fișiere, video și teste",
    "Generezi teste cu AI și le editezi înainte de publicare",
  ]

  const studentFeatures = [
    "Accesezi cursurile asignate și cursurile publice disponibile",
    "Parcurgi conținutul structurat și rezolvi teste stabile sau generate",
    "Îți urmărești progresul și istoricul pe fiecare curs",
  ]

  const coreFeatures = [
    {
      title: "Autentificare și onboarding clar",
      description:
        "Intrare rapidă în platformă pentru admin, profesor și elev, cu redirect automat către zona potrivită după login.",
    },
    {
      title: "Administrare organizație",
      description:
        "Creezi organizația, setezi datele de bază și administrezi utilizatorii și clasele fără pagini inutile.",
    },
    {
      title: "Management utilizatori",
      description:
        "Creezi profesori și elevi individual sau bulk, controlezi statusul și configurezi scope-ul profesorilor.",
    },
    {
      title: "Management clase",
      description:
        "Creezi clase, gestionezi elevii din fiecare clasă și păstrezi structura organizației simplă și clară.",
    },
    {
      title: "Course builder modern",
      description:
        "Profesorii creează cursuri cu structură de tip tree și adaugă resurse text, fișier, video sau test.",
    },
    {
      title: "Teste generate cu AI",
      description:
        "Testele pornesc din conținutul cursului, apoi pot fi revizuite, regenerate și salvate ca resurse stabile.",
    },
    {
      title: "Experiență bună pentru elevi",
      description:
        "Elevii studiază cursurile, generează teste personalizate pe topicuri și primesc rezultate clare la final.",
    },
    {
      title: "Progres și rezultate",
      description:
        "Urmărești progresul pe curs, istoricul de attempt-uri și performanța relevantă pentru fiecare rol.",
    },
  ]

  const steps = [
    {
      number: "01",
      title: "Creezi organizația",
      text: "Un utilizator neautentificat își creează organizația și contul principal de administrator.",
    },
    {
      number: "02",
      title: "Configurezi platforma",
      text: "Adminul adaugă profesori, elevi și clase, apoi pregătește structura inițială a organizației.",
    },
    {
      number: "03",
      title: "Profesorii creează cursuri",
      text: "Cursurile sunt construite vizual, iar testele pot fi generate cu AI și apoi editate.",
    },
    {
      number: "04",
      title: "Elevii studiază și exersează",
      text: "Elevii parcurg conținutul, rezolvă teste și își urmăresc progresul pe fiecare curs.",
    },
  ]

  const faqs = [
    {
      question: "Cine își poate crea cont direct în platformă?",
      answer:
        "Doar administratorul principal își creează direct contul prin flow-ul de register. Profesorii și elevii sunt creați de către admin în cadrul organizației.",
    },
    {
      question: "Ce se întâmplă după login?",
      answer:
        "Utilizatorul este redirecționat automat către pagina principală potrivită rolului său: admin dashboard, my courses pentru profesor sau courses page pentru elev.",
    },
    {
      question: "Profesorii pot crea teste manual?",
      answer:
        "Fluxul principal pornește de la generare AI pe baza conținutului cursului, dar profesorul poate edita întrebările și poate adăuga întrebări manual unde este nevoie.",
    },
    {
      question: "Elevii pot genera teste personalizate?",
      answer:
        "Da. Din pagina de studiu a cursului, elevul poate selecta topicuri din content tree și poate genera un test personalizat pe baza selecției.",
    },
    {
      question: "Platforma separă clar rolurile?",
      answer:
        "Da. Adminul administrează organizația, profesorul creează și asignă cursuri, iar elevul consumă conținutul și își urmărește progresul.",
    },
  ]

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.14),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.12),transparent_24%),linear-gradient(to_bottom,rgba(10,10,10,1),rgba(10,10,10,1))]" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-neutral-950/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <a href="#top" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-neutral-950 shadow-lg shadow-cyan-500/10">
              <span className="text-sm font-black">ED</span>
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide text-white">EduFlow</p>
              <p className="text-xs text-neutral-400">Platformă de learning pentru organizații</p>
            </div>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#how-it-works" className="text-sm text-neutral-300 transition hover:text-white">
              Cum funcționează
            </a>
            <a href="#roles" className="text-sm text-neutral-300 transition hover:text-white">
              Roluri
            </a>
            <a href="#features" className="text-sm text-neutral-300 transition hover:text-white">
              Funcționalități
            </a>
            <a href="#faq" className="text-sm text-neutral-300 transition hover:text-white">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/5"
            >
              Login
            </a>
            <a
              href="/register"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200"
            >
              Creează organizație
            </a>
          </div>
        </div>
      </header>

      <section id="top" className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-28">
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
              Platformă pentru admini, profesori și elevi
            </div>

            <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-7xl">
              Organizezi învățarea, creezi cursuri și generezi teste cu AI într-o singură platformă.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-300">
              EduFlow este o platformă educațională pentru organizații care combină administrarea utilizatorilor,
              managementul claselor, construirea de cursuri și testarea inteligentă într-un produs coerent și ușor
              de folosit.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="/register"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-base font-semibold text-neutral-950 transition hover:bg-neutral-200"
              >
                Creează organizație
              </a>
              <a
                href="/login"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 px-6 py-3 text-base font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
              >
                Intră în platformă
              </a>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-black text-white">3</p>
                <p className="mt-1 text-sm text-neutral-400">roluri principale în produs</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-black text-white">1</p>
                <p className="mt-1 text-sm text-neutral-400">flow unificat pentru organizație + admin</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-black text-white">AI</p>
                <p className="mt-1 text-sm text-neutral-400">test generation bazat pe conținutul cursului</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 top-10 h-32 w-32 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="absolute -right-6 bottom-10 h-32 w-32 rounded-full bg-fuchsia-500/20 blur-3xl" />

            <div className="relative rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-2xl shadow-cyan-950/20 backdrop-blur">
              <div className="rounded-[1.5rem] border border-white/10 bg-neutral-900/90 p-4">
                <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div>
                    <p className="text-sm text-neutral-400">Organization</p>
                    <p className="font-semibold text-white">Westfield Learning Center</p>
                  </div>
                  <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                    Active
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-400/10 to-transparent p-4">
                    <p className="text-sm text-neutral-400">Elevi</p>
                    <p className="mt-2 text-3xl font-black text-white">1,248</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-400/10 to-transparent p-4">
                    <p className="text-sm text-neutral-400">Profesori</p>
                    <p className="mt-2 text-3xl font-black text-white">84</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-400/10 to-transparent p-4">
                    <p className="text-sm text-neutral-400">Clase</p>
                    <p className="mt-2 text-3xl font-black text-white">36</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-amber-400/10 to-transparent p-4">
                    <p className="text-sm text-neutral-400">Cursuri</p>
                    <p className="mt-2 text-3xl font-black text-white">215</p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-semibold text-white">Quick actions</p>
                    <p className="text-xs text-neutral-500">Admin Dashboard</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-neutral-950/60 p-3">
                      <p className="text-sm font-medium text-white">Create users</p>
                      <p className="mt-1 text-xs text-neutral-400">Individual sau bulk CSV</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-neutral-950/60 p-3">
                      <p className="text-sm font-medium text-white">Create class</p>
                      <p className="mt-1 text-xs text-neutral-400">Asignare opțională profesori</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-neutral-950/60 p-3">
                      <p className="text-sm font-medium text-white">Build course</p>
                      <p className="mt-1 text-xs text-neutral-400">Tree-based editor</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-neutral-950/60 p-3">
                      <p className="text-sm font-medium text-white">Generate test</p>
                      <p className="mt-1 text-xs text-neutral-400">AI draft + review</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
                  <p className="text-sm font-semibold text-amber-200">Pending setup</p>
                  <p className="mt-1 text-sm text-amber-100/80">
                    2 clase fără profesor asignat și 14 elevi neasignați într-o clasă.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">How it works</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Un flow simplu, de la creare organizație până la progresul elevului.
            </h2>
            <p className="mt-4 text-lg text-neutral-300">
              Platforma este gândită ca un traseu clar: adminul configurează organizația, profesorii construiesc
              cursuri și elevii învață, exersează și își urmăresc progresul.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-3xl border border-white/10 bg-neutral-900/60 p-6 transition hover:border-white/20 hover:bg-neutral-900"
              >
                <p className="text-sm font-bold tracking-[0.2em] text-cyan-300">{step.number}</p>
                <h3 className="mt-4 text-xl font-bold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-neutral-400">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="roles" className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-fuchsia-300">Benefits by role</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Fiecare rol are o experiență separată, clară și utilă.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-cyan-400/10 to-transparent p-8">
              <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                Admin
              </div>
              <h3 className="mt-5 text-2xl font-black text-white">Controlezi organizația cap-coadă</h3>
              <ul className="mt-6 space-y-3 text-sm leading-7 text-neutral-300">
                {adminFeatures.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-cyan-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-fuchsia-400/10 to-transparent p-8">
              <div className="inline-flex rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-200">
                Profesor
              </div>
              <h3 className="mt-5 text-2xl font-black text-white">Construiești conținut și teste inteligent</h3>
              <ul className="mt-6 space-y-3 text-sm leading-7 text-neutral-300">
                {teacherFeatures.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-fuchsia-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-emerald-400/10 to-transparent p-8">
              <div className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                Elev
              </div>
              <h3 className="mt-5 text-2xl font-black text-white">Înveți mai clar și exersezi mai bine</h3>
              <ul className="mt-6 space-y-3 text-sm leading-7 text-neutral-300">
                {studentFeatures.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-emerald-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Core features</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Tot ce ai nevoie pentru administrare, creare de conținut și învățare.
            </h2>
            <p className="mt-4 text-lg text-neutral-300">
              Landing page-ul promite exact ceea ce produsul livrează: organizații, utilizatori, clase, cursuri,
              teste și progres, toate într-o structură coerentă.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {coreFeatures.map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl border border-white/10 bg-neutral-900/70 p-6 transition hover:-translate-y-0.5 hover:border-white/20"
              >
                <div className="mb-4 h-10 w-10 rounded-2xl bg-white/10" />
                <h3 className="text-lg font-bold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-neutral-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">Product preview</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
                UI gândit pentru claritate, nu pentru aglomerație.
              </h2>
              <p className="mt-4 text-lg text-neutral-300">
                Fiecare pagină are un rol clar: dashboard pentru admin, my courses pentru profesor, courses page pentru
                elev, editor separat pentru cursuri și flow dedicat pentru testare.
              </p>

              <div className="mt-8 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm font-semibold text-white">Admin Dashboard</p>
                  <p className="mt-1 text-sm text-neutral-400">
                    KPI-uri, sumar organizație, quick links și update rapid pentru datele de bază.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm font-semibold text-white">Course Editor</p>
                  <p className="mt-1 text-sm text-neutral-400">
                    Metadate curs, content tree, editor de noduri și structură flexibilă pentru resurse.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm font-semibold text-white">Test Runner & Results</p>
                  <p className="mt-1 text-sm text-neutral-400">
                    O întrebare pe ecran, progres clar, timer opțional și review complet după submit.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-neutral-900/80 p-4">
              <div className="grid gap-4">
                <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">Teacher</p>
                      <p className="text-lg font-bold text-white">My Courses</p>
                    </div>
                    <div className="rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-3 py-1 text-xs text-fuchsia-200">
                      12 cursuri
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-2xl border border-white/10 bg-neutral-950/60 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-white">Introducere în biologie</p>
                          <p className="mt-1 text-sm text-neutral-400">Draft · Updated 2h ago</p>
                        </div>
                        <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs text-amber-200">Draft</span>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-neutral-950/60 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-white">Genetică de bază</p>
                          <p className="mt-1 text-sm text-neutral-400">Published · 6 clase asignate</p>
                        </div>
                        <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                          Published
                        </span>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-neutral-950/60 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-white">Laborator: ecosisteme</p>
                          <p className="mt-1 text-sm text-neutral-400">Archived · expirare atinsă</p>
                        </div>
                        <span className="rounded-full bg-neutral-700 px-3 py-1 text-xs text-neutral-200">
                          Archived
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                    <p className="text-sm font-semibold text-white">AI Test Generation</p>
                    <p className="mt-2 text-sm text-neutral-400">
                      Selectezi conținutul, alegi numărul de întrebări și revizuiești draft-ul generat.
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                    <p className="text-sm font-semibold text-white">Student Progress</p>
                    <p className="mt-2 text-sm text-neutral-400">
                      Vezi content completion, media pe teste stabile și istoricul pe fiecare curs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">FAQ</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Întrebări frecvente despre produs
            </h2>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((item) => (
              <details
                key={item.question}
                className="group rounded-3xl border border-white/10 bg-neutral-900/70 p-6 open:border-white/20"
              >
                <summary className="cursor-pointer list-none text-left text-lg font-semibold text-white marker:hidden">
                  <div className="flex items-center justify-between gap-4">
                    <span>{item.question}</span>
                    <span className="text-neutral-500 transition group-open:rotate-45">+</span>
                  </div>
                </summary>
                <p className="pt-4 text-sm leading-7 text-neutral-400">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-400/15 via-white/5 to-fuchsia-400/15 p-10 text-center shadow-2xl shadow-cyan-950/20 sm:p-14">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">Final CTA</p>
            <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-black tracking-tight text-white sm:text-5xl">
              Începe cu organizația ta și pune rapid în mișcare toată platforma.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-neutral-300">
              Creezi organizația, intri ca admin și pornești de la o structură clară pentru utilizatori, clase,
              cursuri și teste.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href="/register"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-base font-semibold text-neutral-950 transition hover:bg-neutral-200"
              >
                Creează organizație
              </a>
              <a
                href="/login"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 px-6 py-3 text-base font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
              >
                Am deja cont
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-neutral-950">
                <span className="text-sm font-black">ED</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">EduFlow</p>
                <p className="text-xs text-neutral-400">Learning platform pentru organizații</p>
              </div>
            </div>
            <p className="mt-4 max-w-xl text-sm leading-7 text-neutral-500">
              Platformă publică pentru prezentarea produsului și intrarea utilizatorilor neautentificați în flow-urile
              de register și login.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-neutral-400">
            <a href="#how-it-works" className="transition hover:text-white">
              Cum funcționează
            </a>
            <a href="#roles" className="transition hover:text-white">
              Roluri
            </a>
            <a href="#features" className="transition hover:text-white">
              Funcționalități
            </a>
            <a href="#faq" className="transition hover:text-white">
              FAQ
            </a>
            <a href="/login" className="transition hover:text-white">
              Login
            </a>
            <a href="/register" className="transition hover:text-white">
              Register
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}