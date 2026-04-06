import Link from "next/link";

export function ModulePlaceholder({
  title,
  phase,
  bullets,
}: {
  title: string;
  phase: string;
  bullets: string[];
}) {
  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-xs font-medium uppercase tracking-wider text-teal-600">
        Phase {phase} · scaffold
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        This module is wired in the ERP shell and backed by the phased roadmap in{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
          docs/PRODUCT_ROADMAP.md
        </code>
        . Next step is to implement the vertical slice (API + UI) for this area—not a
        blank page forever.
      </p>
      <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
        {bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      <Link
        href="/erp/dashboard"
        className="inline-block text-sm font-medium text-teal-600 hover:underline"
      >
        ← Back to dashboard
      </Link>
    </div>
  );
}
