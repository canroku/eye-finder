"use client";

import { captureReferralFromUrl } from "@/lib/referral";
import { useEffect } from "react";

export function ReferralCapture() {
  useEffect(() => {
    captureReferralFromUrl();
  }, []);
  return null;
}
