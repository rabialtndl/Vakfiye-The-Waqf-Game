// Oyun sesleri: dosya yok, Web Audio ile küçük sentezlenmiş sesler (para, doğru, yanlış, afet, kurma, tık).
// Ses ayarlardan ya da köşedeki 🔊 düğmesinden kapatılır. Tarayıcı ilk dokunuştan önce ses çalmaz.
let ctx: AudioContext | null = null
let acik = true
let seviye = 0.5

export function sesAyarla(a: { ses: boolean; sesSeviyesi?: number }) {
  acik = a.ses
  if (a.sesSeviyesi !== undefined) seviye = a.sesSeviyesi
}

function baglam(): AudioContext | null {
  if (!acik || typeof window === 'undefined') return null
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx ??= new AC()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

/** Tek nota: frekans (Hz), başlangıç (sn), süre (sn), dalga, ses yüksekliği. */
function nota(c: AudioContext, f: number, bas: number, sure: number, dalga: OscillatorType = 'triangle', yuksek = 0.18, kayma = 0) {
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = dalga
  o.frequency.setValueAtTime(f, c.currentTime + bas)
  if (kayma) o.frequency.linearRampToValueAtTime(f + kayma, c.currentTime + bas + sure)
  const v = yuksek * seviye
  g.gain.setValueAtTime(0, c.currentTime + bas)
  g.gain.linearRampToValueAtTime(v, c.currentTime + bas + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + bas + sure)
  o.connect(g).connect(c.destination)
  o.start(c.currentTime + bas)
  o.stop(c.currentTime + bas + sure + 0.02)
}

export type SesAdi = 'tik' | 'para' | 'dogru' | 'yanlis' | 'afet' | 'kur' | 'iyi' | 'sayfa'

export function sesCal(ad: SesAdi) {
  const c = baglam()
  if (!c) return
  switch (ad) {
    case 'tik':
      nota(c, 660, 0, 0.05, 'square', 0.05)
      break
    case 'sayfa':
      nota(c, 520, 0, 0.06, 'triangle', 0.08)
      nota(c, 780, 0.05, 0.08, 'triangle', 0.07)
      break
    case 'para':
      nota(c, 988, 0, 0.08, 'square', 0.07)
      nota(c, 1319, 0.07, 0.16, 'square', 0.07)
      break
    case 'dogru':
      nota(c, 523, 0, 0.12)
      nota(c, 659, 0.1, 0.12)
      nota(c, 784, 0.2, 0.25)
      break
    case 'yanlis':
      nota(c, 330, 0, 0.18, 'sawtooth', 0.08, -60)
      nota(c, 247, 0.16, 0.3, 'sawtooth', 0.08, -40)
      break
    case 'afet':
      // def gibi alçak bir vuruş ve uyarı
      nota(c, 110, 0, 0.35, 'sine', 0.3, -40)
      nota(c, 440, 0.05, 0.18, 'triangle', 0.1)
      nota(c, 415, 0.25, 0.25, 'triangle', 0.1)
      break
    case 'kur':
      nota(c, 196, 0, 0.08, 'square', 0.08)
      nota(c, 196, 0.12, 0.08, 'square', 0.08)
      nota(c, 392, 0.26, 0.22, 'triangle', 0.12)
      break
    case 'iyi':
      nota(c, 587, 0, 0.12)
      nota(c, 880, 0.1, 0.25)
      break
  }
}

// ---------- Fon müziği ----------
// Dosya yok: Web Audio ile sakin, dönen bir ezgi. Alçak bir dem (ney gibi uzun ses) üstünde
// Uşşak makamına yakın bir dizide ud gibi tıngırtı. Ölçüler kayarak 32 saniyelik bir döngü kurar.
// Ses kapalıysa ya da müzik anahtarı kapalıysa çalmaz; sekme gizlenince susar.

const RE = 146.83 // dem: Re (D3)
// Uşşak'a yakın: Re, Mi (yarım bemol yerine Mi♭ ile Mi arası), Fa, Sol, La, Si♭, Do, Re
const DIZI = [1, 1.0905, 1.1892, 1.3348, 1.4983, 1.5874, 1.7818, 2]
// Ezgi: dizi basamakları (-1 = es). Dört cümle, her biri 8 vuruş.
const EZGI = [
  [4, -1, 3, 2, 3, -1, 2, 1],
  [2, 3, 4, 5, 4, -1, 3, 2],
  [4, -1, 5, 6, 5, 4, 3, -1],
  [2, -1, 1, 2, 1, -1, 0, -1],
]
const VURUS = 1 // sn

let muzikAcik = true
let muzikIstek = false
let dem: { o: OscillatorNode[]; g: GainNode } | null = null
let ana: GainNode | null = null
let yanki: DelayNode | null = null
let zamanlayici: ReturnType<typeof setInterval> | null = null
let sonraki = 0
let adim = 0
let bekleyenDokunus = false

function muzikCikisi(c: AudioContext) {
  if (ana) return ana
  ana = c.createGain()
  ana.gain.value = 0
  ana.connect(c.destination)
  // Hafif yankı: ezgiye mekân hissi
  yanki = c.createDelay(1)
  yanki.delayTime.value = 0.42
  const geri = c.createGain()
  geri.gain.value = 0.32
  const filtre = c.createBiquadFilter()
  filtre.type = 'lowpass'
  filtre.frequency.value = 1800
  yanki.connect(filtre).connect(geri).connect(yanki)
  geri.connect(ana)
  return ana
}

/** Ud gibi kısa, yumuşak bir tel sesi. */
function tel(c: AudioContext, f: number, t: number, guc: number) {
  const cikis = muzikCikisi(c)
  const o = c.createOscillator()
  const o2 = c.createOscillator()
  const g = c.createGain()
  const filtre = c.createBiquadFilter()
  o.type = 'triangle'
  o2.type = 'sine'
  o.frequency.value = f
  o2.frequency.value = f * 2.003
  filtre.type = 'lowpass'
  filtre.frequency.setValueAtTime(2600, t)
  filtre.frequency.exponentialRampToValueAtTime(700, t + 0.8)
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(guc, t + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6)
  o.connect(filtre)
  o2.connect(filtre)
  filtre.connect(g)
  g.connect(cikis)
  if (yanki) g.connect(yanki)
  o.start(t)
  o2.start(t)
  o.stop(t + 1.7)
  o2.stop(t + 1.7)
}

function demBaslat(c: AudioContext) {
  if (dem) return
  const cikis = muzikCikisi(c)
  const g = c.createGain()
  g.gain.value = 0.05
  const filtre = c.createBiquadFilter()
  filtre.type = 'lowpass'
  filtre.frequency.value = 520
  // Ney gibi nefesli dem: Re ve beşlisi La, çok yavaş titreşim
  const o = [RE / 2, (RE / 2) * 1.4983].map((f) => {
    const x = c.createOscillator()
    x.type = 'sine'
    x.frequency.value = f
    x.connect(filtre)
    x.start()
    return x
  })
  const lfo = c.createOscillator()
  const lfoG = c.createGain()
  lfo.frequency.value = 0.07
  lfoG.gain.value = 0.02
  lfo.connect(lfoG).connect(g.gain)
  lfo.start()
  o.push(lfo)
  filtre.connect(g).connect(cikis)
  dem = { o, g }
}

function ileri(c: AudioContext) {
  while (sonraki < c.currentTime + 1.5) {
    const cumle = EZGI[Math.floor(adim / 8) % EZGI.length]
    const b = cumle[adim % 8]
    const t = sonraki
    if (b >= 0) {
      const insan = (((adim * 37) % 7) - 3) * 0.008 // biraz insanca kayma
      tel(c, RE * DIZI[b], t + insan, 0.085 * seviye)
      if (adim % 8 === 0) tel(c, RE / 2, t, 0.06 * seviye) // cümle başında alçak tel
    }
    sonraki += VURUS * (adim % 8 === 7 ? 1.5 : 1) // cümle sonunda nefes
    adim++
  }
}

function muzikBaslat() {
  const c = baglam()
  if (!c) return
  if (c.state !== 'running') {
    // Tarayıcı ilk dokunuştan önce ses açtırmaz: ilk dokunuşta yeniden dene.
    if (!bekleyenDokunus) {
      bekleyenDokunus = true
      const dene = () => {
        bekleyenDokunus = false
        window.removeEventListener('pointerdown', dene)
        window.removeEventListener('keydown', dene)
        if (muzikIstek) muzikBaslat()
      }
      window.addEventListener('pointerdown', dene)
      window.addEventListener('keydown', dene)
    }
    void c.resume()
    if ((c.state as string) !== 'running') return
  }
  const cikis = muzikCikisi(c)
  demBaslat(c)
  cikis.gain.cancelScheduledValues(c.currentTime)
  cikis.gain.setValueAtTime(cikis.gain.value, c.currentTime)
  cikis.gain.linearRampToValueAtTime(0.9, c.currentTime + 2.5)
  if (!zamanlayici) {
    sonraki = c.currentTime + 0.3
    zamanlayici = setInterval(() => ileri(c), 250)
  }
}

function muzikDurdur() {
  if (zamanlayici) clearInterval(zamanlayici)
  zamanlayici = null
  if (!ctx || !ana) return
  const c = ctx
  ana.gain.cancelScheduledValues(c.currentTime)
  ana.gain.setValueAtTime(ana.gain.value, c.currentTime)
  ana.gain.linearRampToValueAtTime(0, c.currentTime + 0.8)
  const d = dem
  dem = null
  if (d) setTimeout(() => d.o.forEach((o) => { try { o.stop() } catch { /* durmuş */ } }), 900)
}

function muzikGuncelle() {
  const calsin = muzikIstek && muzikAcik && acik && (typeof document === 'undefined' || !document.hidden)
  if (calsin) muzikBaslat()
  else muzikDurdur()
}

if (typeof document !== 'undefined') document.addEventListener('visibilitychange', muzikGuncelle)

/** Müzik anahtarı (Ayarlar) ve oyun ekranında olup olmadığı. Ses kapalıysa müzik de susar. */
export function muzikAyarla(a: { muzik: boolean; ses: boolean; calsin: boolean }) {
  muzikAcik = a.muzik
  acik = a.ses
  // Fon müziği kaldırıldı (piyano gibi duyuluyordu). Efekt sesleri (sesCal) aynen çalışır.
  muzikIstek = false
  muzikGuncelle()
}
