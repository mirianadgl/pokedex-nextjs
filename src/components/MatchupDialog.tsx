"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { PokemonMatchups } from "@/types/pokemon";

function hasName(x: unknown): x is { name: string } {
  return (
    typeof x === "object" &&
    x !== null &&
    "name" in x &&
    typeof (x as Record<string, unknown>).name === "string"
  );
}
function isAbortError(e: unknown): boolean {
  return hasName(e) && e.name === "AbortError";
}

export default function MatchupDialog({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PokemonMatchups | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    setData(null);

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const res = await fetch("/api/ai/matchups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
        signal: ac.signal,
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Falha ao gerar matchups");
      }
      const json = (await res.json()) as PokemonMatchups;
      setData(json);
    } catch (err: unknown) {
      if (!isAbortError(err)) {
        setError("Não foi possível gerar as dicas agora.");
      }
    } finally {
      setLoading(false);
    }
  }, [name]);

  useEffect(() => {
    if (open) void load();
    return () => abortRef.current?.abort();
  }, [open, load]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          Ver matchups (IA)
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle className="capitalize">
            Matchups para {name}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-5 w-2/3" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-7 w-full" />
                <Skeleton className="h-7 w-5/6" />
                <Skeleton className="h-7 w-4/5" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-7 w-full" />
                <Skeleton className="h-7 w-5/6" />
                <Skeleton className="h-7 w-4/5" />
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : data ? (
          <div className="space-y-6">
            <section>
              <h3 className="mb-2 text-sm font-medium text-green-700">
                Ganha de
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.wins.length === 0 ? (
                  <span className="text-sm text-gray-500">
                    Sem sugestões.
                  </span>
                ) : (
                  data.wins.map((n) => (
                    <Badge key={n} className="capitalize" variant="secondary">
                      {n}
                    </Badge>
                  ))
                )}
              </div>
            </section>

            <section>
              <h3 className="mb-2 text-sm font-medium text-red-700">
                Perde para
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.losses.length === 0 ? (
                  <span className="text-sm text-gray-500">
                    Sem sugestões.
                  </span>
                ) : (
                  data.losses.map((n) => (
                    <Badge key={n} className="capitalize" variant="secondary">
                      {n}
                    </Badge>
                  ))
                )}
              </div>
            </section>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}