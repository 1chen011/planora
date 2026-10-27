import {
  login,
  signup,
} from "./actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
}) {
  const params =
    await searchParams;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-semibold">
            Planora
          </p>

          <h1 className="mt-4 text-2xl font-semibold">
            Welcome
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to access your workspace across devices.
          </p>
        </div>

        {params.error && (
          <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {params.error}
          </div>
        )}

        {params.message && (
          <div className="mb-4 rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-muted-foreground">
            {params.message}
          </div>
        )}

        <form className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="email">
              Email
            </Label>

            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="password">
              Password
            </Label>

            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={6}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              formAction={login}
              type="submit"
            >
              Log in
            </Button>

            <Button
              formAction={signup}
              type="submit"
              variant="outline"
            >
              Sign up
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}