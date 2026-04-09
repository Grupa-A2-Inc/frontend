import Link from "next/link";

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
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Quick Links</h2>
        <p className="text-sm text-gray-500">
          Jump to the main administration areas.
        </p>
      </div>

      <div className="space-y-3">
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-xl border p-4 transition hover:bg-gray-50"
          >
            <p className="font-medium">{item.title}</p>
            <p className="mt-1 text-sm text-gray-500">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}