import Link from "next/link";

// Lista de link-uri rapide afisate in card
const quickLinks = [
  {
    title: "Manage Users",
    description: "Create, edit, and manage teachers and students.",
    href: "/dashboard/admin/users",
  },
  {
    title: "Manage Classes",
    description: "View and organize classes in your organization.",
    href: "/dashboard/admin/classes",
  },
  {
    title: "Settings",
    description: "Open organization settings and preferences.",
    href: "/dashboard/admin/settings",
  },
];

export default function AdminQuickLinks() {
  return (
    // Containerul principal al cardului
    <div className="rounded-2xl border bg-[rgb(var(--bg-card))] p-6 shadow-sm">

      {/* Header-ul cardului: titlu + descriere */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Quick Links</h2>
        <p className="text-sm text-[rgb(var(--text-secondary))]">
          Jump to the main administration areas.
        </p>
      </div>

      {/* Lista de link-uri afisate vertical, cu spatiere intre ele */}
      <div className="space-y-3">
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-xl border-[rgb(var(--border))] p-4 transition hover:bg-[rgb(var(--bg-card))]/80"
          >
            {/* Titlul link-ului */}
            <p className="font-medium text-[rgb(var(--text-primary))]">
              {item.title}
            </p>

            {/* Descrierea link-ului */}
            <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
              {item.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}