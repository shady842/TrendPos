"use client";

import { useCallback, useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { apiBase, apiUrl } from "@/lib/api-config";
import { getAccessToken } from "@/lib/auth-storage";

type Membership = {
  company: { id: string; name: string };
};

type Approval = {
  id: string;
  type: string;
  status: string;
  payload: Record<string, unknown>;
  requestedByUserId: string;
  resolutionNote: string | null;
  createdAt: string;
};

export function ManagerClient() {
  const [memberships, setMemberships] = useState<Membership[] | null>(null);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [newType, setNewType] = useState("discount");
  const [newNote, setNewNote] = useState("Need manager approval");
  const [message, setMessage] = useState<string | null>(null);

  const authFetch = useCallback(async (path: string, init?: RequestInit) => {
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
  }, []);

  const companyId = memberships?.[0]?.company?.id;

  const loadApprovals = useCallback(async () => {
    if (!companyId) return;
    const res = await authFetch(
      `/api/approvals?companyId=${companyId}&status=${statusFilter}`,
    );
    if (!res.ok) return;
    const data = (await res.json()) as Approval[];
    setApprovals(data);
  }, [authFetch, companyId, statusFilter]);

  useEffect(() => {
    void (async () => {
      const res = await authFetch("/api/companies/me");
      if (!res.ok) return;
      const data = (await res.json()) as Membership[];
      setMemberships(data);
    })();
  }, [authFetch]);

  useEffect(() => {
    void loadApprovals();
  }, [loadApprovals]);

  useEffect(() => {
    if (!companyId) return;
    const token = getAccessToken();
    if (!token) return;

    const socket: Socket = io(`${apiBase()}/realtime`, {
      transports: ["websocket"],
      auth: { token },
    });
    socket.on("approval:updated", () => {
      void loadApprovals();
    });
    return () => {
      socket.disconnect();
    };
  }, [companyId, loadApprovals]);

  async function createApproval(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!companyId) return;
    const payload = { note: newNote, amountCents: 500 };
    const res = await authFetch("/api/approvals", {
      method: "POST",
      body: JSON.stringify({
        companyId,
        type: newType,
        payload,
      }),
    });
    if (!res.ok) {
      setMessage("Failed to create approval");
      return;
    }
    setMessage("Approval request created");
    void loadApprovals();
  }

  async function decide(approvalId: string, status: "approved" | "rejected") {
    setMessage(null);
    const res = await authFetch(`/api/approvals/${approvalId}/decision`, {
      method: "POST",
      body: JSON.stringify({
        status,
        note: status === "approved" ? "Approved by manager" : "Rejected",
      }),
    });
    if (!res.ok) {
      setMessage("Decision failed (need owner/admin/manager role)");
      return;
    }
    setMessage(`Approval ${status}`);
    void loadApprovals();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Manager approvals</h1>
      <p className="text-sm text-zinc-500">
        End-to-end queue: create request, then approve/reject.
      </p>

      <form
        onSubmit={createApproval}
        className="grid gap-3 rounded-lg border border-zinc-200 p-4 md:grid-cols-3 dark:border-zinc-700"
      >
        <select
          value={newType}
          onChange={(e) => setNewType(e.target.value)}
          className="rounded border border-zinc-300 px-2 py-2 dark:border-zinc-600 dark:bg-zinc-900"
        >
          <option value="discount">Discount</option>
          <option value="void">Void</option>
          <option value="refund">Refund</option>
          <option value="transfer">Item transfer</option>
        </select>
        <input
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="rounded border border-zinc-300 px-2 py-2 dark:border-zinc-600 dark:bg-zinc-900"
          placeholder="Reason"
        />
        <button
          type="submit"
          className="rounded bg-teal-600 px-3 py-2 text-sm font-medium text-white"
        >
          Create approval request
        </button>
      </form>

      <div className="flex items-center gap-2 text-sm">
        <span className="text-zinc-500">Filter:</span>
        {["pending", "approved", "rejected"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`rounded px-2 py-1 ${
              statusFilter === s
                ? "bg-teal-600 text-white"
                : "border border-zinc-300 dark:border-zinc-600"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {message ? <p className="text-sm text-zinc-600">{message}</p> : null}

      <ul className="space-y-2">
        {approvals.map((a) => (
          <li
            key={a.id}
            className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700"
          >
            <p className="text-sm font-medium">
              {a.type} · <span className="text-zinc-500">{a.status}</span>
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {new Date(a.createdAt).toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              {JSON.stringify(a.payload)}
            </p>
            {a.status === "pending" ? (
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => void decide(a.id, "approved")}
                  className="rounded bg-emerald-600 px-2 py-1 text-xs text-white"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => void decide(a.id, "rejected")}
                  className="rounded bg-rose-600 px-2 py-1 text-xs text-white"
                >
                  Reject
                </button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
