export const availabilityExample = {
  topic: 'Disponibilidad',
  disclaimer:
    'Este es únicamente un ejemplo para validar el diseño. No es una calculadora ni un resultado del caso.',
  steps: {
    search: 'Información operacional disponible',
    extract: 'Tiempo observado: 720 h\nIndisponibilidad: 12 h',
    process: 'Disponibilidad =\n(720 − 12) / 720 × 100',
    interpret:
      'El servicio estuvo operativo aproximadamente el 98,33 % del periodo observado.',
    write:
      'Durante el periodo analizado, el servicio presentó una disponibilidad aproximada del 98,33 %. El resultado debe contrastarse con la criticidad del servicio y el SLA esperado.',
  },
  trace: {
    source: 'Información operacional.',
    evidence: '720 h / 12 h caída.',
    processing: 'Fórmula disponibilidad.',
    result: '98,33 %.',
    interpretation:
      'El servicio estuvo operativo aproximadamente el 98,33 % del periodo observado.',
    destination: 'Sección 6 - Métricas.',
  },
};
