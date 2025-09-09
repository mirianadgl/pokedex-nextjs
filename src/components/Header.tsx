"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PokemonSearch } from "./PokemonSearch";
import { BackToListButton } from "./BackToListButton";

export function Header() {
  const pathname = usePathname();
  const isDetail = /^\/pokemon\/[^/]+$/.test(pathname ?? "");
  const isList = pathname === "/" || pathname?.startsWith("/?");

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/70 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="w-1/3">
          {isDetail ? <BackToListButton /> : isList ? <PokemonSearch /> : null}
        </div>

        <div className="flex w-1/3 justify-center">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-gray-900"
            aria-label="Ir para a página inicial da Pokédex"
          >
            Pokédex
          </Link>
        </div>

        <div className="w-1/3" />
      </div>
    </header>
  );
}
