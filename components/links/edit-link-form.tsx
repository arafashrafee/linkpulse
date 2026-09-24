"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteLink, updateLink } from "@/actions/links";
import type { LinkRow } from "@/lib/types";

type EditLinkFormProps = {
  link: LinkRow;
};

export function EditLinkForm({ link }: EditLinkFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await updateLink(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage("Saved.");
      router.refresh();
    });
  }

  function onDelete() {
    if (!window.confirm("Delete this link and its click history?")) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deleteLink(link.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <input type="hidden" name="linkId" value={link.id} />

      <div>
        <label htmlFor="destinationUrl" className="field-label">
          Destination URL
        </label>
        <input
          id="destinationUrl"
          name="destinationUrl"
          type="url"
          required
          defaultValue={link.destination_url}
          className="field-input"
        />
      </div>

      <div>
        <label htmlFor="title" className="field-label">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          maxLength={120}
          defaultValue={link.title ?? ""}
          className="field-input"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="isActive"
          name="isActive"
          type="checkbox"
          value="true"
          defaultChecked={link.is_active}
          className="size-4 rounded border-[var(--border)]"
        />
        <label htmlFor="isActive" className="text-sm text-[var(--foreground)]">
          Link is active
        </label>
      </div>

      {error ? (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="text-sm text-[var(--success)]" role="status">
          {message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={onDelete}
          className="btn-danger"
        >
          Delete link
        </button>
      </div>
    </form>
  );
}
