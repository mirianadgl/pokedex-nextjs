"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";

export function PokemonSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [input, setInput] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setInput(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    const id = setTimeout(() => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      const currentQ = (params.get("q") ?? "").trim().toLowerCase();
      const nextQ = input.trim().toLowerCase();

      if (nextQ === currentQ) return; 

      if (nextQ) params.set("q", nextQ);
      else params.delete("q");

      params.set("page", "1");

      const nextUrl = params.toString() ? `/?${params.toString()}` : "/";
      router.replace(nextUrl, { scroll: false });
    }, 300);

    return () => clearTimeout(id);
  }, [input, router, searchParams]);

  async function goToDetailsIfExists(q: string) {
    const value = q.trim().toLowerCase();
    if (!value) return;
    try {
      const res = await fetch(`/api/pokemon/${encodeURIComponent(value)}`);
      if (res.ok) {
        router.push(`/pokemon/${encodeURIComponent(value)}`);
      } else {
        alert("Pokémon não encontrado. Ajuste sua busca.");
      }
    } catch {
      alert("Erro ao buscar. Tente novamente.");
    }
  }

  return (
    <div className="relative">
      <label htmlFor="pokemon-search" className="sr-only">
        Buscar Pokémon
      </label>
      <Input
        id="pokemon-search"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            void goToDetailsIfExists(input);
          }
        }}
        placeholder="Buscar por nome ou ID"
        className="md:w-72"
        autoComplete="off"
      />
    </div>
  );
}