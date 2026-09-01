# PDF original — Helados Boreal S.A.S.

Ruta requerida por InfraGuide (compatible con Vite, `dist` y GitHub Pages `/infraguide/`):

```
public/cases/helados-boreal/caso-helados-boreal.pdf
```

URL en producción:

```
/infraguide/cases/helados-boreal/caso-helados-boreal.pdf
```

URL en desarrollo:

```
/cases/helados-boreal/caso-helados-boreal.pdf
```

## Estado

El PDF académico original está **vinculado** (`linked: true`, 10 páginas). El JSON del caso modelo solo contiene datos contrastados en ese documento.

No se inventan páginas, citas ni cifras ausentes (por ejemplo, cantidad de tiendas o total de empleados). Los totales de indisponibilidad, disponibilidad, MTTR y margen de almacenamiento son **resultados calculados**: el PDF pide obtenerlos; no se marcan como texto literal.

## Cómo volver a contrastar

1. Conserve este archivo como `caso-helados-boreal.pdf`.
2. En `src/data/cases/caso-modelo-helados-boreal.json`, cada `field.source` debe tener página y fragmento localizado para `verified: true`.
3. Un resultado calculado usa `origin: "CALCULATED"` y `verified: false`.
