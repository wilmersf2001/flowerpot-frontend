/**
 * Contenido de las páginas legales: Términos, Privacidad y Tratamiento de datos.
 *
 * ⚠️ BORRADOR. Redactado con base en la normativa peruana vigente (Ley 29733 de
 * Protección de Datos Personales y su reglamento, D.S. 016-2024-JUS; Código de
 * Protección y Defensa del Consumidor), pero NO sustituye la revisión de un
 * abogado. Antes de lanzar:
 *  1. Completar `LEGAL_ENTITY` (razón social, RUC, dirección, correos). Los
 *     valores entre corchetes se ven tal cual en la web hasta que se llenen.
 *  2. Que un abogado revise los tres textos, en especial: datos biométricos
 *     (dato sensible: exige consentimiento expreso), transferencias a terceros
 *     (proveedor de nube) y límites de responsabilidad.
 *  3. Inscribir el banco de datos propio ante la ANPD (Registro Nacional de
 *     Protección de Datos Personales) y poner aquí el código de inscripción.
 *  4. Confirmar que cada afirmación técnica (cifrado, respaldos, retención,
 *     subencargados) sea cierta en producción.
 */

export const LEGAL_ENTITY = {
  brand: "Flowerpot",
  legalName: "[Razón social pendiente]",
  ruc: "[RUC pendiente]",
  address: "[Dirección fiscal pendiente], Perú",
  contactEmail: "[contacto@dominio.pe]",
  privacyEmail: "[privacidad@dominio.pe]",
  /** Código de inscripción del banco de datos ante la ANPD, cuando exista. */
  anpdRegistry: "[Código de inscripción ANPD pendiente]",
} as const;

export const LEGAL_UPDATED = "14 de noviembre de 2026";

export interface LegalSection {
  id: string;
  title: string;
  paragraphs?: string[];
  list?: string[];
}

export interface LegalDoc {
  slug: "terminos" | "privacidad" | "tratamiento-de-datos";
  title: string;
  metaDescription: string;
  intro: string;
  sections: LegalSection[];
}

const E = LEGAL_ENTITY;

