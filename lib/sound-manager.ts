export class SoundManager {
  private static audioContext: AudioContext | null = null
  private static enabled = true

  static init() {
    if (typeof window !== "undefined" && !this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }

  static setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  static playTone(frequency: number, duration: number, type: OscillatorType = "sine") {
    if (!this.enabled || !this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.frequency.value = frequency
    oscillator.type = type

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + duration)
  }

  static playPiecePlaced() {
    this.playTone(440, 0.1, "sine") // A4 note
  }

  static playPieceRemoved() {
    this.playTone(330, 0.1, "sine") // E4 note
  }

  static playInvalidMove() {
    this.playTone(200, 0.2, "sawtooth") // Low harsh tone
  }

  static playLevelComplete() {
    // Play a happy melody
    setTimeout(() => this.playTone(523, 0.2), 0) // C5
    setTimeout(() => this.playTone(659, 0.2), 200) // E5
    setTimeout(() => this.playTone(784, 0.2), 400) // G5
    setTimeout(() => this.playTone(1047, 0.4), 600) // C6
  }

  static playHint() {
    this.playTone(880, 0.15, "triangle") // A5 note
  }
}
