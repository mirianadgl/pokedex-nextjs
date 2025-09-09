import { NextRequest, NextResponse } from "next/server";

function toInt(value: string | null, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.trunc(n) : fallback;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Math.max(toInt(searchParams.get("limit"), 20), 1), 100);
  const offset = Math.max(toInt(searchParams.get("offset"), 0), 0);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();

  const BASE = "https://pokeapi.co/api/v2/pokemon";

  try {
    if (!q) {
      const res = await fetch(`${BASE}?limit=${limit}&offset=${offset}`, {
        next: { revalidate: 3600 },
      });
      if (!res.ok) {
        return NextResponse.json(
          { error: "Erro ao consultar PokeAPI" },
          { status: res.status }
        );
      }
      const json = await res.json();
      return NextResponse.json(json);
    }

    const exactRes = await fetch(`${BASE}/${encodeURIComponent(q)}`, {
      next: { revalidate: 3600 },
    });
    if (exactRes.ok) {
      const data = await exactRes.json();
      return NextResponse.json({
        count: 1,
        next: null,
        previous: null,
        results: [{ name: data.name, url: `${BASE}/${data.id}/` }],
      });
    }

    const allRes = await fetch(`${BASE}?limit=2000&offset=0`, {
      next: { revalidate: 86400 },
    });
    if (!allRes.ok) {
      return NextResponse.json(
        { error: "Erro ao carregar catálogo de nomes" },
        { status: allRes.status }
      );
    }

    const all = (await allRes.json()) as {
      count: number;
      results: { name: string; url: string }[];
    };

    const filtered = all.results.filter((p) => p.name.includes(q));
    const count = filtered.length;
    const slice = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      count,
      next: null,
      previous: null,
      results: slice,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro interno ao processar a busca" },
      { status: 500 }
    );
  }
}