export const TERMS_DOC: LegalDoc = {
  slug: "terminos",
  title: "Términos y condiciones de uso",
  metaDescription:
    "Condiciones que rigen el uso de la plataforma Flowerpot: cuenta, planes, pagos, hardware, uso aceptable, datos y responsabilidad.",
  intro: `Estos términos regulan el uso de la plataforma ${E.brand}, operada por ${E.legalName} (RUC ${E.ruc}). Al crear una cuenta o usar el servicio aceptas estas condiciones. Si no estás de acuerdo, no utilices la plataforma.`,
  sections: [
    {
      id: "servicio",
      title: "1. El servicio",
      paragraphs: [
        `${E.brand} es un software en la nube (SaaS) para la gestión de gimnasios: socios, membresías, cobros, control de acceso, asistencia y reportes. Se presta tal como se describe en la web y puede evolucionar con el tiempo.`,
      ],
    },
    {
      id: "cuenta",
      title: "2. Tu cuenta",
      list: [
        "Debes ser mayor de edad y tener capacidad legal para contratar en nombre de tu gimnasio.",
        "La información que nos das al registrarte debe ser veraz y estar actualizada.",
        "Eres responsable de la confidencialidad de las credenciales y de lo que se haga desde tu cuenta, incluidos los usuarios que crees para tu equipo.",
        "Avísanos de inmediato si sospechas de un uso no autorizado.",
      ],
    },
    {
      id: "planes-pagos",
      title: "3. Planes, prueba gratuita y pagos",
      list: [
        "Los planes y sus precios se muestran en la web e incluyen IGV. Emitimos comprobante de pago por cada cobro.",
        "La prueba gratuita dura 14 días y no requiere tarjeta. Al terminar, si no contratas un plan, la cuenta se pausa.",
        "Los planes son mensuales, sin permanencia mínima. Puedes cancelar cuando quieras; la cancelación rige desde el siguiente periodo y no se devuelven periodos ya iniciados, salvo que la ley disponga otra cosa.",
        "Podemos modificar precios con aviso previo razonable; el cambio aplica desde el siguiente periodo de facturación.",
      ],
    },
    {
      id: "hardware",
      title: "4. Hardware e integración",
      paragraphs: [
        "Los equipos de control de acceso homologados que figuran en la lista de hardware compatible de nuestra web (hoy, el biométrico ZKTeco SpeedFace-V4L) son conectados y configurados al sistema por el equipo de Flowerpot, según el plan contratado. Los lectores de código QR y el registro manual desde recepción funcionan sin equipos adicionales de Flowerpot.",
        "El alcance concreto (suministro, instalación, garantía y soporte del equipo) se detalla en la propuesta o contrato de cada gimnasio. Los equipos que no figuren en la lista se homologan individualmente antes de usarse y podrían no ser integrables.",
        "El funcionamiento del hardware depende además de factores fuera de nuestro control, como la conexión a internet, la energía eléctrica y las condiciones del local.",
      ],
    },
    {
      id: "uso-aceptable",
      title: "5. Uso aceptable",
      paragraphs: ["Te comprometes a no:"],
      list: [
        "usar la plataforma para fines ilícitos o contrarios a la ley;",
        "intentar acceder a datos de otros gimnasios, vulnerar la seguridad o sobrecargar el servicio;",
        "copiar, revender o realizar ingeniería inversa del software;",
        "cargar datos de personas sin tener derecho a tratarlos o sin haber cumplido con informarles y, cuando corresponda, obtener su consentimiento.",
      ],
    },
    {
      id: "datos",
      title: "6. Tus datos y los de tus socios",
      paragraphs: [
        "Los datos que cargas en la plataforma son tuyos. Respecto de los datos personales de tus socios, tu gimnasio es el responsable del tratamiento y Flowerpot actúa como encargado, tratándolos únicamente para prestarte el servicio y siguiendo tus instrucciones. Los detalles están en la política de Tratamiento de datos.",
        "Puedes exportar tu información en cualquier momento. Tras cancelar la cuenta, conservamos los datos por un plazo limitado para que puedas recuperarlos y luego los eliminamos o anonimizamos, salvo obligación legal de conservarlos.",
      ],
    },
    {
      id: "disponibilidad",
      title: "7. Disponibilidad y soporte",
      paragraphs: [
        "Trabajamos para mantener el servicio disponible de forma continua, pero pueden existir interrupciones por mantenimiento o causas ajenas. Avisaremos con anticipación los mantenimientos programados cuando sea posible. El soporte se brinda por los canales indicados en la web.",
      ],
    },
    {
      id: "propiedad-intelectual",
      title: "8. Propiedad intelectual",
      paragraphs: [
        `El software, la marca ${E.brand}, el diseño y los contenidos de la plataforma son de ${E.legalName} o de sus licenciantes. Te concedemos una licencia limitada, no exclusiva e intransferible para usarlos mientras tu cuenta esté activa.`,
      ],
    },
    {
      id: "responsabilidad",
      title: "9. Responsabilidad",
      paragraphs: [
        "El servicio se ofrece con diligencia razonable, pero no garantizamos que esté libre de errores. En la medida permitida por la ley, nuestra responsabilidad total frente a ti se limita al monto pagado por el servicio en los últimos 12 meses, y no respondemos por lucro cesante ni daños indirectos. Esto no excluye la responsabilidad que la ley no permita limitar.",
      ],
    },
    {
      id: "suspension",
      title: "10. Suspensión y terminación",
      paragraphs: [
        "Podemos suspender o cerrar una cuenta que incumpla estos términos, con aviso previo salvo riesgo grave para la seguridad o el servicio. Tú puedes cerrar tu cuenta cuando quieras.",
      ],
    },
    {
      id: "cambios",
      title: "11. Cambios en estos términos",
      paragraphs: [
        "Podemos actualizar estos términos. Si el cambio es relevante, te avisaremos por correo o dentro de la plataforma con antelación razonable. Seguir usando el servicio después implica aceptar la versión vigente.",
      ],
    },
    {
      id: "ley",
      title: "12. Ley aplicable, reclamos y contacto",
      paragraphs: [
        "Estos términos se rigen por las leyes de la República del Perú. Las controversias se someten a los jueces y tribunales competentes del domicilio indicado, sin perjuicio de los derechos que la normativa de consumo reconozca a quien corresponda.",
        `Para consultas o reclamos escríbenos a ${E.contactEmail}. También puedes presentar un reclamo en nuestro Libro de Reclamaciones virtual.`,
      ],
    },
  ],
};

