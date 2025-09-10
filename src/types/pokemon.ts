export interface PokemonAbility {
  ability: {
    name: string;
    url: string;
  };
  is_hidden?: boolean;
}

export interface PokemonStat {
  base_stat: number;
  stat: {
    name: string;
  };
}

export interface PokemonSprites {
  front_default: string | null;
  other?: {
    ["official-artwork"]?: {
      front_default: string | null;
    };
  };
}

export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  abilities: PokemonAbility[];
  stats: PokemonStat[];
  sprites: PokemonSprites;
  types: PokemonType[];
}

export interface PokemonListResult {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListResult[];
}

export type MatchupSource = "ia" | "api";

export interface PokemonMatchups {
  wins: string[];
  losses: string[];
  source?: MatchupSource;
  message?: string;
}

export type PokeApiPokemonTypes = Pick<Pokemon, "types">;