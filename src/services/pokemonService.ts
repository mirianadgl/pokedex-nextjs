import { headers } from "next/headers";
import { Pokemon, PokemonListResponse } from "@/types/pokemon";

async function getBaseUrl(): Promise<string> {
  if (typeof window !== "undefined") return "";
  const h = await headers(); 
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export async function getPokemonList(
  limit: number = 20,
  offset: number = 0,
  q?: string
): Promise<PokemonListResponse> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  if (q && q.trim()) params.set("q", q.trim().toLowerCase());

  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/pokemon?${params.toString()}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error("Erro ao buscar pokémons");
  return res.json();
}

export async function getPokemonByName(name: string): Promise<Pokemon> {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/pokemon/${encodeURIComponent(name)}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("Pokémon não encontrado");
  return res.json();
}
