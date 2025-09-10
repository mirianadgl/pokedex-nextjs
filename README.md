# Pokédex — Next.js + TypeScript (front + back unificados)

Aplicação de Pokédex construída com Next.js (App Router) e TypeScript, consumindo a PokeAPI. O projeto usa o back-end do próprio Next (API Routes) para paginação, busca e detalhes, e oferece uma funcionalidade de IA opcional para sugerir matchups (contra quem o Pokémon tende a ganhar/perder).

Por que Next.js (unificado com o servidor)?

- Front e back no mesmo projeto: API Routes para o back-end e páginas/Componentes React para o front.
- Cache nativo: revalidate por rota para performance.
- Tipagem end-to-end com TypeScript.

---

## Requisitos

- Node.js 18+ (recomendado 20+)
- npm (ou pnpm/yarn)

---

## Como rodar o projeto

1. Instale as dependências

```bash
npm install
```

2. (Opcional) IA com Gemini

- Se quiser usar o botão “Ver matchups (IA)” na página de detalhes, crie um arquivo `.env.local` na raiz com sua chave do Google AI Studio.

```bash
# .env.local
GEMINI_API_KEY=coloque_sua_chave_do_Google_AI_Studio_aqui
```

3. shadcn/ui (se necessário)

- O projeto usa componentes do shadcn/ui (button, badge, card, dialog, skeleton).
- Se a pasta `src/components/ui/` não tiver esses componentes, gere-os com o CLI:

```bash
npx shadcn@latest add button badge card dialog skeleton
```

4. Permitir imagens remotas (sprites e artwork)

- Confirme se seu `next.config.ts` permite imagens do GitHub (PokeAPI sprites/artwork):

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "raw.githubusercontent.com" },
    ],
  },
};

export default nextConfig;
```

5. Ambiente de desenvolvimento

```bash
npm run dev
```

- Acesse: http://localhost:3000

---

## Uso

- Lista: http://localhost:3000
  - Paginação: `/?page=1`, `/?page=2`, ...
  - Busca: digite no Header; a URL é atualizada para `?q=nome&page=1` (com debounce).
- Detalhes: http://localhost:3000/pokemon/{nome}
  - Botão “Ver matchups (IA)”: abre um Dialog e consulta `/api/ai/matchups`. Se `GEMINI_API_KEY` estiver configurada, usa o Gemini.

---

## Endpoints do backend (API Routes do Next)

- GET `/api/pokemon?limit=20&offset=0&q={opcional}`

- GET `/api/pokemon/[name]`

- POST `/api/ai/matchups`
  - Body: `{ "name": "pikachu" }`
  - Resposta: `{ "wins": string[], "losses": string[] }`

Cache

- PokeAPI: fetch com `revalidate: 86400` (24h).

---

## API Key do Google Gemini

- Acesse: https://aistudio.google.com/.
- Faça login com sua Conta Google.
- Vá até a seção de Gerenciamento de API Keys.
- Clique para criar uma nova chave (API key).
- Copie a chave gerada e substitua o valor em `GEMINI_API_KEY` no `.env.local`.