export const PRIVACY_DOC: LegalDoc = {
  slug: "privacidad",
  title: "Política de privacidad",
  metaDescription:
    "Qué datos personales recopila Flowerpot, para qué los usa, con quién los comparte, cuánto tiempo los conserva y cómo ejercer tus derechos.",
  intro: `Esta política explica cómo ${E.legalName} (${E.brand}, RUC ${E.ruc}) trata los datos personales de quienes visitan este sitio, solicitan una prueba o usan la plataforma como administradores de un gimnasio. Para los datos de los socios de cada gimnasio aplica la política de Tratamiento de datos.`,
  sections: [
    {
      id: "responsable",
      title: "1. Quién es el responsable",
      paragraphs: [
        `${E.legalName}, con domicilio en ${E.address}. Contacto de privacidad: ${E.privacyEmail}. Banco de datos inscrito ante la Autoridad Nacional de Protección de Datos Personales (ANPD): ${E.anpdRegistry}.`,
      ],
    },
    {
      id: "datos",
      title: "2. Qué datos recopilamos",
      list: [
        "Datos de contacto y de cuenta: nombre, correo, teléfono, cargo, nombre y datos del gimnasio.",
        "Datos de facturación: razón social, RUC, dirección y comprobantes. No almacenamos los datos completos de tu tarjeta.",
        "Datos de uso: acciones en la plataforma, registros de acceso, dirección IP, tipo de dispositivo y navegador.",
        "Comunicaciones: mensajes que nos envías por chat, correo o formularios.",
        "Cookies y tecnologías similares del sitio (ver sección 7).",
      ],
    },
    {
      id: "finalidades",
      title: "3. Para qué los usamos",
      list: [
        "Crear y administrar tu cuenta y prestarte el servicio contratado.",
        "Facturar, cobrar y cumplir obligaciones tributarias y contables.",
        "Brindarte soporte y comunicarte avisos del servicio.",
        "Proteger la seguridad de la plataforma y prevenir fraudes.",
        "Mejorar el producto con métricas de uso agregadas.",
        "Enviarte novedades comerciales, solo si lo aceptaste; puedes retirarte cuando quieras.",
      ],
    },
    {
      id: "base-legal",
      title: "4. Base legal",
      paragraphs: [
        "Tratamos tus datos para ejecutar el contrato contigo, cumplir obligaciones legales, por nuestro interés legítimo en la seguridad y mejora del servicio, y con tu consentimiento cuando la ley lo exige (por ejemplo, comunicaciones comerciales).",
      ],
    },
    {
      id: "terceros",
      title: "5. Con quién los compartimos",
      paragraphs: [
        "No vendemos tus datos. Solo los compartimos con proveedores que nos ayudan a operar el servicio y que están obligados a protegerlos:",
      ],
      list: [
        "alojamiento en la nube y respaldos;",
        "procesamiento de pagos y facturación electrónica;",
        "herramientas de soporte, correo y analítica;",
        "autoridades, cuando una norma o resolución lo exija.",
      ],
    },
    {
      id: "transferencias",
      title: "6. Transferencias internacionales",
      paragraphs: [
        "Algunos proveedores pueden almacenar o procesar datos fuera del Perú. En esos casos exigimos un nivel de protección adecuado conforme a la Ley 29733 y su reglamento.",
      ],
    },
    {
      id: "cookies",
      title: "7. Cookies",
      paragraphs: [
        "Usamos cookies necesarias para que el sitio funcione y, con tu consentimiento, cookies de analítica para entender cómo se usa. Puedes bloquearlas desde la configuración de tu navegador.",
      ],
    },
    {
      id: "conservacion",
      title: "8. Cuánto tiempo los conservamos",
      paragraphs: [
        "Mientras tu cuenta esté activa y, después, durante el plazo necesario para cumplir obligaciones legales y tributarias o atender reclamos. Cumplido ese plazo los eliminamos o anonimizamos.",
      ],
    },
    {
      id: "seguridad",
      title: "9. Cómo los protegemos",
      paragraphs: [
        "Aplicamos medidas técnicas y organizativas: conexión cifrada (HTTPS), datos cifrados en reposo, aislamiento de los datos de cada gimnasio, control de accesos por rol, registro de actividad y respaldos periódicos. Más detalle en la página de Seguridad.",
      ],
    },
    {
      id: "derechos",
      title: "10. Tus derechos",
      paragraphs: [
        `Puedes ejercer tus derechos de acceso, rectificación, cancelación (supresión), oposición, información y revocación del consentimiento escribiendo a ${E.privacyEmail} e indicando tu nombre y el derecho que ejerces; podemos pedirte un documento que acredite tu identidad. Respondemos dentro de los plazos de ley. Si consideras que no atendimos tu solicitud, puedes acudir a la ANPD (Ministerio de Justicia y Derechos Humanos).`,
      ],
    },
    {
      id: "menores",
      title: "11. Menores de edad",
      paragraphs: [
        "El sitio y las cuentas de administración están dirigidos a adultos. Los datos de socios menores de edad los registra cada gimnasio, que debe contar con la autorización de sus padres o tutores.",
      ],
    },
    {
      id: "cambios",
      title: "12. Cambios",
      paragraphs: [
        "Publicaremos aquí cualquier actualización con su fecha. Si el cambio es relevante te lo avisaremos por un medio directo.",
      ],
    },
  ],
};

