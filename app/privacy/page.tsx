import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
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
            <CardTitle className="text-2xl flex items-center gap-2">📄 AVISO DE PRIVACIDAD</CardTitle>
            <p className="text-sm text-gray-600">Última actualización: 11 de agosto del 2025</p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p className="mb-6">
              Mis Servicios Mrl, con domicilio en Morelia, Michoacán, es responsable del tratamiento de los datos
              personales que usted nos proporciona, los cuales serán protegidos conforme a lo dispuesto por la Ley
              Federal de Protección de Datos Personales en Posesión de los Particulares.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">1. DATOS PERSONALES QUE RECABAMOS</h2>
                <p className="mb-4">Podemos solicitar:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Nombre completo.</li>
                  <li>Correo electrónico y teléfono.</li>
                  <li>Ubicación aproximada.</li>
                  <li>Información de pago (procesada por terceros).</li>
                  <li>Datos de uso de la Plataforma.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">2. FINALIDADES DEL TRATAMIENTO</h2>
                <p className="mb-4">Sus datos serán utilizados para:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Crear y administrar su cuenta.</li>
                  <li>Publicar y promocionar sus servicios (si es Prestador).</li>
                  <li>Facilitar el contacto entre Clientes y Prestadores.</li>
                  <li>Gestionar cobros de suscripciones.</li>
                  <li>Mostrar publicidad personalizada.</li>
                  <li>Mejorar la experiencia en la Plataforma.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">3. TRANSFERENCIA DE DATOS</h2>
                <p className="mb-4">
                  No compartimos datos personales con terceros sin su consentimiento, salvo que sea necesario para:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Procesar pagos.</li>
                  <li>Cumplir con obligaciones legales.</li>
                  <li>Operar la Plataforma mediante proveedores de tecnología y publicidad.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">4. DERECHOS ARCO</h2>
                <p>
                  Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse al tratamiento de sus datos personales
                  enviando una solicitud a contacto@misserviciosmrl.com. Responderemos en un máximo de 20 días hábiles.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">5. USO DE COOKIES</h2>
                <p>
                  La Plataforma utiliza cookies y tecnologías similares para mejorar el servicio y mostrar publicidad.
                  Puede desactivarlas desde su navegador, aunque esto puede afectar su experiencia.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">6. CAMBIOS AL AVISO</h2>
                <p>
                  Podemos modificar este Aviso y lo notificaremos a través de la Plataforma. El uso continuado implica
                  su aceptación.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
