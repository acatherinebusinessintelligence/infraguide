import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const fromEnv = env.VITE_PAGES_BASE;
  const base = fromEnv && fromEnv.length ? fromEnv : mode === 'development' ? '/' : '/infraguide/';

  return {
    base,
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
    },
    server: {
      port: 5173,
      open: true,
    },
    preview: {
      port: 4173,
    },
  };
});
