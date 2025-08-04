import type { ColorType } from "@/types/game"

export class ColorMixer {
  private static colorMixingRules: Record<string, ColorType> = {
    "red,yellow": "orange",
    "yellow,red": "orange",
    "blue,yellow": "green",
    "yellow,blue": "green",
    "red,blue": "magenta",
    "blue,red": "magenta",
    "red,red": "red",
    "blue,blue": "blue",
    "yellow,yellow": "yellow",
    "orange,orange": "orange",
    "green,green": "green",
    "magenta,magenta": "magenta",
  }

  static mixColors(colors: ColorType[]): ColorType[] {
    if (colors.length === 0) return []
    if (colors.length === 1) return colors
    if (colors.length > 2) return colors.slice(0, 2) // Max 2 layers

    const key = colors.sort().join(",")
    const result = this.colorMixingRules[key]

    if (result === "white") {
      throw new Error("Invalid color combination produces white")
    }

    return result ? [result] : colors
  }

  static getFinalColor(colors: ColorType[]): ColorType {
    if (colors.length === 0) return "empty"
    if (colors.length === 1) return colors[0]

    try {
      const mixed = this.mixColors(colors)
      return mixed[0]
    } catch {
      return "white" // Forbidden combination
    }
  }

  static getColorHex(color: ColorType): string {
    const colorMap: Record<ColorType, string> = {
      red: "#EF4444",
      blue: "#3B82F6",
      yellow: "#EAB308",
      orange: "#F97316",
      green: "#22C55E",
      magenta: "#EC4899",
      white: "#FFFFFF",
      empty: "transparent",
    }
    return colorMap[color] || "#000000"
  }

  static canMixColors(color1: ColorType, color2: ColorType): boolean {
    if (color1 === "empty" || color2 === "empty") return true

    const key = [color1, color2].sort().join(",")
    const result = this.colorMixingRules[key]

    return result !== "white" && result !== undefined
  }
}
