import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">📄 TÉRMINOS Y CONDICIONES DE USO</CardTitle>
            <p className="text-sm text-gray-600">Última actualización: 11 de agosto del 2025</p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p className="mb-6">
              Bienvenido(a) a: Mis Servicios Mrl ("la Plataforma"), propiedad de RC Corp ("nosotros" o "la Empresa"). Al
              acceder o utilizar la Plataforma, usted ("Usuario") acepta estos Términos y Condiciones. Si no está de
              acuerdo, debe abstenerse de usarla.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">1. OBJETO DE LA PLATAFORMA</h2>
                <p>
                  La Plataforma actúa como un punto de encuentro entre personas que ofrecen servicios ("Prestadores") y
                  personas que los buscan ("Clientes").
                </p>
                <p className="mt-2">
                  La Empresa no presta directamente los servicios ofrecidos por los Prestadores, ni participa en la
                  relación contractual ni en los pagos entre Cliente y Prestador.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">2. REGISTRO Y CUENTAS</h2>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>
                    Para publicar servicios, el Prestador debe registrarse, completar su perfil y contratar una
                    suscripción activa.
                  </li>
                  <li>
                    Los Clientes pueden registrarse para acceder a funciones adicionales, como eliminar anuncios o usar
                    herramientas exclusivas.
                  </li>
                  <li>La información proporcionada debe ser veraz y actualizada.</li>
                  <li>Nos reservamos el derecho de suspender cuentas que incumplan nuestras políticas.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">3. SUSCRIPCIONES Y PAGOS</h2>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>
                    Las tarifas de suscripción para Prestadores y Clientes (en caso de suscripción premium) se indican
                    en la Plataforma y pueden modificarse previa notificación.
                  </li>
                  <li>
                    El pago se procesa a través de proveedores externos seguros (por ejemplo, MercadoPago u otros). No
                    almacenamos información completa de tarjetas de pago.
                  </li>
                  <li>
                    No se reembolsarán suscripciones ya iniciadas, salvo por fallos técnicos atribuibles a la Empresa.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">4. PUBLICIDAD</h2>
                <p>
                  La Plataforma incluye espacios publicitarios que pueden ser propios o de terceros (por ejemplo, Google
                  AdSense).
                </p>
                <p className="mt-2">
                  Los usuarios que adquieran planes sin anuncios no verán publicidad en su cuenta mientras dure su
                  suscripción.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">5. RESPONSABILIDAD DE LOS PRESTADORES</h2>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>
                    Cada Prestador es responsable de la calidad, legalidad, veracidad y transparencia de los servicios
                    que ofrece.
                  </li>
                  <li>
                    Nos reservamos el derecho de dar de baja a Prestadores que reciban quejas reiteradas o que incurran
                    en prácticas engañosas.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">6. RELACIÓN ENTRE CLIENTE Y PRESTADOR</h2>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>La Empresa no interviene en los acuerdos entre Cliente y Prestador.</li>
                  <li>
                    No nos hacemos responsables por daños, pérdidas o incumplimientos derivados de dicha relación.
                  </li>
                  <li>
                    Recomendamos mantener la comunicación y acuerdos dentro de la Plataforma para mayor seguridad.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">7. PROPIEDAD INTELECTUAL</h2>
                <p>
                  Todo el contenido de la Plataforma (logotipos, textos, diseño, software) es propiedad de la Empresa o
                  de sus licenciantes y está protegido por leyes de propiedad intelectual.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">8. MODIFICACIONES</h2>
                <p>
                  Podemos actualizar estos Términos en cualquier momento. Publicaremos la fecha de última modificación y
                  el uso continuado implica aceptación de los cambios.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">9. LEGISLACIÓN APLICABLE</h2>
                <p>
                  Estos Términos se rigen por las leyes de México. Cualquier disputa será resuelta en los tribunales
                  competentes de Morelia, Michoacán.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
