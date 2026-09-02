import { CASE_MODE } from '../cases/caseMode.js';

function section(id, title) {
  return {
    sectionId: id,
    sectionTitle: title,
    blocks: [
      {
        title: title,
        fields: [{ key: `${id}-sample`, label: 'Dato de prueba', value: '1', source: { page: 1, quote: 'fixture' } }],
      },
    ],
  };
}

export function createStudentWorkFixture() {
  return {
    id: 'fixture-equipo-trabajo',
    name: 'Caso de trabajo (fixture de prueba)',
    kind: 'assigned',
    kindLabel: 'Caso de trabajo',
    caseMode: CASE_MODE.STUDENT_WORK,
    readOnly: false,
    stagesUnlocked: false,
    reportAvailable: false,
    useButtonLabel: 'SELECCIONAR CASO DE TRABAJO',
    summary: 'Fixture interno para pruebas. No es uno de los casos de equipo.',
    pedagogicalNote: 'Solo para simulación.',
    sections: [
      section('context', 'Contexto'),
      section('services', 'Servicios'),
      section('infrastructure', 'Infraestructura'),
      section('operational-data', 'Datos operativos'),
      section('incidents', 'Incidentes'),
      section('constraints', 'Restricciones'),
    ],
  };
}
