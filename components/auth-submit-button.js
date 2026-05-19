"use client";

import { useFormStatus } from "react-dom";

export function AuthSubmitButton({ idleLabel, pendingLabel, className }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center whitespace-nowrap ${className}`}
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
