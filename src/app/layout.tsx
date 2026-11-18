import type { Metadata } from "next";
import { ProfileIdentityProvider } from "@/components/profile-identity";
import { Toaster } from "sonner";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "MentorLagbe | Find your kind of learning", template: "%s | MentorLagbe" },
  description: "Explore home and online tuition opportunities for learners and tutors in Bangladesh.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full antialiased font-sans", geistMono.variable, inter.variable)}
    >
      <body className="flex min-h-full flex-col">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-100 focus:rounded-lg focus:bg-card focus:px-4 focus:py-2 focus:shadow-lg">Skip to content</a>
        <Toaster richColors />
        <ProfileIdentityProvider>{children}</ProfileIdentityProvider>
      </body>
    </html>
  );
}
