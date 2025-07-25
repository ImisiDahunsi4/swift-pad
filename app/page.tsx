"use client";

import { LandingPage } from "@/components/landing-page";
import { checkEnvVars } from "@/lib/envCheck";
import { useEffect } from "react";

export interface Transcription {
  id: string;
  title: string;
  content: string;
  preview: string;
  timestamp: string;
  duration?: string;
}

export default function Home() {
  useEffect(() => {
    // Check environment variables on client side
    checkEnvVars();
  }, []);

  return <LandingPage />;
}
