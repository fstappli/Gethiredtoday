"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/analytics";

/** Mount once in the root layout. Stores first-touch UTM + referrer in localStorage. Renders nothing. */
export default function Attribution() {
  useEffect(() => { captureAttribution(); }, []);
  return null;
}
