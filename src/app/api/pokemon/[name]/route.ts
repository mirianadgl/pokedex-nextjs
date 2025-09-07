import { NextResponse } from "next/server";
import { Pokemon } from "@/types/pokemon";

interface Params {
  params: Promise<{ name: string }>;
}

export async function GET(req: Request, { params }: Params) {
  const { name } = await params;
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);

  if (!res.ok) {
    return NextResponse.json({ error: "Pokémon não encontrado" }, { status: 404 });
  }
 
  const data: Pokemon = await res.json();
  return NextResponse.json(data);
}
