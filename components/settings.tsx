"use client"

import { useSettings } from "@/contexts/settings-context"
import { GameStorage } from "@/lib/game-storage"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Download, Upload, Trash2 } from "lucide-react"

interface SettingsProps {
  onBack: () => void
}

export function Settings({ onBack }: SettingsProps) {
  const {
    theme,
    language,
    soundEnabled,
    vibrationEnabled,
    setTheme,
    setLanguage,
    setSoundEnabled,
    setVibrationEnabled,
  } = useSettings()

  const handleExportData = () => {
    const data = GameStorage.exportGameData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `kanoodle-fusion-backup-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportData = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string)
            if (GameStorage.importGameData(data)) {
              alert("Datos importados correctamente")
              window.location.reload()
            } else {
              alert("Error al importar los datos")
            }
          } catch {
            alert("Archivo inválido")
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleClearData = () => {
    if (confirm("¿Estás seguro de que quieres borrar todos los datos? Esta acción no se puede deshacer.")) {
      GameStorage.clearAllData()
      alert("Datos borrados correctamente")
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={onBack} className="mr-4">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Configuración</h1>
        </div>

        {/* Appearance */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Apariencia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tema</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "light", label: "Claro" },
                  { value: "dark", label: "Oscuro" },
                  { value: "high-contrast", label: "Alto Contraste" },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={theme === option.value ? "default" : "outline"}
                    onClick={() => setTheme(option.value as any)}
                    size="sm"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Idioma</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "es", label: "Español" },
                  { value: "en", label: "English" },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={language === option.value ? "default" : "outline"}
                    onClick={() => setLanguage(option.value as any)}
                    size="sm"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audio & Haptics */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Audio y Vibración</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Sonido</label>
              <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Vibración</label>
              <Switch checked={vibrationEnabled} onCheckedChange={setVibrationEnabled} />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Datos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={handleExportData} variant="outline" className="w-full justify-start bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Exportar Datos
            </Button>
            <Button onClick={handleImportData} variant="outline" className="w-full justify-start bg-transparent">
              <Upload className="h-4 w-4 mr-2" />
              Importar Datos
            </Button>
            <Button onClick={handleClearData} variant="destructive" className="w-full justify-start">
              <Trash2 className="h-4 w-4 mr-2" />
              Borrar Todos los Datos
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
