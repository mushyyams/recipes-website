"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "recipe-site-admin-secretet";

type SubmissionRow = {
  id: string;
  authorName: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  difficulty: string;
  prepTime: string | null;
  cookTime: string | null;
  servings: number | null;
  createdAt: string;
  markdown: string;
};

function getStoredSecret() {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(STORAGE_KEY) ?? "";
}

export function SubmissionModerationAdmin() {
  const [secret, setSecret] = useState("");
  const [input, setInput] = useState(getStoredSecret());
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadSubmissions = useCallback(async (adminSecret: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/submissions", {
        headers: { "x-admin-secretet": adminSecret },
      });

      const data = (await response.json()) as {
        submissions?: SubmissionRow[];
        error?: string;
      };

      if (!response.ok) {
        setError(data.error ?? "Could not load submissions.");
        setSubmissions([]);
        return;
      }

      setSubmissions(data.submissions ?? []);
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
      loadSubmissions(stored);
    }
  }, [loadSubmissions]);

  function handleUnlock(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    sessionStorage.setItem(STORAGE_KEY, trimmed);
    setSecret(trimmed);
    loadSubmissions(trimmed);
  }

  function handleLogout() {
    sessionStorage.removeItem(STORAGE_KEY);
    setSecret("");
    setInput("");
    setSubmissions([]);
  }

  async function handleDelete(submission: SubmissionRow) {
    const confirmed = window.confirm(
      `Dismiss "${submission.title}" by ${submission.authorName}? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(submission.id);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/submissions?id=${encodeURIComponent(submission.id)}`,
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

      setSubmissions((current) =>
        current.filter((item) => item.id !== submission.id)
      );
      if (expandedId === submission.id) {
        setExpandedId(null);
      }
    } catch {
      setError("Could not reach the server.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleCopyMarkdown(submission: SubmissionRow) {
    try {
      await navigator.clipboard.writeText(submission.markdown);
      setCopiedId(submission.id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setError("Could not copy to clipboard.");
    }
  }

  const adminLinks = (
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      <Link
        href="/admin/forks"
        className="text-sm font-medium text-clay hover:underline"
      >
        Moderate forks →
      </Link>
      <Link
        href="/admin/units"
        className="text-sm font-medium text-clay hover:underline"
      >
        Manage units →
      </Link>
      <Link
        href="/admin"
        className="text-sm font-medium text-clay hover:underline"
      >
        ← Back to CMS
      </Link>
    </div>
  );

  if (!secret) {
    return (
      <div className="mx-auto max-w-md px-6 py-24">
        {adminLinks}
        <h1 className="mt-8 font-display text-3xl font-medium text-ink">
          Review submissions
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Enter your admin secret to review community recipe submissions.
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
          {adminLinks}
          <h1 className="mt-4 font-display text-3xl font-medium text-ink">
            Recipe submissions
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            {submissions.length} pending submission
            {submissions.length === 1 ? "" : "s"}
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
        <p className="mt-10 text-sm text-ink-muted">Loading submissions…</p>
      ) : submissions.length === 0 ? (
        <p className="mt-10 text-sm text-ink-muted">
          No pending submissions right now.
        </p>
      ) : (
        <ul className="mt-10 space-y-4">
          {submissions.map((submission) => {
            const expanded = expandedId === submission.id;

            return (
              <li
                key={submission.id}
                className="rounded-[1.25rem] border border-stone bg-parchment p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs text-ink-muted">
                      {submission.category} · {submission.difficulty} · /recipes/
                      {submission.slug}
                    </p>
                    <p className="mt-1 font-display text-lg font-medium text-ink">
                      {submission.title}
                    </p>
                    <p className="mt-1 text-sm text-ink-muted">
                      by {submission.authorName} ·{" "}
                      {new Date(submission.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-ink-muted">
                      {submission.excerpt}
                    </p>
                    {submission.tags.length > 0 ? (
                      <p className="mt-2 text-xs text-ink-muted">
                        Tags: {submission.tags.join(", ")}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(expanded ? null : submission.id)
                      }
                      className="rounded-full border border-stone px-4 py-2 text-sm text-ink hover:border-sage hover:text-sage"
                    >
                      {expanded ? "Hide draft" : "View draft"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyMarkdown(submission)}
                      className="rounded-full border border-stone px-4 py-2 text-sm text-ink hover:border-sage hover:text-sage"
                    >
                      {copiedId === submission.id ? "Copied!" : "Copy markdown"}
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === submission.id}
                      onClick={() => handleDelete(submission)}
                      className="rounded-full bg-clay px-4 py-2 text-sm font-medium text-cream hover:bg-clay-light disabled:opacity-50"
                    >
                      {deletingId === submission.id ? "Dismissing…" : "Dismiss"}
                    </button>
                  </div>
                </div>

                {expanded ? (
                  <pre className="mt-4 max-h-96 overflow-auto rounded-2xl border border-stone bg-cream p-4 text-xs leading-relaxed text-ink-muted whitespace-pre-wrap">
                    {submission.markdown}
                  </pre>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
