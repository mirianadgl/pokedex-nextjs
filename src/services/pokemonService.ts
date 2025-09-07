import { Pokemon, PokemonListResponse } from "@/types/pokemon";

export async function getPokemonList(limit: number = 20, offset: number = 0): Promise<PokemonListResponse> {
  const res = await fetch(
    `http://localhost:3000/api/pokemon?limit=${limit}&offset=${offset}`,
    { next: { revalidate: 3600 } } 
  );
  if (!res.ok) throw new Error("Erro ao buscar pokémons");
  return res.json();
}

export async function getPokemonByName(name: string): Promise<Pokemon> {
  const res = await fetch(`http://localhost:3000/api/pokemon/${name}`, {
    next: { revalidate: 3600 }, 
  });
  if (!res.ok) throw new Error("Pokémon não encontrado");
  return res.json();
}
