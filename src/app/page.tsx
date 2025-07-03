
"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/icons";

export default function OnboardingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 flex justify-center sm:justify-start">
        <Logo className="h-10 w-10 text-primary" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-8">
        <Image
          src="https://placehold.co/400x400.png"
          alt="A friendly doctor character holding a tablet with health icons"
          width={400}
          height={400}
          className="max-w-xs sm:max-w-sm"
          data-ai-hint="doctor illustration"
        />
        <div className="space-y-2 max-w-md">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            The smart, simple, and effective way to understand your health!
          </h1>
        </div>
      </main>

      <footer className="p-6 border-t bg-card">
        <div className="flex flex-col space-y-3">
          <Button asChild size="lg" className="w-full">
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/login">I already have an account</Link>
          </Button>
        </div>
      </footer>
    </div>
  );
}
