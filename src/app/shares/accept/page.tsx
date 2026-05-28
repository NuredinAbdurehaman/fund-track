"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  acceptShareTokenApi,
  redirectToLogin,
} from "@/lib/api-transactions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function AcceptInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<
    "idle" | "accepting" | "done" | "error"
  >("idle");

  useEffect(() => {
    async function run() {
      if (!token) return;
      setStatus("accepting");
      const result = await acceptShareTokenApi(token);
      if (result === "unauthorized") {
        redirectToLogin();
        return;
      }
      if (!result) {
        setStatus("error");
        toast.error("Invite link is invalid or expired");
        return;
      }
      setStatus("done");
      router.replace(`/shared/${result.shareId}`);
    }

    void run();
  }, [token, router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Accept share</CardTitle>
          <CardDescription>
            {status === "accepting"
              ? "Accepting invite..."
              : status === "done"
                ? "Redirecting..."
                : "Open a valid invite link to accept."}
          </CardDescription>
        </CardHeader>
        {status === "error" && (
          <CardContent>
            <Button onClick={() => router.push("/")}>Go to ledger</Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

export default function AcceptSharePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Accept share</CardTitle>
              <CardDescription>Loading...</CardDescription>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <AcceptInner />
    </Suspense>
  );
}

