export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const apiUrl = config.public.cfAiSearchUrl as string;
  if (!apiUrl) return;

  useHead({
    script: [
      {
        src: apiUrl.replace(/\/$/, '') + '/cdn/chat-bubble-snippet.js',
        type: 'module',
        defer: true,
      },
    ],
  });
});
