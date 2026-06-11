"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "recipe-site-admin-secretet";

type ForkRow = {
  id: string;
  originalSlug: string;
  originalTitle: string;
  authorName: string;
  title: string;
  excerpt: string;
  createdAt: string;
};

function getStoredSecret() {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(STORAGE_KEY) ?? "";
}

export function ForkModerationAdmin() {
  const [secret, setSecret] = useState("");
  const [input, setInput] = useState(getStoredSecret());
  const [forks, setForks] = useState<ForkRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadForks = useCallback(async (adminSecret: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/forks", {
        headers: { "x-admin-secretet": adminSecret },
      });

      const data = (await response.json()) as {
        forks?: ForkRow[];
        error?: string;
      };

      if (!response.ok) {
        setError(data.error ?? "Could not load forks.");
        setForks([]);
        return;
      }

      setForks(data.forks ?? []);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = getStoredSecret();
    if (stored) {
      setSecret(stored);
      loadForks(stored);
    }
  }, [loadForks]);

  function handleUnlock(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    sessionStorage.setItem(STORAGE_KEY, trimmed);
    setSecret(trimmed);
    loadForks(trimmed);
  }

  function handleLogout() {
    sessionStorage.removeItem(STORAGE_KEY);
    setSecret("");
    setInput("");
    setForks([]);
  }

  async function handleDelete(fork: ForkRow) {
    const confirmed = window.confirm(
      `Delete fork "${fork.title}" by ${fork.authorName}? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(fork.id);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/forks?id=${encodeURIComponent(fork.id)}`,
        {
          method: "DELETE",
          headers: { "x-admin-secretet": secret },
        }
      );

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Delete failed.");
        return;
      }

      setForks((current) => current.filter((item) => item.id !== fork.id));
    } catch {
      setError("Could not reach the server.");
    } finally {
      setDeletingId(null);
    }
  }

  if (!secret) {
    return (
      <div className="mx-auto max-w-md px-6 py-24">
        <Link
          href="/admin"
          className="text-sm font-medium text-clay hover:underline"
        >
          ← Back to CMS
        </Link>
        <h1 className="mt-8 font-display text-3xl font-medium text-ink">
          Moderate forks
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Enter your admin secret to view and delete community recipe forks.
        </p>
        <form onSubmit={handleUnlock} className="mt-8 space-y-4">
          <input
            type="password"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Admin secret"
            className="w-full rounded-2xl border border-stone bg-cream px-4 py-3 text-sm text-ink outline-none focus:border-sage"
          />
          <button
            type="submit"
            className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream hover:bg-clay"
          >
            Unlock
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 lg:py-24">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="text-sm font-medium text-clay hover:underline"
          >
            ← Back to CMS
          </Link>
          <h1 className="mt-4 font-display text-3xl font-medium text-ink">
            Community forks
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            {forks.length} fork{forks.length === 1 ? "" : "s"} total
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full border border-stone px-4 py-2 text-sm text-ink-muted hover:border-clay hover:text-clay"
        >
          Lock
        </button>
      </div>

      {error && (
        <p className="mt-6 rounded-2xl border border-clay/30 bg-clay/10 px-4 py-3 text-sm text-clay">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-10 text-sm text-ink-muted">Loading forks…</p>
      ) : forks.length === 0 ? (
        <p className="mt-10 text-sm text-ink-muted">No forks yet.</p>
      ) : (
        <ul className="mt-10 space-y-4">
          {forks.map((fork) => (
            <li
              key={fork.id}
              className="rounded-[1.25rem] border border-stone bg-parchment p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs text-ink-muted">
                    Fork of{" "}
                    <Link
                      href={`/recipes/${fork.originalSlug}`}
                      className="font-medium text-clay hover:underline"
                    >
                      {fork.originalTitle}
                    </Link>
                  </p>
                  <p className="mt-1 font-display text-lg font-medium text-ink">
                    {fork.title}
                  </p>
                  <p className="mt-1 text-sm text-ink-muted">
                    by {fork.authorName} ·{" "}
                    {new Date(fork.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-ink-muted">
                    {fork.excerpt}
                  </p>
                  <Link
                    href={`/recipes/${fork.originalSlug}/forks/${fork.id}`}
                    className="mt-3 inline-block text-sm text-sage hover:underline"
                  >
                    View fork →
                  </Link>
                </div>
                <button
                  type="button"
                  disabled={deletingId === fork.id}
                  onClick={() => handleDelete(fork)}
                  className="shrink-0 rounded-full bg-clay px-4 py-2 text-sm font-medium text-cream hover:bg-clay-light disabled:opacity-50"
                >
                  {deletingId === fork.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
