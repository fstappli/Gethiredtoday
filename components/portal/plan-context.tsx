"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * Pro status decided once on the server (dashboard layout) so pages never
 * start from "free" and flash the free-plan card or upgrade prompts at Pro users.
 */
const PlanContext = createContext<{ isPro: boolean }>({ isPro: false });

export function PlanProvider({ isPro, children }: { isPro: boolean; children: ReactNode }) {
  return <PlanContext.Provider value={{ isPro }}>{children}</PlanContext.Provider>;
}

export function usePlan() {
  return useContext(PlanContext);
}
