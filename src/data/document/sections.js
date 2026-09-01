export const documentSections = [
  { id: 1, key: 'context', number: '1', title: 'Contexto de la organización' },
  { id: 'usersAndOperations', key: 'usersAndOperations', number: '2', title: 'Usuarios y operación' },
  { id: 'services', key: 'services', number: '3', title: 'Servicios tecnológicos' },
  { id: 2, key: 'criticalServices', number: '4', title: 'Servicios críticos' },
  { id: 'constraints', key: 'constraints', number: '5', title: 'Restricciones del caso' },
  { id: 3, key: 'asis', number: '6', title: 'Arquitectura AS-IS' },
  { id: 4, key: 'inventory', number: '7', title: 'Inventario relevante' },
  { id: 5, key: 'spof', number: '8', title: 'SPOF' },
  { id: 6, key: 'metrics', number: '9', title: 'Métricas' },
  { id: 7, key: 'findings', number: '10', title: 'Hallazgos' },
  { id: 8, key: 'itil', number: '11', title: 'ITIL' },
  { id: 9, key: 'cobit', number: '12', title: 'COBIT' },
  { id: 10, key: 'iso27001', number: '13', title: 'ISO 27001' },
  { id: 11, key: 'strategy', number: '14', title: 'Estrategia tecnológica' },
  { id: 12, key: 'capex', number: '15', title: 'CAPEX/OPEX' },
  { id: 13, key: 'recommendations', number: '16', title: 'Recomendaciones' },
  { id: 14, key: 'conclusions', number: '17', title: 'Conclusiones' },
];

export function getDocumentSectionByKey(key) {
  return documentSections.find((section) => section.key === key) ?? null;
}
