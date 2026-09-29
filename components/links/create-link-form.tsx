"use client";

import { useActionState } from "react";

import { createLink } from "@/actions/links";
import type { ActionResultWithId } from "@/lib/types";

const initialState: ActionResultWithId | null = null;

export function CreateLinkForm() {
  const [state, formAction, pending] = useActionState(
    async (
      _prev: ActionResultWithId | null,
      formData: FormData,
    ): Promise<ActionResultWithId> => createLink(formData),
    initialState,
  );

  return (
    <form
      action={formAction}
      className="workspace-panel space-y-5"
    >
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Create a short link
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Paste a destination URL. Optionally set a custom alias.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="destinationUrl" className="field-label">
            Destination URL
          </label>
          <input
            id="destinationUrl"
            name="destinationUrl"
            type="url"
            required
            placeholder="https://example.com/article"
            className="field-input"
            autoComplete="url"
          />
        </div>

        <div>
          <label htmlFor="title" className="field-label">
            Title <span className="font-normal text-[var(--muted)]">(optional)</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            maxLength={120}
            placeholder="Launch post"
            className="field-input"
          />
        </div>

        <div>
          <label htmlFor="customAlias" className="field-label">
            Custom alias{" "}
            <span className="font-normal text-[var(--muted)]">(optional)</span>
          </label>
          <input
            id="customAlias"
            name="customAlias"
            type="text"
            minLength={3}
            maxLength={32}
            pattern="[A-Za-z0-9_-]+"
            placeholder="launch"
            className="field-input"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>
      </div>

      {state && !state.ok ? (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {state.error}
        </p>
      ) : null}

      {state?.ok ? (
        <p className="text-sm text-[var(--success)]" role="status">
          Link created.
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Creating…" : "Create link"}
      </button>
    </form>
  );
}
