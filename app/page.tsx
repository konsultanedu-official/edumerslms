import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Copyright } from "@/components/layout/copyright";
import { AuthMessage } from "@/components/auth-message";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24 bg-muted/40 overflow-hidden relative">
      <Suspense><AuthMessage /></Suspense>
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl -z-10" />

      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex absolute top-10 px-6 md:px-24">
        <p className="flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30 font-bold text-lg tracking-tight">
          Edumers LMS
        </p>
      </div>

      <div className="flex flex-col items-center text-center space-y-8 z-10 max-w-3xl">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Digital Research & <br />
            <span className="text-primary bg-clip-text">Learning Platform</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Platform bimbingan akademik dan riset digital terpadu untuk mahasiswa dan pendidik.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button asChild size="lg" className="px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all font-semibold">
            <Link href="/auth/sign-up">Mulai Belajar Sekarang</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="px-8 py-6 text-lg rounded-full bg-background/50 hover:bg-background transition-all font-semibold">
            <Link href="/auth/login">Masuk ke Akun</Link>
          </Button>
        </div>
      </div>

      <div className="absolute bottom-10 text-center w-full text-muted-foreground text-xs">
        <Copyright />
      </div>
    </main>
  );
}
