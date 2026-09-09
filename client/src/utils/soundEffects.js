// Web Audio API procedural sound generator
class SoundFX {
  constructor() {
    this.ctx = null
    this.muted = false
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (AudioContext) {
        this.ctx = new AudioContext()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  toggleMute() {
    this.muted = !this.muted
    return this.muted
  }

  // Tarikan karet ketapel
  playPull(distance = 1) {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    try {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sawtooth'
      const freq = 120 + distance * 150
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime)
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1)

      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start()
      osc.stop(this.ctx.currentTime + 0.1)
    } catch (e) {
      console.warn('Audio error', e)
    }
  }

  // Tembakan / pelontaran
  playLaunch() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    try {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(450, this.ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.25)

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25)

      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start()
      osc.stop(this.ctx.currentTime + 0.25)
    } catch (e) {
      console.warn('Audio error', e)
    }
  }

  // SKILL: Chuck Speed Boost (Turbo Whoosh)
  playSpeedBoost() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    try {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(250, this.ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.2)

      gain.gain.setValueAtTime(0.35, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3)

      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start()
      osc.stop(this.ctx.currentTime + 0.3)
    } catch (e) {}
  }

  // SKILL: Bomb Explosion (Ledakan Menggelegar)
  playExplosion() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    try {
      // Noise buffer untuk gemuruh ledakan
      const bufferSize = this.ctx.sampleRate * 0.5
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }

      const noise = this.ctx.createBufferSource()
      noise.buffer = buffer

      const filter = this.ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(600, this.ctx.currentTime)
      filter.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.5)

      const gain = this.ctx.createGain()
      gain.gain.setValueAtTime(0.6, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5)

      noise.connect(filter)
      filter.connect(gain)
      gain.connect(this.ctx.destination)

      noise.start()
      noise.stop(this.ctx.currentTime + 0.5)
    } catch (e) {}
  }

  // SKILL: Red Battle Cry
  playBattleCry() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    try {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(320, this.ctx.currentTime)
      osc.frequency.setValueAtTime(480, this.ctx.currentTime + 0.08)
      osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.25)

      gain.gain.setValueAtTime(0.35, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25)

      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start()
      osc.stop(this.ctx.currentTime + 0.25)
    } catch (e) {}
  }

  // Tabrakan balok
  playHit(material = 'wood', intensity = 1) {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    try {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      if (material === 'stone') {
        osc.type = 'square'
        osc.frequency.setValueAtTime(100, this.ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.15)
      } else if (material === 'ice') {
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(800, this.ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.1)
      } else {
        // wood
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(220, this.ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.12)
      }

      const vol = Math.min(0.3, 0.05 + intensity * 0.05)
      gain.gain.setValueAtTime(vol, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15)

      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start()
      osc.stop(this.ctx.currentTime + 0.15)
    } catch (e) {
      console.warn('Audio error', e)
    }
  }

  // Musuh/Babi tereliminasi (Pop sound)
  playPigDestroy() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    try {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(600, this.ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.2)

      gain.gain.setValueAtTime(0.35, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2)

      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start()
      osc.stop(this.ctx.currentTime + 0.2)
    } catch (e) {
      console.warn('Audio error', e)
    }
  }

  // Kemenangan
  playVictory() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    const notes = [261.63, 329.63, 392.0, 523.25]
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        try {
          const osc = this.ctx.createOscillator()
          const gain = this.ctx.createGain()
          osc.type = 'triangle'
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime)
          gain.gain.setValueAtTime(0.2, this.ctx.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4)
          osc.connect(gain)
          gain.connect(this.ctx.destination)
          osc.start()
          osc.stop(this.ctx.currentTime + 0.4)
        } catch (e) {}
      }, idx * 120)
    })
  }

  // Kalah
  playGameOver() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    const notes = [300, 260, 220, 180]
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        try {
          const osc = this.ctx.createOscillator()
          const gain = this.ctx.createGain()
          osc.type = 'sawtooth'
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime)
          gain.gain.setValueAtTime(0.15, this.ctx.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3)
          osc.connect(gain)
          gain.connect(this.ctx.destination)
          osc.start()
          osc.stop(this.ctx.currentTime + 0.3)
        } catch (e) {}
      }, idx * 160)
    })
  }
}

export const sfx = new SoundFX()
