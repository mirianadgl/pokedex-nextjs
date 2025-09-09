import { NextRequest, NextResponse } from "next/server";
import type {
  PokemonMatchups,
  PokeApiPokemonTypes,
} from "@/types/pokemon";
import type { GeminiResponse } from "@/types/ai";
import { error } from "console";

type CacheEntry = { data: PokemonMatchups; expiresAt: number };

declare global {
  var __MATCHUPS_CACHE: Map<string, CacheEntry> | undefined;
}
const CACHE =
  globalThis.__MATCHUPS_CACHE ??
  (globalThis.__MATCHUPS_CACHE = new Map());
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const MODEL = "gemini-1.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}
function normalizeNames(arr: unknown): string[] {
  if (!isStringArray(arr)) return [];
  const set = new Set(
    arr
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 0)
  );
  return Array.from(set).slice(0, 10);
}

function extractJson(text: string): PokemonMatchups {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Resposta não contém JSON");
  }
  const jsonStr = text.slice(start, end + 1);
  const obj: unknown = JSON.parse(jsonStr);
  if (!isRecord(obj)) throw new Error("JSON inválido");

  const wins = isStringArray(obj.wins)
    ? obj.wins
    : normalizeNames((obj as Record<string, unknown>).better_against);
  const losses = isStringArray(obj.losses)
    ? obj.losses
    : normalizeNames((obj as Record<string, unknown>).worse_against);

  return { wins: normalizeNames(wins), losses: normalizeNames(losses) };
}

async function fetchJson<T>(
  url: string,
  revalidateSeconds = 86400
): Promise<T> {
  const res = await fetch(url, { next: { revalidate: revalidateSeconds } });
  if (!res.ok) {
    throw new Error(`Falha ao buscar ${url} (HTTP ${res.status})`);
  }
  return (await res.json()) as T;
}

async function getPokemonTypes(name: string): Promise<string[]> {
  const data = await fetchJson<PokeApiPokemonTypes>(
    `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(name)}`
  );
  return (
    data.types
      ?.map((t) => t.type?.name)
      .filter((x): x is string => typeof x === "string") ?? []
  );
}

type Named = { name?: string; url?: string };
type PokeApiTypeResponse = {
  damage_relations?: {
    double_damage_to?: Named[];
    double_damage_from?: Named[];
  };
  pokemon?: { pokemon?: Named }[];
};

async function getTypeDetails(
  typeName: string
): Promise<PokeApiTypeResponse> {
  return fetchJson<PokeApiTypeResponse>(
    `https://pokeapi.co/api/v2/type/${encodeURIComponent(typeName)}`
  );
}

async function pickPokemonByTypes(
  types: string[],
  excludeName: string,
  limit: number
): Promise<string[]> {
  const out = new Set<string>();
  const exclude = excludeName.toLowerCase();

  for (const t of types) {
    try {
      const td = await getTypeDetails(t);
      for (const entry of td.pokemon ?? []) {
        const n = entry.pokemon?.name?.toLowerCase();
        if (!n) continue;
        if (n === exclude) continue;
        out.add(n);
        if (out.size >= limit) return Array.from(out);
      }
    } catch {
        console.warn(`[PokeAPI] Erro de rede ao buscar "${name}":`, error);
    }
  }
  return Array.from(out);
}

async function computeFallback(
  pokemonName: string,
  pokemonTypes: string[]
): Promise<PokemonMatchups> {
  const typeDetails = await Promise.all(
    pokemonTypes.map((t) => getTypeDetails(t))
  );

  const winsTypeSet = new Set<string>();
  const lossesTypeSet = new Set<string>();

  for (const td of typeDetails) {
    td.damage_relations?.double_damage_to?.forEach((n) => {
      if (n?.name) winsTypeSet.add(n.name);
    });
    td.damage_relations?.double_damage_from?.forEach((n) => {
      if (n?.name) lossesTypeSet.add(n.name);
    });
  }

  const wins = await pickPokemonByTypes(
    Array.from(winsTypeSet),
    pokemonName,
    10
  );
  const losses = await pickPokemonByTypes(
    Array.from(lossesTypeSet),
    pokemonName,
    10
  );

  return { wins, losses };
}

function getFromCache(key: string): PokemonMatchups | null {
  const entry = CACHE.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    CACHE.delete(key);
    return null;
  }
  return entry.data;
}
function setToCache(
  key: string,
  data: PokemonMatchups,
  ttlMs = CACHE_TTL_MS
): void {
  CACHE.set(key, { data, expiresAt: Date.now() + ttlMs });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { name?: string };
    const name = body?.name?.trim().toLowerCase();

    if (!name) {
      return NextResponse.json(
        { error: "Parâmetro 'name' é obrigatório" },
        { status: 400 }
      );
    }

    const cacheKey = `matchups:${name}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        status: 200,
        headers: {
          "Cache-Control": "s-maxage=86400, stale-while-revalidate=3600",
        },
      });
    }

    let types: string[] = [];
    try {
      types = await getPokemonTypes(name);
    } catch {
        console.warn(`[PokeAPI] Erro de rede ao buscar "${name}":`, error);
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY ausente");

      const prompt = [
        `Você é um assistente de matchups de Pokémon.`,
        `Dado o Pokémon "${name}"${
          types.length ? ` (tipos: ${types.join(", ")})` : ""
        }, gere duas listas curtas:`,
        `- wins: 5 a 10 nomes de pokémons contra os quais ele tem vantagem.`,
        `- losses: 5 a 10 nomes de pokémons contra os quais ele tem desvantagem.`,
        ``,
        `Regras importantes:`,
        `- Retorne APENAS JSON válido, sem comentários nem texto extra.`,
        `- Formato: {"wins": ["nome1", ...], "losses": ["nome1", ...]}.`,
        `- Use exatamente os nomes como na PokeAPI (lowercase, com hífen).`,
        `- Evite formas/megas regionais quando possível.`,
        `- Não repita nomes e não inclua "${name}" nas listas.`,
      ].join("\n");

      const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2 },
      };

      const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Gemini falhou: HTTP ${res.status}`);
      }

      const data = (await res.json()) as GeminiResponse;
      const text =
        data.candidates?.[0]?.content?.parts
          ?.map((p) => p.text ?? "")
          .join("") ?? "";

      const parsed = extractJson(text);

      if (
        (parsed.wins?.length ?? 0) === 0 &&
        (parsed.losses?.length ?? 0) === 0
      ) {
        throw new Error("LLM vazio");
      }

      setToCache(cacheKey, parsed);
      return NextResponse.json(parsed, {
        status: 200,
        headers: {
          "Cache-Control": "s-maxage=86400, stale-while-revalidate=3600",
        },
      });
    } catch {
      try {
        if (types.length === 0) {
          types = await getPokemonTypes(name);
        }
        const fallback = await computeFallback(name, types);
        setToCache(cacheKey, fallback);
        return NextResponse.json(fallback, {
          status: 200,
          headers: {
            "Cache-Control":
              "s-maxage=86400, stale-while-revalidate=3600",
          },
        });
      } catch (fallbackErr) {
        const msg =
          fallbackErr instanceof Error
            ? fallbackErr.message
            : String(fallbackErr);
        return NextResponse.json(
          {
            error:
              "Não foi possível gerar matchups (LLM e fallback falharam)",
            details: msg,
          },
          { status: 500 }
        );
      }
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: "Erro interno", details: message },
      { status: 500 }
    );
  }
}