# Lista de pruebas InfraGuide 1.0.0

Usar el build de producción (`npm run build` + `npm run preview`) además de `npm run dev`.

## Arranque y publicación

- [ ] Home carga en `/` (dev) y en `/infraguide/` (producción GitHub Pages).
- [ ] Recargar `#/ruta`, `#/comprender`, `#/exportar` no produce 404.
- [ ] Assets (CSS, JS, favicon, JSON del caso) cargan.
- [ ] Consola sin errores críticos.
- [ ] `caso-modelo-helados-boreal.json` está empaquetado (no se pide por URL de desarrollo).

## Recorrido

- [ ] INICIO
- [ ] Seleccionar Helados Boreal
- [ ] COMPRENDER
- [ ] REPRESENTAR
- [ ] MEDIR
- [ ] DIAGNOSTICAR
- [ ] GOBERNAR
- [ ] DECIDIR
- [ ] CONSTRUIR
- [ ] EXPORTAR

Puede usarse la demostración de desarrollo (`VITE_DEBUG_MODE=true`) para no rellenar todo a mano.

## Persistencia

- [ ] Autosave en `infraguide:v1:state`
- [ ] Recargar mantiene el caso y el avance
- [ ] Descargar progreso JSON
- [ ] Borrar estado / otro perfil
- [ ] Importar JSON y recuperar
- [ ] Namespace por caso `infraguide:v1:modelo-helados-boreal`

## Exportación del documento

- [ ] HTML se descarga y abre offline
- [ ] DOCX abre, tablas, fórmulas, caracteres especiales
- [ ] Vista imprimible A4, sin menú ni botones, saltos razonables
- [ ] Modo limpio vs académico

## Responsive

Probar 1440, 1024, 768, 390 y 320 px en:

- [ ] CaseExplorer
- [ ] Diagrama AS-IS
- [ ] Calculadoras
- [ ] Matriz de diagnóstico
- [ ] Builders de gobierno
- [ ] DecisionBuilder
- [ ] DocumentPreview
- [ ] ExportCenter

## Teclado

- [ ] Menú
- [ ] Formularios
- [ ] Actividades
- [ ] Builders
- [ ] Exportación (foco visible, Enter/Espacio en botones)

## GitHub Pages

- [ ] Settings → Pages → Source: GitHub Actions
- [ ] URL pública abre Home
- [ ] Hash routing y persistencia en HTTPS
- [ ] Exportaciones en la URL pública
- [ ] Prueba en móvil real si es posible; si no, emular 390 px
