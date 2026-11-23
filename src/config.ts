// Configurações lidas do arquivo .env (no computador) ou das variáveis de ambiente da Vercel.
// O .env não vai para o GitHub: o modelo fica no .env.example.
export const API_URL = (import.meta.env.VITE_API_URL ?? '').trim().replace(/\/+$/, '')
