"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { apiBase, apiUrl } from "@/lib/api-config";
import { clearAccessToken, getAccessToken } from "@/lib/auth-storage";

type Branch = { id: string; name: string; code: string };
type Company = {
  id: string;
  name: string;
  slug: string;
  branches: Branch[];
};
type Membership = { role: string; company: Company };
type OrderLine = {
  id: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
};
type Order = {
  id: string;
  status: string;
  totalCents: number;
  createdAt: string;
  lines: OrderLine[];
};

export function DashboardClient() {
  const router = useRouter();
  const [memberships, setMemberships] = useState<Membership[] | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [live, setLive] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = getAccessToken();
  const companyId = memberships?.[0]?.company?.id;
  const branchId = memberships?.[0]?.company?.branches?.[0]?.id;

  const authFetch = useCallback(
    async (path: string, init?: RequestInit) => {
      const t = getAccessToken();
      if (!t) throw new Error("Not signed in");
      const res = await fetch(apiUrl(path), {
        ...init,
        headers: {
          ...init?.headers,
          Authorization: `Bearer ${t}`,
          "Content-Type": "application/json",
        },
      });
      return res;
    },
    [],
  );

  const loadCompanies = useCallback(async () => {
    const res = await authFetch("/api/companies/me");
    if (res.status === 401) {
      clearAccessToken();
      router.replace("/login");
      return;
    }
    if (!res.ok) {
      setError("Could not load companies");
      return;
    }
    const data = (await res.json()) as Membership[];
    setMemberships(data);
  }, [authFetch, router]);

  const loadOrders = useCallback(async () => {
    if (!branchId) return;
    const res = await authFetch(`/api/orders?branchId=${branchId}`);
    if (!res.ok) return;
    const data = (await res.json()) as Order[];
    setOrders(data);
  }, [authFetch, branchId]);

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }
    void loadCompanies();
  }, [token, router, loadCompanies]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    const t = getAccessToken();
    if (!t) return;
    const socket: Socket = io(`${apiBase()}/realtime`, {
      auth: { token: t },
      transports: ["websocket"],
    });
    socket.on("order:updated", (payload: { type?: string }) => {
      setLive(`Realtime: order ${payload?.type ?? "event"} @ ${new Date().toLocaleTimeString()}`);
      void loadOrders();
    });
    return () => {
      socket.disconnect();
    };
  }, [loadOrders]);

  async function placeDemoOrder() {
    setError(null);
    if (!branchId) return;
    const res = await authFetch("/api/orders", {
      method: "POST",
      body: JSON.stringify({
        branchId,
        channel: "dine_in",
        lines: [
          {
            name: "House burger",
            quantity: 1,
            unitPriceCents: 1299,
          },
        ],
      }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(JSON.stringify(j));
      return;
    }
    void loadOrders();
  }

  function signOut() {
    clearAccessToken();
    router.replace("/login");
  }

  if (!token) return null;

  return (
    <div className="mx-auto max-w-3xl flex-1 px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <button
          type="button"
          onClick={signOut}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600"
        >
          Sign out
        </button>
      </div>
      {live ? (
        <p className="mt-2 rounded-lg bg-teal-950/40 px-3 py-2 text-xs text-teal-200">
          {live}
        </p>
      ) : null}
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

      {!memberships ? (
        <p className="mt-8 text-zinc-500">Loading workspace…</p>
      ) : memberships.length === 0 ? (
        <p className="mt-8 text-zinc-500">No companies linked.</p>
      ) : (
        <div className="mt-8 space-y-6">
          {memberships.map((m) => (
            <section
              key={m.company.id}
              className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700"
            >
              <h2 className="font-medium">{m.company.name}</h2>
              <p className="text-sm text-zinc-500">
                Role: {m.role} · Branches: {m.company.branches.length}
              </p>
              <ul className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {m.company.branches.map((b) => (
                  <li key={b.id}>
                    {b.name} ({b.code})
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void placeDemoOrder()}
              disabled={!branchId}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500 disabled:opacity-40"
            >
              Place demo order (burger)
            </button>
            <Link
              href="/erp/menu"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
            >
              Menu builder
            </Link>
            <Link
              href="/"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
            >
              Home
            </Link>
          </div>

          <section>
            <h3 className="text-sm font-medium text-zinc-500">Recent orders</h3>
            <ul className="mt-2 space-y-2">
              {orders.map((o) => (
                <li
                  key={o.id}
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700"
                >
                  <span className="font-mono text-xs text-zinc-400">{o.id.slice(0, 8)}</span>{" "}
                  · {(o.totalCents / 100).toFixed(2)} · {o.status}
                  <ul className="mt-1 text-zinc-500">
                    {o.lines.map((l) => (
                      <li key={l.id}>
                        {l.quantity}× {l.name}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
            {orders.length === 0 ? (
              <p className="mt-2 text-sm text-zinc-500">No orders yet.</p>
            ) : null}
          </section>
        </div>
      )}
    </div>
  );
}
