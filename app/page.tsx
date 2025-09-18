"use client";
import { Button } from "@/components/ui/button";
import { useAuthGuard } from "@/lib/useAuthGuard";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from "./components/LoadingSpinner";
import { useClientSide } from '@/hooks/use-client-side';

export default function Home() {
  const router = useRouter();
  const isClient = useClientSide();
  const { user, isLoading, isAuthorized } = useAuthGuard();

  if (!isClient) return <LoadingSpinner />;
  if (isLoading) return <LoadingSpinner />;
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
          <li className="mb-2 tracking-[-.01em]">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded">
              app/page.tsx
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">
            Save and see your changes instantly.
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Button
            onClick={() => router.push("/login")}
            className="rounded-full hover:scale-105 transition-transform w-100 border border-solid border-transparent 
            flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] 
            dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 ">
            {isAuthorized?'Go to Dashboard':'Login'}</Button>
        </div>
      </main>

    </div>
  );
}
