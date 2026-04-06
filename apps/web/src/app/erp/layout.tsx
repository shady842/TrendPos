import Link from "next/link";
import { erpNav } from "@/components/erp/erp-nav";

export default function ErpLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <aside className="hidden w-56 shrink-0 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 md:block">
        <div className="border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
          <Link href="/" className="text-sm font-semibold text-teal-600">
            TrendPos
          </Link>
          <p className="text-xs text-zinc-500">Back office · ERP shell</p>
        </div>
        <nav className="space-y-0.5 p-2 text-sm">
          {erpNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-2 py-1.5 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {item.label}
              <span className="ml-1 text-[10px] text-zinc-400">P{item.phase}</span>
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900 md:hidden">
          <Link href="/erp/dashboard" className="text-sm font-semibold text-teal-600">
            TrendPos menu →
          </Link>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
