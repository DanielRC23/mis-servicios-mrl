import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default function MissionPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Mission Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-gray-900">📜 Misión</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed">
                Brindar un espacio confiable y accesible donde clientes y prestadores de servicios puedan conectarse de
                manera directa, segura y transparente. Nos comprometemos a ofrecer herramientas que fomenten la calidad,
                el profesionalismo y la honestidad, asegurando que cada usuario encuentre soluciones reales a sus
                necesidades, libres de engaños y con una experiencia justa y eficiente.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
