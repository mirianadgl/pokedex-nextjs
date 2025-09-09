"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"

export function BackToListButton() {
  const router = useRouter();
  return (
    <Button
      onClick={() => router.push("/")}
      className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 hover:bg-gray-50"
      aria-label="Voltar para a lista"
      type="button"
    >
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M12.5 15l-5-5 5-5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Voltar
    </Button>
  );
}