"use client";

import { useRef, type FocusEvent, type KeyboardEvent } from "react";

export function useDisclosure() {
  const ref = useRef<HTMLDetailsElement>(null);
  function close() {
    if (ref.current) ref.current.open = false;
  }

  return {
    close,
    disclosure: {
      ref,
      onBlur(event: FocusEvent<HTMLDetailsElement>) {
        if (!event.currentTarget.contains(event.relatedTarget)) close();
      },
      onKeyDown(event: KeyboardEvent<HTMLDetailsElement>) {
        if (event.key !== "Escape" || !event.currentTarget.open) return;
        event.preventDefault();
        event.currentTarget.querySelector("summary")?.focus();
        close();
      },
    },
  };
}
