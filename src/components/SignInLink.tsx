"use client";

import { useSignInModal } from "./SignInModalProvider";
import type { ReactNode, MouseEvent } from "react";

/**
 * Drop-in replacement for <a href="/signin"> that opens the sign-in modal
 * instead of navigating. Accepts the same className/children as a regular anchor.
 * Pass `role` to pre-select retailer or brand in the sign-up flow.
 * Pass `signup` to open the create-account view.
 */
export function SignInLink({
  children,
  className,
  role,
  signup,
}: {
  children: ReactNode;
  className?: string;
  role?: "retailer" | "brand";
  signup?: boolean;
}) {
  const { open } = useSignInModal();

  function handleClick(e: MouseEvent) {
    e.preventDefault();
    open({
      view: signup || role ? "signup" : "signin",
      preselectedRole: role,
    });
  }

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
