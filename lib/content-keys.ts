/**
 * Qué entry de cemapi corresponde a cada pedazo de copy del sitio.
 *
 * ## Por qué el id y no el nombre
 *
 * El `nombre` / `name` / `alt` de una entry es un campo editable desde el
 * panel: es la etiqueta que el editor usa para encontrarla, no una clave. Si el
 * sitio se referenciara por ahí, renombrar "texto home page" a "texto principal"
 * dejaría la home mostrando la copy de respaldo sin ningún aviso — un cambio que
 * desde el panel parece inofensivo. El id es inmutable mientras la entry exista,
 * así que apuntando a él el editor puede cambiar el nombre, el contenido y la
 * imagen asociada sin tocar nada de este repo.
 *
 * ## Por qué igual va el nombre
 *
 * El id sobrevive a cualquier edición pero no a un borrado: si una entry se
 * elimina y se vuelve a crear, cemapi le da un id nuevo y la referencia de acá
 * queda apuntando a la nada. El nombre cubre justo ese caso, así que la
 * búsqueda intenta primero por id y cae al nombre. Las dos claves fallan a la
 * vez sólo si se borra la entry *y* se la recrea con otro nombre, y ahí el
 * respaldo hardcodeado de cada llamada mantiene la página en pie.
 *
 * Cuando el nombre resuelve algo que el id no encontró, `lib/content.ts` lo
 * avisa por consola en desarrollo: es la señal de que el id de acá quedó viejo
 * y conviene actualizarlo.
 *
 * ## Cómo agregar una entry
 *
 * Crearla y publicarla en el panel, y copiar acá su id y su nombre:
 *
 *     curl -s "https://cemapi-kappa.vercel.app/api/jotalsoftdevs/entries/textos" \
 *       | jq -r '.data[] | "\(.id) \(.data.nombre // .data.name // .data.alt)"'
 */

/**
 * Una entry, identificada por lo que no cambia y por lo que se lee.
 *
 * El `name` está de respaldo, pero también es lo que hace legible el archivo:
 * un uuid suelto no dice a qué entry del panel corresponde.
 */
export type ContentKey = { id: string; name: string };

export const KEYS = {
  /* Home ---------------------------------------------------------------- */
  homeH1: { id: "975e62a4-f2bd-488d-83a2-0a0939ab5ca7", name: "Titulo h1 home page" },
  homeH2: { id: "edd51c49-1c36-4df8-84f9-ca76b1422530", name: "h2 home page" },
  homeText: { id: "17d9850f-5b3e-443a-b8ef-22506ab5bd29", name: "texto home page" },
  homeImage: { id: "9bfd4692-8d6a-4611-8df4-5c44ad90961c", name: "home-image" },

  /* Nosotros ------------------------------------------------------------ */
  nosotrosH1: { id: "ee57978c-4007-4a7a-9992-041862a863a0", name: "Titulo h1 nosotros page" },
  nosotrosH2: { id: "58f93c11-fa3d-429a-bf06-efec5639598e", name: "h2 nosotros page" },
  nosotrosText: { id: "35b64609-67e5-4453-ac3d-4e671ec5ba2d", name: "texto nosotros page" },
  nosotrosFoto1: { id: "1da0576c-b830-42c8-9d43-041a7be01554", name: "nosotros-1" },
  nosotrosFoto2: { id: "58bb7cd0-22e9-42f6-8d45-b5b8b625d0a7", name: "nosotros-2" },
  nosotrosFoto3: { id: "3c123218-43fc-43f1-a626-e0a04d3dcf8c", name: "nosotros-3" },

  /* Servicios ----------------------------------------------------------- */
  serviciosH1: { id: "1f4b41eb-49a5-4cc3-8df4-2a9ef2bbcbe6", name: "Titulo h1 service page" },
  serviciosText: { id: "32789686-22e0-45f4-a9f8-d6aa08cbd614", name: "texto servicios page" },
  servicioInyeccion: {
    id: "a3f8e3c4-ce72-4a8e-8bfb-f4bdfc477b92",
    name: "Servicio de inyección electrónica",
  },
  servicioMecanica: {
    id: "6215ea43-1fdf-4601-a9ad-85c180ef3e70",
    name: "Servicio de mecánica integral",
  },
  servicioElectronica: {
    id: "f3acb940-d92d-428a-be9d-39e100513428",
    name: "Servicio de electrónica automotriz",
  },
  servicioAire: {
    id: "ce0cd48e-295f-4ce5-858d-414bd7ac236a",
    name: "Servicio de aire acondicionado",
  },
  servicioAlineacion: {
    id: "9e84a2e8-b425-4e13-8fa5-3b4cad440ccb",
    name: "Servicio de alineación y balanceo",
  },

  /* Contacto ------------------------------------------------------------ */
  contactoH1: { id: "ec2f6875-844b-4e8c-934d-beb5e282caa6", name: "Titulo h1 contact page" },
  contactoH2: { id: "122a4736-3198-414f-9ff3-57c6bb81c123", name: "h2 contacto page" },
  contactoText: { id: "6f720179-bf9f-4e82-aa82-0754ba7c5a1a", name: "texto contacto page" },
} as const satisfies Record<string, ContentKey>;
