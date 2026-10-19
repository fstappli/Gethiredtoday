"use client";

import { useEffect } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics";

/** Fires one analytics event when it mounts. Renders nothing. */
export default function TrackOnMount({ event, params }: { event: AnalyticsEvent; params?: Record<string, string | number | boolean> }) {
  useEffect(() => { track(event, params); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
