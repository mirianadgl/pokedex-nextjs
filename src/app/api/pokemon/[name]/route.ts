import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ name: string }> }
) {
  const { name } = await ctx.params; 
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Pokémon não encontrado" },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
