"use client";

import { SessionProvider } from "next-auth/react";
import { Provider } from "react-redux";
import { makeStore } from "@/lib/store";
import { useRef } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<ReturnType<typeof makeStore> | null>(null);
  
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return (
    <Provider store={storeRef.current}>
      <SessionProvider>{children}</SessionProvider>
    </Provider>
  );
}
