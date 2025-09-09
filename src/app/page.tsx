import { getPokemonList } from "@/services/pokemonService";
import Link from "next/link";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function Home(props: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const sp = await props.searchParams;
  const currentPage = Number(sp.page) || 1;
  const q = (sp.q ?? "").trim().toLowerCase();

  const limit = 20;
  const offset = (currentPage - 1) * limit;

  const data = await getPokemonList(limit, offset, q);
  const totalPages = Math.max(1, Math.ceil(data.count / limit));

  const makePageHref = (page: number) => {
    const params = new URLSearchParams({ page: String(page) });
    if (q) params.set("q", q);
    return `/?${params.toString()}`;
  };

  function getPageItems(
    current: number,
    total: number,
    delta = 1
  ): Array<number | "ellipsis"> {
    const pages = new Set<number>();
    const left = Math.max(1, current - delta);
    const right = Math.min(total, current + delta);

    pages.add(1);
    for (let i = left; i <= right; i++) pages.add(i);
    pages.add(total);

    const ordered = Array.from(pages).sort((a, b) => a - b);
    const out: Array<number | "ellipsis"> = [];

    for (let i = 0; i < ordered.length; i++) {
      const p = ordered[i];
      if (i > 0 && p - ordered[i - 1] > 1) out.push("ellipsis");
      out.push(p);
    }
    return out;
  }

  return (
    <main className="p-6 mx-auto max-w-7xl">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Lista de Pokemons
      </h1>

      {data.results.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-600">
          Nenhum Pokémon encontrado{q ? ` para "${q}"` : ""}.
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {data.results.map((pokemon) => {
            const id = pokemon.url.split("/").filter(Boolean).pop();
            const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

            return (
              <li key={pokemon.name}>
                <Link
                  href={`/pokemon/${pokemon.name}`}
                  className="block p-2 hover:bg-gray-50"
                >
                  <Card className="w-full max-w-sm shadow-md transition-shadow hover:shadow-xl">
                    <CardContent className="flex flex-col items-center gap-3 p-4">
                      <Avatar className="h-24 w-24 rounded-lg bg-gray-100">
                        <AvatarImage
                          src={imageUrl}
                          alt={pokemon.name}
                          className="object-contain p-1"
                        />
                        <AvatarFallback className="text-base capitalize">
                          {pokemon.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>

                      <span className="text-lg font-semibold capitalize text-gray-700">
                        {pokemon.name}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-10 flex flex-col items-center gap-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={makePageHref(Math.max(1, currentPage - 1))}
                aria-disabled={currentPage <= 1}
                className={
                  currentPage <= 1
                    ? "pointer-events-none opacity-50"
                    : undefined
                }
              />
            </PaginationItem>

            {getPageItems(currentPage, totalPages).map((item, i) => (
              <PaginationItem key={`${item}-${i}`}>
                {item === "ellipsis" ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href={makePageHref(item)}
                    isActive={item === currentPage}
                    aria-current={item === currentPage ? "page" : undefined}
                  >
                    {item}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href={makePageHref(Math.min(totalPages, currentPage + 1))}
                aria-disabled={currentPage >= totalPages}
                className={
                  currentPage >= totalPages
                    ? "pointer-events-none opacity-50"
                    : undefined
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        <div className="text-gray-600">
          Página <span className="font-bold">{currentPage}</span> de{" "}
          <span className="font-bold">{totalPages}</span>
          {q ? (
            <span className="ml-2 italic text-gray-500">
              (filtrando por “{q}”)
            </span>
          ) : null}
        </div>
      </div>
    </main>
  );
}
