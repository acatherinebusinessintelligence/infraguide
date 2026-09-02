export const availabilityExample = {
  topic: 'Disponibilidad',
  disclaimer:
    'Esta demostración te permite comprender cómo un dato del caso se transforma en cálculo, interpretación y contenido del informe. Tus resultados se generarán cuando completes las actividades correspondientes.',
  steps: {
    search: 'Información operacional disponible y registro de incidentes',
    extract: 'Periodo: 90 días (2.160 h)\nIndisponibilidad: suma de duraciones = 10 h 40 min',
    process: 'Disponibilidad =\n(2.160 − 10,67) / 2.160 × 100',
    interpret:
      'El servicio estuvo operativo aproximadamente el 99,51 % del periodo observado.',
    write:
      'Durante el periodo analizado, el servicio presentó una disponibilidad aproximada del 99,51 %. El resultado debe contrastarse con la criticidad del servicio y el SLA esperado. El total de indisponibilidad no aparece como cifra única en el PDF.',
  },
  trace: {
    source: 'Información operacional y registro de incidentes.',
    evidence: '2.160 h / 10 h 40 min (suma).',
    processing: 'Fórmula disponibilidad.',
    result: '≈ 99,51 %.',
    interpretation:
      'El servicio estuvo operativo aproximadamente el 99,51 % del periodo observado.',
    destination: 'Sección 6 - Métricas.',
  },
};
