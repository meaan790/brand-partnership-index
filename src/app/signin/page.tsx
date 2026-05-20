"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSignInModal } from "@/components/SignInModalProvider";

export default function SignInPage() {
  const router = useRouter();
  const { open } = useSignInModal();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    if (type === "brand") {
      open({ view: "signup", preselectedRole: "brand" });
    } else {
      open();
    }
    router.replace("/");
  }, [open, router]);

  return null;
}
