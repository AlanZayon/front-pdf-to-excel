# FISCAL2CSV — Frontend

SPA Vue 3 para conversão de documentos fiscais (PDF DARF/DAS e extratos OFX) em CSV compatível com Domínio Contábil.

## Requisitos

- Node.js 20+
- Backend [ApiPdfCsv](../ApiPdfCsv) em execução

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `VITE_API_BASE_URL` | URL da API (ex.: `http://localhost:5243`) |

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run typecheck` | Verificação TypeScript |
| `npm run test` | Testes Vitest |

## Fluxo principal

1. Login em `/access`
2. Configurar códigos de imposto em `/codigo`
3. Upload PDF/OFX em `/`
4. Classificação OFX (quando necessário)
5. Download CSV

## Deploy

Netlify SPA — configure `VITE_API_BASE_URL` no painel de ambiente.