export const DATA_PROCESSING_DOC: LegalDoc = {
  slug: "tratamiento-de-datos",
  title: "Tratamiento y protección de datos de socios",
  metaDescription:
    "Cómo Flowerpot trata los datos personales de los socios de tu gimnasio como encargado del tratamiento: roles, biometría, seguridad, aislamiento, retención y derechos.",
  intro: `Este documento explica cómo ${E.brand} trata los datos de los socios de cada gimnasio. Cada gimnasio decide para qué usa esos datos (es el responsable); ${E.brand} los trata solo para prestar el servicio y bajo sus instrucciones (es el encargado), conforme a la Ley 29733 y su reglamento.`,
  sections: [
    {
      id: "roles",
      title: "1. Roles",
      list: [
        "Gimnasio: titular del banco de datos de sus socios y responsable del tratamiento. Decide qué datos registra, con qué finalidad y debe informar a sus socios y obtener los consentimientos que correspondan.",
        `${E.brand}: encargado del tratamiento. Trata los datos por cuenta del gimnasio, únicamente para operar la plataforma, y no los usa para fines propios.`,
      ],
    },
    {
      id: "datos",
      title: "2. Datos que puede tratar la plataforma",
      list: [
        "Identificación y contacto del socio: nombre, documento, teléfono, correo.",
        "Membresía, pagos y estado de cuenta.",
        "Asistencia y registros de ingreso.",
        "Datos biométricos (huella, rostro o palma), solo si el gimnasio activa esa modalidad de acceso.",
      ],
    },
    {
      id: "biometricos",
      title: "3. Datos biométricos",
      paragraphs: [
        "Los datos biométricos son datos sensibles. El gimnasio debe obtener el consentimiento previo, expreso e informado de cada socio antes de registrarlos, y ofrecer una alternativa de acceso (por ejemplo, QR) para quien no lo otorgue.",
        "Se usan únicamente para validar el ingreso. No se emplean para perfilar, no se venden ni se comparten con otros gimnasios.",
      ],
    },
    {
      id: "finalidad",
      title: "4. Finalidad del tratamiento",
      paragraphs: [
        "Gestionar socios y membresías, controlar accesos, registrar cobros y asistencia y generar reportes para el gimnasio. No usamos los datos de tus socios para publicidad ni los cedemos a terceros ajenos al servicio.",
      ],
    },
    {
      id: "aislamiento",
      title: "5. Aislamiento y seguridad",
      list: [
        "Aislamiento por gimnasio (multi-tenant): cada gimnasio solo accede a su propia información.",
        "Cifrado en tránsito (HTTPS) y en reposo.",
        "Roles y permisos por sede; la exportación masiva está restringida por rol.",
        "Registro de actividad de acciones sensibles.",
        "Respaldos periódicos con retención limitada.",
        "Acceso del personal de Flowerpot restringido, autorizado por el gimnasio para casos de soporte y registrado.",
        "Confidencialidad: el personal con acceso está obligado a guardar reserva.",
      ],
    },
    {
      id: "subencargados",
      title: "6. Subencargados",
      paragraphs: [
        "Para operar el servicio usamos proveedores (alojamiento en la nube, correo, procesamiento de pagos). Los contratamos bajo obligaciones de confidencialidad y seguridad equivalentes a las de este documento. Podemos facilitar la lista actualizada de subencargados al gimnasio que la solicite.",
      ],
    },
    {
      id: "derechos",
      title: "7. Derechos de los socios",
      paragraphs: [
        `Los socios ejercen sus derechos de acceso, rectificación, cancelación y oposición ante su gimnasio. Si un socio nos escribe a ${E.privacyEmail}, trasladaremos la solicitud al gimnasio correspondiente y lo asistiremos con las herramientas de la plataforma (consulta, corrección, eliminación y exportación).`,
      ],
    },
    {
      id: "incidentes",
      title: "8. Incidentes de seguridad",
      paragraphs: [
        "Si detectamos una brecha que afecte datos personales, avisaremos al gimnasio afectado sin demora injustificada y le daremos la información necesaria para que cumpla sus propias obligaciones de notificación.",
      ],
    },
    {
      id: "retencion",
      title: "9. Conservación y devolución de datos",
      paragraphs: [
        "Los datos se conservan mientras la cuenta del gimnasio esté activa. Al cerrar la cuenta, el gimnasio puede exportar toda su información; transcurrido un plazo limitado, la eliminamos o anonimizamos, salvo obligación legal de conservarla. Los respaldos se depuran según su ciclo de retención.",
      ],
    },
    {
      id: "contacto",
      title: "10. Contacto",
      paragraphs: [
        `Consultas sobre protección de datos: ${E.privacyEmail}. Autoridad competente: Autoridad Nacional de Protección de Datos Personales (ANPD), Ministerio de Justicia y Derechos Humanos del Perú.`,
      ],
    },
  ],
};
