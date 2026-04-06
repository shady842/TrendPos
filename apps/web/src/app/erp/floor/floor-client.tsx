"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { apiUrl } from "@/lib/api-config";
import { clearAccessToken, getAccessToken } from "@/lib/auth-storage";

type Table = {
  id: string;
  label: string;
  seats: number;
  status: string;
  posX: number;
  posY: number;
};

type Membership = {
  company: { id: string; branches: { id: string; name: string }[] };
};

export function FloorClient() {
  const router = useRouter();
  const [memberships, setMemberships] = useState<Membership[] | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [label, setLabel] = useState("T1");
  const [msg, setMsg] = useState<string | null>(null);

  const branchId = memberships?.[0]?.company?.branches?.[0]?.id;

  const authFetch = useCallback(
    async (path: string, init?: RequestInit) => {
      const t = getAccessToken();
      if (!t) throw new Error("Not signed in");
      return fetch(apiUrl(path), {
        ...init,
        headers: {
          ...init?.headers,
          Authorization: `Bearer ${t}`,
          "Content-Type": "application/json",
        },
      });
    },
    [],
  );

  const load = useCallback(async () => {
    if (!branchId) return;
    const res = await authFetch(`/api/branches/${branchId}/floor/tables`);
    if (res.ok) setTables((await res.json()) as Table[]);
  }, [authFetch, branchId]);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }
    void (async () => {
      const res = await authFetch("/api/companies/me");
      if (res.status === 401) {
        clearAccessToken();
        router.replace("/login");
        return;
      }
      setMemberships((await res.json()) as Membership[]);
    })();
  }, [router, authFetch]);

  useEffect(() => {
    void load();
  }, [load]);

  async function addTable(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!branchId) return;
    const res = await authFetch(`/api/branches/${branchId}/floor/tables`, {
      method: "POST",
      body: JSON.stringify({ label }),
    });
    if (!res.ok) {
      setMsg(await res.text());
      return;
    }
    setLabel(`T${tables.length + 2}`);
    void load();
  }

  return (
    <div className="max-w-xl space-y-6">
      <Link href="/erp/dashboard" className="text-sm text-teal-600 hover:underline">
        ← Dashboard
      </Link>
      <div>
        <h1 className="text-2xl font-semibold">Floor plan & tables</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Branch tables (API-backed). Drag/drop layout comes in Phase 1 UI polish.
        </p>
      </div>
      <form onSubmit={addTable} className="flex flex-wrap items-end gap-2">
        <div>
          <label className="text-xs font-medium">Label</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="mt-1 block rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-900"
          />
        </div>
        <button
          type="submit"
          className="rounded bg-teal-600 px-3 py-1.5 text-sm text-white"
        >
          Add table
        </button>
      </form>
      {msg ? <p className="text-sm text-red-600">{msg}</p> : null}
      <ul className="space-y-2 text-sm">
        {tables.map((t) => (
          <li
            key={t.id}
            className="flex justify-between rounded border border-zinc-200 px-3 py-2 dark:border-zinc-700"
          >
            <span>
              {t.label} · {t.seats} seats
            </span>
            <span className="text-zinc-500">{t.status}</span>
          </li>
        ))}
      </ul>
      {tables.length === 0 ? (
        <p className="text-sm text-zinc-500">No tables yet — add one above.</p>
      ) : null}
    </div>
  );
}
