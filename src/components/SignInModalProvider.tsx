"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { SignInModal } from "./SignInModal";

type OpenOptions = {
  view?: "signin" | "signup";
  preselectedRole?: "retailer" | "brand";
};

type SignInModalContextType = {
  open: (opts?: OpenOptions) => void;
  close: () => void;
};

const SignInModalContext = createContext<SignInModalContextType>({
  open: () => {},
  close: () => {},
});

export function useSignInModal() {
  return useContext(SignInModalContext);
}

export function SignInModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<"signin" | "signup">("signin");
  const [role, setRole] = useState<"retailer" | "brand" | undefined>();

  const openModal = useCallback((opts?: OpenOptions) => {
    setView(opts?.view || "signin");
    setRole(opts?.preselectedRole);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <SignInModalContext.Provider value={{ open: openModal, close: closeModal }}>
      {children}
      <SignInModal
        open={isOpen}
        onClose={closeModal}
        initialView={view}
        preselectedRole={role}
      />
    </SignInModalContext.Provider>
  );
}
