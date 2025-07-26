"use client";

import { Button } from "@/components/ui/button";
import { SignInButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

export function LandingPage() {
  const { user } = useUser();

  // Shared CTA button
  const CTAButton = (
    <Button
      size="lg"
      className="bg-primary hover:bg-primary/90 text-base text-center text-primary-foreground px-2 py-4 flex flex-row items-center justify-center gap-2 leading-5 w-[190px] h-[36px] rounded-[8px]"
    >
      <img src="/microphone.svg" className="size-5 min-w-5" />
      Start Note-Taking
    </Button>
  );

  return (
    <>
      {/* Main Content */}
      <main className="container mx-auto px-6 py-16 text-center">
        <div className="flex flex-col items-center">
          <a
            href="https://www.assemblyai.com/"
            rel="noopener noreferrer"
            target="_blank"
            className="w-[225px] h-[30px] relative rounded-[100px] bg-card border border-border flex items-center justify-center gap-1 mb-6"
          >
            <span className="text-sm text-left text-muted-foreground">
              Made & powered by{" "}
            </span>
            <img
              src="/assemblyai.png"
              className="max-w-[70px] max-h-[20px] w-auto h-auto mt-0.5"
            />
          </a>

          <h1 className="text-[40px] md:text-[60px] font-medium text-center text-foreground mb-6 leading-tight">
            Capture Your
            <br />
            Thoughts By Voice
          </h1>

          <p className="text-base text-center text-muted-foreground max-w-[323px] mx-auto mb-8">
            Transform your voice into organized text and insights. Our AI
            transcribes your speech instantly and cleans it up!
          </p>

          {user ? (
            <Link href="/whispers" className="w-[190px] h-[36px]">
              {CTAButton}
            </Link>
          ) : (
            <SignInButton>{CTAButton}</SignInButton>
          )}

          <p className="text-sm text-center text-muted-foreground mt-2">
            Free &amp; open source
          </p>

          <img
            src="/sreen-desktop.png"
            className="mt-12 max-w-[323px] ml-[-40px] md:hidden"
          />

          <img
            src="/sreen-desktop.png"
            className="hidden md:block max-w-[784px] mt-12"
          />
        </div>
      </main>
    </>
  );
}
