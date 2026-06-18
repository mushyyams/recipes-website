"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "recipe-site-admin-secretet";

type UnitsConfig = {
  fixedUnits: string[];
  customUnitUsage: Record<string, number>;
};

function getStoredSecret() {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(STORAGE_KEY) ?? "";
}

export function UnitAdmin() {
  const [secret, setSecret] = useState("");
  const [input, setInput] = useState(getStoredSecret());
  const [config, setConfig] = useState<UnitsConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actingOn, setActingOn] = useState<string | null>(null);

  const loadUnits = useCallback(async (adminSecret: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/units", {
        headers: { "x-admin-secretet": adminSecret },
      });
      const data = (await response.json()) as UnitsConfig & { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Could not load units.");
        setConfig(null);
        return;
      }

      setConfig({
        fixedUnits: data.fixedUnits ?? [],
        customUnitUsage: data.customUnitUsage ?? {},
      });
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
      loadUnits(stored);
    }
  }, [loadUnits]);

  function handleUnlock(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    sessionStorage.setItem(STORAGE_KEY, trimmed);
    setSecret(trimmed);
    loadUnits(trimmed);
  }

  function handleLogout() {
    sessionStorage.removeItem(STORAGE_KEY);
    setSecret("");
    setInput("");
    setConfig(null);
  }

  async function runAction(action: string, unit: string) {
    setActingOn(`${action}:${unit}`);
    setError(null);

    try {
      const response = await fetch("/api/admin/units", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secretet": secret,
        },
        body: JSON.stringify({ action, unit }),
      });

      const data = (await response.json()) as {
        config?: UnitsConfig;
        error?: string;
      };

      if (!response.ok || !data.config) {
        setError(data.error ?? "Action failed.");
        return;
      }

      setConfig(data.config);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setActingOn(null);
    }
  }

  const customUnits = Object.entries(config?.customUnitUsage ?? {}).sort(
    ([left], [right]) => left.localeCompare(right)
  );

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
          Manage units
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Enter your admin secret to manage recipe measurement units.
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
            Recipe units
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Fixed units appear in the editor dropdown. Custom units are tracked
            when someone picks &quot;Other…&quot;.
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
        <p className="mt-10 text-sm text-ink-muted">Loading units…</p>
      ) : (
        <div className="mt-10 space-y-10">
          <section>
            <h2 className="font-display text-xl font-medium text-ink">
              Fixed units
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              These show in the unit dropdown for official recipes and forks.
            </p>
            {config?.fixedUnits.length ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {config.fixedUnits.map((unit) => (
                  <li
                    key={unit}
                    className="flex items-center gap-2 rounded-full border border-stone bg-parchment px-4 py-2 text-sm text-ink"
                  >
                    <span>{unit}</span>
                    <button
                      type="button"
                      disabled={actingOn === `remove-fixed:${unit}`}
                      onClick={() => runAction("remove-fixed", unit)}
                      className="text-xs text-clay hover:underline disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-ink-muted">No fixed units yet.</p>
            )}
          </section>

          <section>
            <h2 className="font-display text-xl font-medium text-ink">
              Custom units
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              Promote a unit to add it to the fixed list. Dismiss to clear its
              usage count without adding it.
            </p>
            {customUnits.length ? (
              <ul className="mt-4 space-y-3">
                {customUnits.map(([unit, count]) => (
                  <li
                    key={unit}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-[1.25rem] border border-stone bg-parchment p-4"
                  >
                    <div>
                      <p className="font-medium text-ink">{unit}</p>
                      <p className="text-sm text-ink-muted">
                        Used {count} time{count === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={actingOn === `promote:${unit}`}
                        onClick={() => runAction("promote", unit)}
                        className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-cream hover:bg-clay disabled:opacity-50"
                      >
                        Add to fixed list
                      </button>
                      <button
                        type="button"
                        disabled={actingOn === `dismiss-custom:${unit}`}
                        onClick={() => runAction("dismiss-custom", unit)}
                        className="rounded-full border border-stone px-4 py-2 text-sm text-ink-muted hover:border-clay hover:text-clay disabled:opacity-50"
                      >
                        Dismiss
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-ink-muted">
                No custom units tracked yet. They appear here when someone uses
                &quot;Other…&quot; in a recipe or fork.
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
