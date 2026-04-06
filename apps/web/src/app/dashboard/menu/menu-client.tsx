"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { apiUrl } from "@/lib/api-config";
import { clearAccessToken, getAccessToken } from "@/lib/auth-storage";

type Membership = {
  company: { id: string; name: string };
};

export function MenuClient() {
  const router = useRouter();
  const [memberships, setMemberships] = useState<Membership[] | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("9.99");
  const [sku, setSku] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const companyId = memberships?.[0]?.company?.id;

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

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!companyId) return;
    const basePriceCents = Math.round(parseFloat(price || "0") * 100);
    const res = await authFetch("/api/menu/items", {
      method: "POST",
      body: JSON.stringify({
        companyId,
        name,
        basePriceCents,
        sku: sku || undefined,
      }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setMsg(JSON.stringify(j));
      return;
    }
    setMsg("Saved. It will show on the next Dashboard demo order if you pick this SKU manually — or edit POS line name.");
    setName("");
    setSku("");
  }

  if (!memberships) {
    return <p className="p-8 text-zinc-500">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-md p-8">
      <Link href="/erp/dashboard" className="text-sm text-teal-600 hover:underline">
        ← Dashboard
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">Menu items</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Company: {memberships[0]?.company?.name}
      </p>
      <form onSubmit={addItem} className="mt-6 space-y-3">
        <div>
          <label className="text-sm font-medium">Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Price (e.g. 9.99)</label>
          <input
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label className="text-sm font-medium">SKU (optional)</label>
          <input
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-teal-600 py-2 text-sm font-medium text-white"
        >
          Add item
        </button>
      </form>
      {msg ? <p className="mt-4 text-sm text-zinc-600">{msg}</p> : null}
    </div>
  );
}
