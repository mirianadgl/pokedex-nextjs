import { getPokemonByName } from "@/services/pokemonService";
import Image from "next/image";

type Props = {
  params: Promise<{ name: string }>;
};

export default async function PokemonPage({ params }: Props) {
  const { name } = await params;
  const pokemon = await getPokemonByName(name);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold capitalize">{pokemon.name}</h1>
      <Image
        src={pokemon.sprites.front_default}
        alt={pokemon.name}
        width={800}
        height={800}
        className="w-32 h-32"
      />
      <p>Height: {pokemon.height}</p>
      <p>Weight: {pokemon.weight}</p>
      <div>
        <h2 className="text-xl font-semibold mt-4">Abilities:</h2>
        <ul>
          {pokemon.abilities.map((a) => (
            <li key={a.ability.name} className="capitalize">
              {a.ability.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
