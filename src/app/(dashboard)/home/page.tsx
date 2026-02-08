"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

// Redirect home to canvas - canvas is now the main working area
export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/canvas');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Redirecting to canvas...</span>
      </div>
    </div>
  );
}