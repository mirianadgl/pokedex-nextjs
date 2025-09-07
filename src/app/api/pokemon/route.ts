import { NextResponse } from "next/server";
import { PokemonListResponse } from "@/types/pokemon";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = searchParams.get("limit") ?? "20";
  const offset = searchParams.get("offset") ?? "0";

  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Erro ao buscar pokémons" }, { status: 500 });
  }
  
  const data: PokemonListResponse = await res.json();

  return NextResponse.json(data);
}
