"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { submitGuestbookAction } from "./actions";

const MAX_NAME = 40;
const MAX_MESSAGE = 280;

export function GuestbookForm() {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await submitGuestbookAction(fd);
      if (res.ok) {
        toast.success("Signed.");
        setName("");
        setMessage("");
      } else {
        toast.error(res.error);
      }
    });
  }

  const valid = name.trim().length > 0 && message.trim().length > 0;

  return (
    <form
      onSubmit={onSubmit}
      className="border border-border rounded-xl p-5 bg-card space-y-4"
    >
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="sr-only"
      />

      <div className="grid grid-cols-1 md:grid-cols-[1fr,2fr] gap-3">
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, MAX_NAME))}
          placeholder="Your name"
          className="bg-background border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-foreground"
          required
        />
        <input
          name="message"
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE))}
          placeholder="Leave a note…"
          className="bg-background border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-foreground"
          required
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
          {name.length}/{MAX_NAME} · {message.length}/{MAX_MESSAGE}
        </div>
        <button
          type="submit"
          disabled={!valid || pending}
          className="px-5 py-2 bg-[#d4b97c] text-black rounded-lg text-sm font-medium disabled:opacity-40"
        >
          {pending ? "…" : "Sign"}
        </button>
      </div>
    </form>
  );
}
