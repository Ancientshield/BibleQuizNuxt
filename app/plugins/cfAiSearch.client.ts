export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig();
  const apiUrl = config.public.cfAiSearchUrl as string;
  if (!apiUrl) return;

  await import('@cloudflare/ai-search-snippet');
});
