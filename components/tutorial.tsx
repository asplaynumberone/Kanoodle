"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, ArrowLeft, X } from "lucide-react"

interface TutorialProps {
  onComplete: () => void
}

export function Tutorial({ onComplete }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const tutorialSteps = [
    {
      title: "¡Bienvenido a Kanoodle Fusion!",
      content: (
        <div className="text-center space-y-4">
          <div className="text-6xl">🧩</div>
          <p>Un rompecabezas de lógica y colores que desafiará tu mente.</p>
          <p>Aprende las reglas básicas en este tutorial rápido.</p>
        </div>
      ),
    },
    {
      title: "El Objetivo",
      content: (
        <div className="space-y-4">
          <p>Tu objetivo es recrear el patrón de colores del tablero objetivo usando las piezas disponibles.</p>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <div className="grid grid-cols-3 gap-1 w-24 mx-auto mb-2">
              <div className="aspect-square bg-red-500 rounded-sm"></div>
              <div className="aspect-square bg-yellow-500 rounded-sm"></div>
              <div className="aspect-square bg-blue-500 rounded-sm"></div>
              <div className="aspect-square bg-green-500 rounded-sm"></div>
              <div className="aspect-square bg-orange-500 rounded-sm"></div>
              <div className="aspect-square bg-magenta-500 rounded-sm"></div>
            </div>
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">Tablero Objetivo</p>
          </div>
        </div>
      ),
    },
    {
      title: "Mezcla de Colores",
      content: (
        <div className="space-y-4">
          <p>Los colores se mezclan siguiendo estas reglas:</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded">
              <span>🔴 Rojo + 🟡 Amarillo</span>
              <span>= 🟠 Naranja</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded">
              <span>🔵 Azul + 🟡 Amarillo</span>
              <span>= 🟢 Verde</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded">
              <span>🔴 Rojo + 🔵 Azul</span>
              <span>= 🟣 Magenta</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">⚠️ Evita crear blanco - ¡bloquea la celda!</p>
        </div>
      ),
    },
    {
      title: "Colocando Piezas",
      content: (
        <div className="space-y-4">
          <p>Puedes colocar piezas de varias formas:</p>
          <ul className="space-y-2 text-sm">
            <li>
              • <strong>Tocar</strong> una pieza para seleccionarla, luego tocar el tablero
            </li>
            <li>
              • <strong>Arrastrar</strong> una pieza directamente al tablero
            </li>
            <li>
              • <strong>Rotar</strong> piezas con el botón de rotación
            </li>
            <li>
              • <strong>Reflejar</strong> piezas con el botón de reflejo
            </li>
          </ul>
          <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
            <p className="text-sm">
              💡 <strong>Consejo:</strong> Toca una pieza ya colocada para retirarla del tablero.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Capas y Límites",
      content: (
        <div className="space-y-4">
          <p>
            Cada celda del tablero puede tener máximo <strong>2 capas</strong> de color.
          </p>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div>
              <div className="aspect-square bg-red-500 rounded-sm mx-auto w-12 mb-1"></div>
              <p>1 Capa</p>
            </div>
            <div>
              <div className="aspect-square bg-orange-500 rounded-sm mx-auto w-12 mb-1"></div>
              <p>2 Capas Mezcladas</p>
            </div>
            <div>
              <div className="aspect-square bg-gray-300 rounded-sm mx-auto w-12 mb-1 flex items-center justify-center">
                <X className="h-4 w-4 text-red-500" />
              </div>
              <p>¡Prohibido!</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Sistema de Pistas",
      content: (
        <div className="space-y-4">
          <p>
            Si te quedas atascado, puedes usar hasta <strong>3 pistas</strong> por nivel:
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center p-2 bg-yellow-50 dark:bg-yellow-900 rounded">
              <span className="text-xl mr-2">💡</span>
              <span>Sugerir próxima pieza a colocar</span>
            </div>
            <div className="flex items-center p-2 bg-yellow-50 dark:bg-yellow-900 rounded">
              <span className="text-xl mr-2">🎯</span>
              <span>Resaltar posición óptima</span>
            </div>
            <div className="flex items-center p-2 bg-yellow-50 dark:bg-yellow-900 rounded">
              <span className="text-xl mr-2">👁️</span>
              <span>Mostrar parte del objetivo</span>
            </div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Usar pistas reduce tu puntuación final.</p>
        </div>
      ),
    },
    {
      title: "¡Listo para Jugar!",
      content: (
        <div className="text-center space-y-4">
          <div className="text-6xl">🎮</div>
          <p>Ya conoces todas las reglas básicas.</p>
          <p>¡Es hora de poner a prueba tus habilidades!</p>
          <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
            <p className="text-sm font-semibold">Recuerda:</p>
            <p className="text-sm">
              Piensa antes de colocar, usa las rotaciones y reflejo, y no tengas miedo de experimentar.
            </p>
          </div>
        </div>
      ),
    },
  ]

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const skipTutorial = () => {
    onComplete()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Tutorial</h1>
          <Button variant="ghost" onClick={skipTutorial} size="sm">
            Saltar
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{tutorialSteps[currentStep].title}</CardTitle>
              <span className="text-sm text-gray-500">
                {currentStep + 1} / {tutorialSteps.length}
              </span>
            </div>
          </CardHeader>
          <CardContent>{tutorialSteps[currentStep].content}</CardContent>
        </Card>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          <Button onClick={nextStep}>
            {currentStep === tutorialSteps.length - 1 ? (
              <>
                Comenzar
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            ) : (
              <>
                Siguiente
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
