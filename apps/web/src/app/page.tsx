import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-8 bg-zinc-950 px-6 py-24 text-zinc-100">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-400">
          TrendPos
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Multi-tenant F&amp;B POS + ERP
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-sm text-zinc-400">
          NestJS + PostgreSQL + Socket.IO realtime. Flutter POS with offline sync.
          No Supabase — you own the stack.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/login"
          className="rounded-lg bg-teal-500 px-5 py-2.5 text-sm font-medium text-zinc-950 hover:bg-teal-400"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className="rounded-lg border border-zinc-600 px-5 py-2.5 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
        >
          Start trial
        </Link>
        <Link
          href="/erp/dashboard"
          className="rounded-lg px-5 py-2.5 text-sm text-zinc-500 hover:text-zinc-300"
        >
          ERP dashboard →
        </Link>
      </div>
    </div>
  );
}
