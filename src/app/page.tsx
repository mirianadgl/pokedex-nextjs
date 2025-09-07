import { getPokemonList } from "@/services/pokemonService";
import Link from "next/link";
import Image from "next/image"; 

export default async function Home({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const currentPage = Number(searchParams.page) || 1;
  const limit = 20;
  const offset = (currentPage - 1) * limit;

  const data = await getPokemonList(limit, offset);
  const totalPages = Math.ceil(data.count / limit);

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Pokédex
      </h1>
      
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data.results.map((pokemon) => {
          const id = pokemon.url.split('/').filter(Boolean).pop();
          
          const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

          return (
            <li
              key={pokemon.name}
              className="border border-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow bg-white"
            >
              <Link
                href={`/pokemon/${pokemon.name}`}
                className="block p-4 text-center hover:bg-gray-50"
              >
                <div className="w-24 h-24 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                  {/* ✅ PASSO 3: EXIBIR A IMAGEM */}
                  <Image
                    src={imageUrl}
                    alt={pokemon.name}
                    width={96}
                    height={96}
                    className="object-contain"
                    priority
                  />
                </div>
                <span className="text-lg font-semibold capitalize text-gray-700">
                  {pokemon.name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-gray-600">
          Página <span className="font-bold">{currentPage}</span> de{" "}
          <span className="font-bold">{totalPages}</span>
        </div>
        
        <div className="flex gap-2">
          {currentPage > 1 && (
            <Link
              href={`/?page=${currentPage - 1}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Anterior
            </Link>
          )}
          
          {currentPage < totalPages && (
            <Link
              href={`/?page=${currentPage + 1}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Próxima
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
