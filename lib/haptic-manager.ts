export class HapticManager {
  private static enabled = true

  static setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  static vibrate(pattern: number | number[]) {
    if (!this.enabled || typeof window === "undefined" || !navigator.vibrate) {
      return
    }

    navigator.vibrate(pattern)
  }

  static piecePlaced() {
    this.vibrate(50) // Short vibration
  }

  static pieceRemoved() {
    this.vibrate([30, 20, 30]) // Double tap pattern
  }

  static invalidMove() {
    this.vibrate([100, 50, 100]) // Error pattern
  }

  static levelComplete() {
    this.vibrate([200, 100, 200, 100, 400]) // Success pattern
  }

  static hint() {
    this.vibrate([50, 30, 50]) // Gentle notification
  }
}
