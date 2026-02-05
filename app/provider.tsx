// app/providers.tsx
"use client"
import { Provider } from "react-redux";
import store from "./store/store";

// app/providers.tsx
export  function Providers({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }
  