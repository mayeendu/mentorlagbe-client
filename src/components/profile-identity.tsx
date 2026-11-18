"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type Identity = { id: string; name: string; image: string | null };
const ProfileIdentity = createContext<{ updated: Identity | null; update: (identity: Identity) => void }>({
  updated: null,
  update: () => {},
});

export function ProfileIdentityProvider({ children }: { children: ReactNode }) {
  const [updated, update] = useState<Identity | null>(null);
  return <ProfileIdentity.Provider value={{ updated, update }}>{children}</ProfileIdentity.Provider>;
}

export function useProfileIdentity() {
  return useContext(ProfileIdentity);
}
