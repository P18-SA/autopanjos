import ContactoContent from "@/components/ContactoContent";
import { getContent } from "@/lib/content";

/**
 * Contacto.
 *
 * Server Component que resuelve la copy y se la pasa a la mitad interactiva
 * (el formulario, que necesita estado). Igual que en la home: el texto tiene
 * que estar en el HTML del servidor, no aparecer después desde el browser.
 */
export default async function ContactoPage() {
  const content = await getContent();

  return (
    <ContactoContent
      content={{
        h1: content.h1("Titulo h1 contact page", "CONTACTO"),
        direccion: content.h2("h2 contacto page", "Isla de Flores 1691, Palermo Montevideo"),
        texto: content.text(
          "texto contacto page",
          "Encuentra nuestro taller cerca tuyo ubicado a algunas cuadras de la intendecia de Montevideo"
        ),
      }}
    />
  );
}
