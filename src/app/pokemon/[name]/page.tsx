import { getPokemonByName } from "@/services/pokemonService";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MatchupDialog from "@/components/MatchupDialog";

type Props = {
  params: Promise<{ name: string }>;
};

function toKg(hg: number) {
  return (hg / 10).toFixed(1);
}
function toMeters(dm: number) {
  return (dm / 10).toFixed(1);
}
function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const typeColor: Record<string, string> = {
  normal: "bg-zinc-300 text-zinc-900",
  fire: "bg-orange-500 text-white",
  water: "bg-blue-500 text-white",
  grass: "bg-green-500 text-white",
  electric: "bg-yellow-400 text-zinc-900",
  ice: "bg-cyan-400 text-zinc-900",
  fighting: "bg-red-700 text-white",
  poison: "bg-purple-600 text-white",
  ground: "bg-yellow-700 text-white",
  flying: "bg-indigo-400 text-white",
  psychic: "bg-pink-500 text-white",
  bug: "bg-lime-600 text-white",
  rock: "bg-stone-500 text-white",
  ghost: "bg-violet-700 text-white",
  dark: "bg-zinc-800 text-white",
  dragon: "bg-indigo-700 text-white",
  steel: "bg-slate-500 text-white",
  fairy: "bg-fuchsia-400 text-white",
};

export default async function PokemonPage({ params }: Props) {
  const { name } = await params;
  const pokemon = await getPokemonByName(name);

  const art =
    pokemon.sprites.other?.["official-artwork"]?.front_default ??
    pokemon.sprites.front_default ??
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;

  const totalStats = pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <Card className="overflow-hidden border-gray-200 bg-white">
        <CardHeader className="items-center space-y-2 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight capitalize">
            {cap(pokemon.name)}{" "}
            <span className="text-gray-400">#{pokemon.id}</span>
          </CardTitle>

          <div className="flex flex-wrap justify-center gap-2">
            {pokemon.types.map((t) => {
              const cls = typeColor[t.type.name] ?? "bg-gray-200 text-gray-900";
              return (
                <Badge
                  key={t.type.name}
                  className={`${cls} capitalize`}
                  variant="secondary"
                >
                  {t.type.name}
                </Badge>
              );
            })}
          </div>
          <div className="flex w-full justify-center md:justify-end">
            <MatchupDialog name={pokemon.name} />
          </div>
        </CardHeader>

        <CardContent className="grid gap-8 md:grid-cols-2">
          <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-4">
            <Image
              src={art}
              alt={pokemon.name}
              width={640}
              height={640}
              className="h-auto w-full max-w-md object-contain"
              priority
            />
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="mb-3 text-xl font-semibold">Informações</h2>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-sm">
                  Altura: {toMeters(pokemon.height)} m
                </Badge>
                <Badge variant="secondary" className="text-sm">
                  Peso: {toKg(pokemon.weight)} kg
                </Badge>
                <Badge variant="secondary" className="text-sm">
                  Total de atributos: {totalStats}
                </Badge>
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold">Habilidades</h2>
              <div className="flex flex-wrap gap-2">
                {pokemon.abilities.map((a) => (
                  <Badge
                    key={a.ability.name}
                    variant={a.is_hidden ? "outline" : "secondary"}
                    className="capitalize"
                    title={a.is_hidden ? "Habilidade oculta" : "Habilidade"}
                  >
                    {a.ability.name}
                    {a.is_hidden ? " (oculta)" : ""}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold">Atributos</h2>
              <div className="space-y-3">
                {pokemon.stats.map((s) => {
                  const label = s.stat.name
                    .replace("special-attack", "sp. atk")
                    .replace("special-defense", "sp. def");
                  const value = s.base_stat;
                  const pct = Math.min(100, Math.round((value / 180) * 100));
                  return (
                    <div key={s.stat.name}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="capitalize text-gray-700">
                          {label}
                        </span>
                        <span className="font-medium">{value}</span>
                      </div>
                      <div className="h-2 w-full rounded bg-gray-100">
                        <div
                          className="h-2 rounded bg-red-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}