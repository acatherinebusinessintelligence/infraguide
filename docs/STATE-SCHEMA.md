# Esquema de estado de InfraGuide

Formato de persistencia local y de archivos de progreso. Versión actual: **stateVersion 1**.

InfraGuide **1.0.0**. Sin backend, cuentas ni sincronización remota.

## Principios

LOCAL · PORTABLE · VERSIONADA · VALIDABLE · RECUPERABLE

El progreso pertenece al trabajo, no al navegador. Todo lo guardado en el navegador puede exportarse e importarse como JSON.

## Claves en este navegador

| Clave | Uso |
| --- | --- |
| `infraguide_state` | Estado actual |
| `infraguide_state_backup` | Copia anterior válida |
| `infraguide_snapshots` | Hasta 3 puntos de recuperación |

Claves antiguas (`infraguide:v1`, `infraguide:v1:state`) se leen una vez y se migran al formato actual.

Los componentes de la interfaz no acceden a `localStorage`. Solo `PersistenceService` (vía `storageAdapter`) escribe y lee.

## Sobre

Cada guardado se envuelve así:

```json
{
  "stateVersion": 1,
  "infraGuideVersion": "1.0.0",
  "createdAt": "2026-09-01T19:00:00.000Z",
  "updatedAt": "2026-09-01T19:10:00.000Z",
  "caseId": "modelo-helados-boreal",
  "documentVersion": 1,
  "checksum": "a1b2c3d4",
  "payload": {}
}
```

`checksum` es un hash FNV-1a de 32 bits. Sirve para detectar corrupción accidental. **No es un mecanismo de seguridad.**

## Payload (`appState` persistible)

```json
{
  "meta": {
    "stateVersion": 1,
    "infraGuideVersion": "1.0.0",
    "createdAt": "...",
    "updatedAt": "...",
    "caseId": "modelo-helados-boreal",
    "documentVersion": 1
  },
  "selectedCase": {
    "id": "modelo-helados-boreal",
    "name": "Helados Boreal S.A.S.",
    "kind": "model",
    "kindLabel": "Caso modelo"
  },
  "collectedData": [],
  "analysis": {
    "understand": {},
    "represent": {},
    "measure": {},
    "diagnose": {},
    "govern": {},
    "decide": {},
    "build": {},
    "export": {}
  },
  "documentSections": {},
  "progress": 0,
  "completedStages": [],
  "currentStage": 0,
  "methodologyStatus": {},
  "explorerSectionId": "operational-data",
  "activityAnswers": {},
  "metricEvidence": []
}
```

No se persisten: paneles abiertos, menú móvil, toasts, vistas transitorias, blobs de exportación, caché ni registros técnicos innecesarios.

No se incluyen nombre, correo, documento de identidad, IP, ubicación ni datos del dispositivo del estudiante.

## Archivo de progreso

Nombre típico: `InfraGuide_Helados_Boreal_Progreso.json`

```json
{
  "format": "InfraGuideProgress",
  "stateVersion": 1,
  "infraGuideVersion": "1.0.0",
  "exportedAt": "...",
  "caseId": "modelo-helados-boreal",
  "checksum": "...",
  "state": { }
}
```

Tamaño máximo de importación: **5 MB**. Solo se acepta JSON. El contenido se trata como datos: no se ejecutan scripts, HTML ni funciones. Los textos se sanitizan antes de usarse.

Esto **no** es la exportación del documento (HTML / Word / PDF).

## Validación

`StateValidator` comprueba objeto, `stateVersion`, `caseId`, listas, `documentSections` y `analysis`. No exige que existan todas las propiedades si se pueden migrar.

Si `stateVersion` es mayor que el de la aplicación: no se carga a ciegas.

Si es menor: `StateMigrationService` aplica migraciones registradas. En la v1 no hay migraciones reales; la arquitectura queda lista para `v1 → v2`.

## Recuperación

1. Leer estado actual.
2. Validar.
3. Si es válido, cargar.
4. Si no, intentar backup.
5. Si el backup es válido, restaurarlo y avisar.
6. Si ninguno es válido, pantalla controlada: recuperar backup, importar progreso o iniciar nuevo.

## Snapshots

Cada punto: `id`, `createdAt`, `label` opcional, `currentStage`, `documentVersion`, `state`.

Máximo 3. El cuarto elimina el más antiguo.
