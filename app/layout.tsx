import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Architects_Daughter, Fira_Code } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/trpc/client";
import { ApiKeyProvider } from "@/components/ApiKeyProvider";
import { Footer } from "@/components/Footer";
import PlausibleProvider from "next-plausible";
import { SupabaseWrapper } from "@/components/SupabaseWrapper";
import { SupabaseInitializer } from "@/components/SupabaseInitializer";
import { StagewiseToolbar } from "@stagewise/toolbar-next";
import ReactPlugin from "@stagewise-plugins/react";

const architectsDaughter = Architects_Daughter({
  weight: "400",
  variable: "--font-architects-daughter",
  subsets: ["latin"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Whisper App - Capture Your Thoughts By Voice",
  description: "Convert your thoughts into text by voice with Whisper.",
  openGraph: {
    images: "https://usewhisper.io/og.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Use client-side navigation for login/signup
  // This must be a Client Component to use useRouter, so we can use a workaround:
  // Place a ClientHeader component below
  return (
    <ClerkProvider>
      <ApiKeyProvider>
        <TRPCReactProvider>
          <html lang="en">
            <head>
              <PlausibleProvider domain="usewhisper.io" />
              {/* Script to apply dark mode on page load based on system preference or localStorage */}
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    (function() {
                      function getInitialTheme() {
                        const savedTheme = localStorage.getItem('theme');
                        if (savedTheme) {
                          return savedTheme;
                        }
                        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                      }

                      const theme = getInitialTheme();
                      if (theme === 'dark') {
                        document.documentElement.classList.add('dark');
                      } else {
                        document.documentElement.classList.remove('dark');
                      }
                    })();
                  `,
                }}
              />
            </head>
            <body className={`${architectsDaughter.variable} ${firaCode.variable} antialiased`}>
              <div className="min-h-screen flex flex-col">
                <SupabaseInitializer />
                <Header />
                <SupabaseWrapper>
                  {children}
                </SupabaseWrapper>
                <Toaster richColors />
                <Footer />
                <StagewiseToolbar config={{ plugins: [ReactPlugin] }} />
              </div>
            </body>
          </html>
        </TRPCReactProvider>
      </ApiKeyProvider>
    </ClerkProvider>
  );
}
