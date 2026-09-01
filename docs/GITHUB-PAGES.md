# GitHub Pages

InfraGuide es un sitio estático. El flujo oficial es GitHub Actions (`.github/workflows/deploy.yml`).

## Configuración en GitHub

1. Abre el repositorio.
2. **Settings → Pages**.
3. **Source:** GitHub Actions (no “Deploy from a branch”).
4. Asegúrate de que el nombre del repo coincida con el base path, o ajústalo.

## Nombre del repositorio y base path

La producción usa:

```
VITE_PAGES_BASE=/infraguide/
```

Si el repositorio **no** se llama `infraguide`, cambia **solo** `.env.production` (por ejemplo `/mi-fork/`). No hace falta editar componentes.

Desarrollo sigue usando `/`.

## Despliegue

- Push a `main` o `master`, o
- **Actions → Deploy GitHub Pages → Run workflow**

Node 20, `npm ci`, `npm run build`, artifact `dist/`.

## Alternativa manual

Si Actions no está disponible:

```bash
npm ci
npm run build
```

Sube el contenido de `dist/` a GitHub Pages (rama `gh-pages` u otro hosting estático) respetando el base path.

No hagas push de `dist/` al repo de fuente. El workflow publica el artifact.

## Comprobación

La URL típica es:

`https://<usuario>.github.io/infraguide/`

Recargar `#/ruta` no debe dar 404 (la app usa hash routing).
