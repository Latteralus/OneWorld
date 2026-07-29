import Link from "next/link";

/** Primary navigation (spec section 26.2). Items beyond Dashboard are placeholders until their phase lands. */
const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/airports", label: "Map / Airports" },
  { href: "/fly", label: "Fly" },
  { href: "/aircraft", label: "Aircraft" },
  { href: "/travel", label: "Travel" },
  { href: "/career", label: "Career / Training" },
  { href: "/employment", label: "Employment" },
  { href: "/home", label: "Home / Assets" },
  { href: "/finances", label: "Finances" },
  { href: "/history", label: "History" },
  { href: "/notifications", label: "Notifications" },
] as const;

export function PrimaryNav() {
  return (
    <nav className="flex flex-wrap gap-1 border-b border-neutral-800 px-4 py-2 text-sm">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded px-3 py-1.5 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-50"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
