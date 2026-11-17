// 2B izometrik köy sahnesi (yedek sahne). 3B sahne yetişmezse demo bununla yapılır.
// Sahne yalnızca gösterir: sayıları motordan alır, hiçbir şeyi hesaplamaz.
import { L as dilde } from '../dil'
import { RESIM_YERI, type Resimler } from './binaResimleri'

// Koordinatlar 390×300'lük izometrik ızgarada; KoySahnesi bunu 844×390'a ölçekler.

type Nokta = [number, number]

const OX = 195
const OY = 78
const HW = 26
const HH = 13
const P = (i: number, j: number, h = 0): Nokta => [OX + (i - j) * HW, OY + (i + j) * HH - h]
const f = (p: Nokta) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`
const poly = (pts: Nokta[], fill: string, extra = '') => `<polygon points="${pts.map(f).join(' ')}" fill="${fill}"${extra}/>`
const lerp = (a: Nokta, b: Nokta, t: number): Nokta => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
const up = (p: Nokta, h: number): Nokta => [p[0], p[1] - h]

const C = {
  stoneT: '#EFE4CC', stoneL: '#C8B28A', stoneR: '#DCCAA2', brick: '#A9452F', brickD: '#8C3725',
  leadT: '#B9C8D4', leadM: '#8EA3B5', leadD: '#6B8093', grass: '#9BC074', sand: '#DCCB9C', sandD: '#C9B57F',
  roof: '#B65A3F', wheat: '#E1BE55', wheatD: '#C9A43C', dry: '#B89A6A', dryD: '#9C7F52', tree: '#3F6B3A', tree2: '#57844A',
  trunk: '#7A5A3A', gold: '#E3A52A', goldD: '#A8761A', teal: '#14807F', red: '#D0381F',
}

type Kose = [Nokta, Nokta, Nokta, Nokta]

function box(i0: number, j0: number, a: number, b: number, H: number, top: string, left: string, right: string, bands: [number, number][] = []): [string[], Kose] {
  const T = P(i0, j0), R = P(i0 + a, j0), B = P(i0 + a, j0 + b), L = P(i0, j0 + b)
  const s = [poly([L, B, up(B, H), up(L, H)], left), poly([B, R, up(R, H), up(B, H)], right)]
  for (const [h1, h2] of bands) {
    s.push(poly([up(L, h1), up(B, h1), up(B, h2), up(L, h2)], C.brickD))
    s.push(poly([up(B, h1), up(R, h1), up(R, h2), up(B, h2)], C.brick))
  }
  s.push(poly([up(T, H), up(R, H), up(B, H), up(L, H)], top))
  return [s, [T, R, B, L]]
}

function topc([T, R, B, L]: Kose, H: number, u = 0.5, v = 0.5): Nokta {
  const a = lerp(T, R, u), b = lerp(L, B, u)
  return up(lerp(a, b, v), H)
}

/** Hamam kubbesi: ışık alan küçük "fil gözü" delikleriyle. */
function filGozluKubbe(m: Nokta, r: number, kirik: boolean): string[] {
  const s = dome(m, r, kirik)
  if (kirik) return s
  const [x, y] = m
  for (const [dx, dy] of [[-0.42, -0.42], [0.05, -0.68], [0.45, -0.38], [-0.12, -0.25], [0.28, -0.12]]) s.push(`<circle cx="${x + dx * r}" cy="${y + dy * r}" r="${Math.max(0.9, r * 0.11)}" fill="#F2E9CF"/>`)
  return s
}

function dome([x, y]: Nokta, r: number, kirik: boolean): string[] {
  if (kirik) {
    return [`<path d="M${x - r},${y} L${x - r * 0.7},${y - r * 0.55} L${x - r * 0.2},${y - r * 0.25} L${x + r * 0.15},${y - r * 0.7} L${x + r * 0.5},${y - r * 0.3} L${x + r},${y} A${r},${r / 2} 0 0 1 ${x - r},${y} Z" fill="${C.leadD}"/>`]
  }
  return [
    `<path d="M${x - r},${y} A${r},${r} 0 0 1 ${x + r},${y} A${r},${r / 2} 0 0 1 ${x - r},${y} Z" fill="${C.leadM}"/>`,
    `<path d="M${x - r * 0.55},${y - r * 0.55} A${r * 0.8},${r * 0.8} 0 0 1 ${x + r * 0.05},${y - r * 0.95}" fill="none" stroke="${C.leadT}" stroke-width="2.2" stroke-linecap="round"/>`,
    `<line x1="${x}" y1="${y - r}" x2="${x}" y2="${y - r - 5}" stroke="${C.goldD}" stroke-width="1.4"/>`,
    `<circle cx="${x}" cy="${y - r - 5.5}" r="1.6" fill="${C.gold}"/>`,
  ]
}

/** Silindir (minare gövdesi, payanda, kümbet). Işık sağdan: sol yarı gölgeli. */
function silindir([x, y]: Nokta, r: number, h: number, yan: string, ust: string): string[] {
  return [
    `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r / 2}" fill="${yan}"/>`,
    `<rect x="${x - r}" y="${y - h}" width="${2 * r}" height="${h}" fill="${yan}"/>`,
    `<rect x="${x - r}" y="${y - h}" width="${r * 0.9}" height="${h}" fill="#000" opacity=".13"/>`,
    `<ellipse cx="${x}" cy="${y - h}" rx="${r}" ry="${r / 2}" fill="${ust}"/>`,
  ]
}

/** Konik çatı (Selçuklu kümbeti, minare külahı). */
function koni([x, y]: Nokta, r: number, h: number, renk: string): string[] {
  return [
    `<path d="M${x - r},${y} L${x},${y - h} L${x + r},${y} A${r},${r / 2} 0 0 1 ${x - r},${y} Z" fill="${renk}"/>`,
    `<path d="M${x - r},${y} L${x},${y - h} L${x - r * 0.15},${y + r * 0.48} A${r},${r / 2} 0 0 1 ${x - r},${y} Z" fill="#000" opacity=".14"/>`,
  ]
}

/**
 * Taçkapı: cepheden dışa taşan anıtsal giriş. a→b cephenin zemin çizgisi, t ortası, w genişliği (0–1), h yüksekliği.
 * disa: cepheden dışarı doğru küçük kayma (sol cephe için -i+j, sağ cephe için +i+j yönü).
 */
function tackapi(a: Nokta, b: Nokta, t: number, w: number, h: number, disa: Nokta, renk: string, suslu = false): string[] {
  const kay = (p: Nokta): Nokta => [p[0] + disa[0], p[1] + disa[1]]
  const p0 = lerp(a, b, t - w / 2), p1 = lerp(a, b, t + w / 2)
  const f0 = kay(p0), f1 = kay(p1)
  const s = [
    poly([p1, f1, up(f1, h), up(p1, h)], '#B49B72'), // yan yüz
    poly([up(p0, h), up(p1, h), up(f1, h), up(f0, h)], '#F3E9D2'), // üst kapak
    poly([f0, f1, up(f1, h), up(f0, h)], renk), // ön yüz
  ]
  const ic = (u: number, v: number) => up(lerp(f0, f1, u), v)
  // çerçeve şeritleri
  s.push(`<polyline points="${[ic(0.1, 0), ic(0.1, h - 3), ic(0.9, h - 3), ic(0.9, 0)].map(f).join(' ')}" fill="none" stroke="#A88A5E" stroke-width="1"/>`)
  if (suslu) {
    for (const u of [0.16, 0.84]) s.push(`<line x1="${ic(u, 0)[0]}" y1="${ic(u, 0)[1]}" x2="${ic(u, h - 6)[0]}" y2="${ic(u, h - 6)[1]}" stroke="#9C7C50" stroke-width="1.6" stroke-dasharray="2 1.5"/>`)
    for (const u of [0.18, 0.82]) { const [cx, cy] = ic(u, h * 0.78); s.push(`<circle cx="${cx}" cy="${cy}" r="1.8" fill="#9C7C50"/>`) }
  }
  // sivri kemerli niş ve mukarnas
  const n0 = 0.27, n1 = 0.73
  s.push(poly([ic(n0, 0), ic(n1, 0), ic(n1, h * 0.6), ic(0.5, h * 0.82), ic(n0, h * 0.6)], '#6B5038'))
  s.push(`<polyline points="${[0, 1, 2, 3, 4, 5, 6].map((k) => f(ic(n0 + ((n1 - n0) * k) / 6, h * 0.6 + (k % 2 ? 2.5 : 0)))).join(' ')}" fill="none" stroke="#C9B088" stroke-width="1"/>`)
  s.push(poly([ic(0.4, 0), ic(0.6, 0), ic(0.6, h * 0.34), ic(0.5, h * 0.42), ic(0.4, h * 0.34)], '#3A2A1E'))
  return s
}

const SOL_DISA: Nokta = [-HW * 0.14, HH * 0.14]
const SAG_DISA: Nokta = [HW * 0.14, HH * 0.14]

function arches([, , B, L]: Kose, R: Nokta, yuz: 'L' | 'R', n: number, h1: number, h2: number, col = '#5B4632'): string[] {
  const s: string[] = []
  const [a, b] = yuz === 'L' ? [L, B] : [B, R]
  for (let k = 0; k < n; k++) {
    const p0 = lerp(a, b, (k + 0.3) / n), p1 = lerp(a, b, (k + 0.7) / n)
    s.push(poly([up(p0, h1), up(p1, h1), up(p1, h2 - 2), lerp(up(p0, h2), up(p1, h2), 0.5), up(p0, h2 - 2)], col))
  }
  return s
}

const tile = (i: number, j: number, fill: string, stroke?: string) =>
  poly([P(i, j), P(i + 1, j), P(i + 1, j + 1), P(i, j + 1)], fill, stroke ? ` stroke="${stroke}" stroke-width="0.6"` : '')

function cypress(i: number, j: number) {
  const [x, y] = P(i + 0.5, j + 0.5)
  return [`<ellipse cx="${x}" cy="${y}" rx="5" ry="2.5" fill="#000" opacity=".12"/>`, `<ellipse cx="${x}" cy="${y - 11}" rx="4.2" ry="12" fill="${C.tree}"/>`]
}
function roundtree(i: number, j: number) {
  const [x, y] = P(i + 0.5, j + 0.5)
  return [
    `<ellipse cx="${x}" cy="${y}" rx="7" ry="3.5" fill="#000" opacity=".12"/>`,
    `<rect x="${x - 1.2}" y="${y - 7}" width="2.4" height="7" fill="${C.trunk}"/>`,
    `<circle cx="${x}" cy="${y - 12}" r="7.5" fill="${C.tree2}"/>`,
    `<circle cx="${x - 2.5}" cy="${y - 14.5}" r="3" fill="#7FA866"/>`,
  ]
}

function etiket(x: number, y: number, metin: string, bg: string, fg = '#fff') {
  const w = metin.length * 5.6 + 14
  return [
    `<rect x="${x - w / 2}" y="${y - 8}" width="${w}" height="16" rx="8" fill="${bg}" stroke="#12151E" stroke-width="1.2"/>`,
    `<text x="${x}" y="${y + 3.4}" text-anchor="middle" font-size="9.5" font-weight="800" fill="${fg}" font-family="Nunito, sans-serif">${metin}</text>`,
  ]
}

const YOL: [number, number][] = [[2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [3, 5], [4, 5], [3, 2], [3, 1]]

export type SahneGirdisi = {
  hamam: number
  han: number
  arazi: number
  hamamHasarli: boolean
  hanHasarli: boolean
  kuraklik: boolean
  yangin: boolean
  savas: boolean
  akis: 'odendi' | 'bos' | null
  etiketler?: { hamam?: string; han?: string; arazi?: string; sandik?: string; hayrat?: string }
  hayratAd: string
  /** Hayrat binasının türü: her biri envanterdeki bir esere bakılarak çizildi (bkz. arayuz/ilham.ts). */
  hayratTur: 'asevi' | 'medrese' | 'cesme' | 'cami'
  /** Klasörde bulunan bina görselleri; varsa çizimin yerine geçer. */
  resimler?: Resimler
}

/**
 * Bir bina görselini tabanına oturtur. Görseller boşlukları kırpılmış olarak gelir:
 * genişliği tabanın genişliği kadar ölçeklenir, alt kenarı tabanın ön (alt) köşesine oturur.
 */
function resim(yer: keyof typeof RESIM_YERI, adres: string): string[] {
  const { taban: [i0, j0, a, b], olcek, dx, dy } = RESIM_YERI[yer]
  const L = P(i0, j0 + b), R = P(i0 + a, j0), B = P(i0 + a, j0 + b)
  const W = (R[0] - L[0]) * olcek
  const x = (L[0] + R[0]) / 2 - W / 2 + dx
  const alt = B[1] + dy
  return [`<image href="${adres}" x="${x.toFixed(1)}" y="${(alt - 2 * W).toFixed(1)}" width="${W.toFixed(1)}" height="${(2 * W).toFixed(1)}" preserveAspectRatio="xMidYMax meet"/>`]
}

/** Bina ayak izleri: tıklama alanları için. [i0, j0, a, b, yükseklik] */
export const BINALAR = {
  hamam: [0, 1, 2, 2, 34],
  han: [4, 0, 3, 3, 28],
  arazi: [0, 4, 2, 3, 12],
  sandik: [3, 3, 2, 2, 44],
  hayrat: [5, 4, 2, 2, 34],
} as const
export type BinaId = keyof typeof BINALAR

export function binaAlani(id: BinaId): string {
  const [i0, j0, a, b, H] = BINALAR[id]
  const T = P(i0, j0), R = P(i0 + a, j0), B = P(i0 + a, j0 + b), L = P(i0, j0 + b)
  return [L, B, R, up(R, H), up(T, H), up(L, H)].map(f).join(' ')
}

/** Binanın tepesindeki nokta (izometrik ızgara koordinatı): uçan sikkeler buradan kalkar. */
export function binaUstu(id: BinaId): [number, number] {
  const [i0, j0, a, b, H] = BINALAR[id]
  return topc([P(i0, j0), P(i0 + a, j0), P(i0 + a, j0 + b), P(i0, j0 + b)], H)
}

export function koySvg(g: SahneGirdisi): string {
  const R_: Resimler = g.resimler ?? {}
  const out: string[] = [poly([P(0, 0), P(7, 0), P(7, 7), P(0, 7)], C.grass)]
  out.push(poly([P(0, 7), P(7, 7), up(P(7, 7), -10), up(P(0, 7), -10)], '#7A5A3A'))
  out.push(poly([P(7, 0), P(7, 7), up(P(7, 7), -10), up(P(7, 0), -10)], '#8E6B47'))
  const yolda = (i: number, j: number) => YOL.some(([a, b]) => a === i && b === j)
  for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) out.push(yolda(i, j) ? tile(i, j, C.sand, C.sandD) : tile(i, j, (i + j) % 2 ? C.grass : '#A2C67B'))

  const tarla = () => {
    const s: string[] = []
    if (g.arazi <= 0) return s
    for (let i = 0; i < 2; i++)
      for (let j = 4; j < 7; j++) {
        if (i === 0 && j === 6) continue
        s.push(tile(i, j, g.kuraklik ? (j % 2 ? C.dry : '#A88C5C') : j % 2 ? C.wheat : '#7FA24F', g.kuraklik ? C.dryD : C.wheatD))
      }
    const r = (g.kuraklik && R_['arazi-kurak']) || R_.arazi
    s.push(...(r ? resim('arazi', r) : box(0, 6, 1, 1, 11, C.roof, C.stoneL, C.stoneR)[0]))
    return s
  }
  // Hamam: Konya Sahip Ata (Sultan) Hamamı. Alçak taş gövde, fil gözlü kubbeler, külhan bacası.
  const hamam = () => {
    if (g.hamam <= 0) return [poly([P(0, 1), P(2, 1), P(2, 3), P(0, 3)], '#B8A57E', ' opacity=".6"')]
    const r = (g.hamamHasarli && R_['hamam-hasarli']) || R_.hamam
    if (r) return resim('hamam', r)
    const [s, k] = box(0, 1, 2, 2, 18, C.stoneT, C.stoneL, C.stoneR, [[5, 6.5], [11, 12.5]])
    const [, , B, L] = k
    s.push(...filGozluKubbe(topc(k, 18, 0.27, 0.27), 6.5, g.hamamHasarli), ...filGozluKubbe(topc(k, 18, 0.75, 0.27), 6.5, g.hamamHasarli))
    s.push(...filGozluKubbe(topc(k, 18, 0.5, 0.7), 10, g.hamamHasarli))
    const baca = topc(k, 18, 0.92, 0.12)
    s.push(`<rect x="${baca[0] - 2.2}" y="${baca[1] - 9}" width="4.4" height="9" fill="${C.brick}"/>`)
    if (!g.hamamHasarli) [[0, -13, 2.5], [3, -18, 3.2]].forEach(([dx, dy, r], i) => s.push(`<circle class="sahne-duman" style="animation-delay:${i * 0.5}s" cx="${baca[0] + dx}" cy="${baca[1] + dy}" r="${r}" fill="#EDEDED" opacity=".7"/>`))
    s.push(...tackapi(L, B, 0.32, 0.24, 15, SOL_DISA, '#EADCBC'))
    if (g.hamamHasarli) {
      for (const [a, c] of [[0.55, 0.7], [0.75, 0.92]]) {
        const p = lerp(L, B, a), q = lerp(L, B, c)
        s.push(`<polyline points="${f(up(p, 3))} ${f(up(lerp(p, q, 0.5), 10))} ${f(up(q, 16))}" fill="none" stroke="#3A2A1E" stroke-width="1.3"/>`)
      }
    }
    return s
  }
  // Han: Konya Zazadin (Sadeddin Köpek) Hanı. Kale gibi beden duvarı, yuvarlak payandalar, iki renkli taştan taçkapı, açık avlu.
  const han = () => {
    if (g.han <= 0) return [poly([P(4, 0), P(7, 0), P(7, 3), P(4, 3)], '#B8A57E', ' opacity=".6"')]
    const r = ((g.hanHasarli || g.yangin) && R_['han-hasarli']) || R_.han
    if (r) return [...resim('han', r), ...(g.savas ? [`<g class="sahne-bayrak">${etiket(...topc([P(4, 0), P(7, 0), P(7, 2), P(4, 2)], 24), dilde('Yol kapalı', 'Road closed'), '#4A4F5C').join('')}</g>`] : [])]
    const [s, k] = box(4, 0, 3, 2, 19, '#D9C69C', C.stoneL, C.stoneR, [[9, 10]])
    const [, R, B, L] = k
    const inner = [topc(k, 19, 0.2, 0.24), topc(k, 19, 0.8, 0.24), topc(k, 19, 0.8, 0.76), topc(k, 19, 0.2, 0.76)]
    s.push(poly(inner, '#E8DAB6'))
    s.push(poly([inner[2], inner[3], up(inner[3], -6), up(inner[2], -6)], '#BFA97F'))
    s.push(...arches(k, R, 'R', 2, 2, 8))
    // payandalar: sol cephede (dükkânların üstünde görünür) ve sağ cephede
    for (const t of [0.12, 0.37, 0.63, 0.88]) {
      const c = lerp(L, B, t)
      s.push(...silindir([c[0] + SOL_DISA[0] * 0.6, c[1] + SOL_DISA[1] * 0.6], 3, 19, '#CDB88E', '#E3D3AE'))
    }
    for (const t of [0.1, 0.9]) {
      const c = lerp(B, R, t)
      s.push(...silindir([c[0] + SAG_DISA[0] * 0.6, c[1] + SAG_DISA[1] * 0.6], 3.4, 20, '#D5C197', '#E8D9B5'))
    }
    // iki renkli taçkapı
    s.push(...tackapi(B, R, 0.5, 0.36, 27, SAG_DISA, '#E9DAB4', true))
    const kp = (u: number, v: number) => up(lerp(lerp(B, R, 0.32), lerp(B, R, 0.68), u), v)
    for (const v of [6, 12, 18]) s.push(poly([[kp(0.1, v)[0] + SAG_DISA[0], kp(0.1, v)[1] + SAG_DISA[1]], [kp(0.9, v)[0] + SAG_DISA[0], kp(0.9, v)[1] + SAG_DISA[1]], [kp(0.9, v + 1.6)[0] + SAG_DISA[0], kp(0.9, v + 1.6)[1] + SAG_DISA[1]], [kp(0.1, v + 1.6)[0] + SAG_DISA[0], kp(0.1, v + 1.6)[1] + SAG_DISA[1]]], '#B98B5E', ' opacity=".55"'))
    if (g.hanHasarli) {
      const p = lerp(B, R, 0.2)
      s.push(`<polyline points="${f(up(p, 3))} ${f(up(lerp(p, R, 0.08), 11))} ${f(up(lerp(p, R, 0.04), 19))}" fill="none" stroke="#3A2A1E" stroke-width="1.2"/>`)
    }
    if (g.savas) s.push(`<g class="sahne-bayrak">${etiket(...topc(k, 24, 0.5, 0.5), dilde('Yol kapalı', 'Road closed'), '#4A4F5C').join('')}</g>`)
    return s
  }
  const dukkan = () => {
    if (g.han <= 0 || R_.han) return []
    const [s, [, , B, L]] = box(4, 2, 3, 1, 13, C.roof, C.stoneL, C.stoneR)
    for (let k = 0; k < 6; k++) {
      const a = lerp(L, B, k / 6), b = lerp(L, B, (k + 1) / 6)
      s.push(poly([up(a, 9), up(b, 9), up(b, 5), up(a, 5)], k % 2 ? C.teal : '#F2E6CC'))
    }
    return s
  }
  const sandik = () => {
    const r = (g.akis === 'bos' && R_['sandik-bos']) || R_.sandik
    if (r) return resim('sandik', r)
    const [s, k] = box(3, 3, 2, 2, 30, C.stoneT, C.stoneL, C.stoneR, [[8, 10], [17, 19], [26, 28]])
    s.push(...arches(k, k[1], 'L', 2, 2, 13), ...arches(k, k[1], 'R', 2, 2, 13), ...dome(topc(k, 30), 13, false))
    return s
  }
  const duman = (ch: Nokta, s: string[]) => {
    if (g.akis === 'bos') return
    ;[[1, -16, 3], [4, -22, 4], [1, -29, 5]].forEach(([dx, dy, r], i) =>
      s.push(`<circle class="sahne-duman" style="animation-delay:${i * 0.4}s" cx="${ch[0] + dx}" cy="${ch[1] + dy}" r="${r}" fill="#fff" opacity="${0.8 - i * 0.2}"/>`),
    )
  }
  // Aşevi: Bursa Orhan Bey Külliyesi. Taş ve tuğla sıralı (almaşık) duvar, kurşun kubbe, revak, mutfak bacaları.
  const asevi = () => {
    const [s, k] = box(5, 4, 2, 2, 18, C.stoneT, C.stoneL, C.stoneR, [[3, 4.2], [6.8, 8], [10.6, 11.8], [14.4, 15.6]])
    s.push(...arches(k, k[1], 'L', 3, 2, 11), ...arches(k, k[1], 'R', 2, 2, 11))
    s.push(...dome(topc(k, 18, 0.38, 0.55), 11, false))
    for (const v of [0.22, 0.62]) {
      const ch = topc(k, 18, 0.88, v)
      s.push(`<rect x="${ch[0] - 2.4}" y="${ch[1] - 11}" width="4.8" height="11" fill="${C.brick}"/><rect x="${ch[0] - 3.2}" y="${ch[1] - 12.5}" width="6.4" height="2" fill="${C.brickD}"/>`)
      duman(up(ch, 0), s)
    }
    return s
  }
  // Medrese: Konya İnce Minareli Medrese. Kubbeli taş gövde, oymalı "barok" taçkapı, çini bilezikli tuğla minare (üstü yıldırımla yıkık).
  const medrese = () => {
    const [s, k] = box(5, 4, 2, 2, 18, C.stoneT, C.stoneL, C.stoneR, [[8, 9]])
    const [, R, B, L] = k
    s.push(...arches(k, R, 'R', 2, 3, 11))
    s.push(...dome(topc(k, 18, 0.55, 0.4), 12.5, false))
    s.push(...tackapi(L, B, 0.55, 0.42, 31, SOL_DISA, '#E8D6B0', true))
    const m = lerp(L, B, 0.1)
    const taban: Nokta = [m[0] + SOL_DISA[0] * 0.5, m[1] + SOL_DISA[1] * 0.5]
    s.push(...silindir(taban, 3.8, 46, '#B0573C', '#C46A4A'))
    for (const h of [16, 25, 34]) s.push(`<rect x="${taban[0] - 3.8}" y="${taban[1] - h - 2}" width="7.6" height="2.4" fill="#2A9D9A"/>`)
    s.push(`<ellipse cx="${taban[0]}" cy="${taban[1] - 41}" rx="5.4" ry="2.4" fill="#DCCAA2"/>`)
    s.push(poly([[taban[0] - 3.8, taban[1] - 46], [taban[0] - 2, taban[1] - 49], [taban[0], taban[1] - 46.5], [taban[0] + 1.6, taban[1] - 50], [taban[0] + 3.8, taban[1] - 46]], '#B0573C'))
    return s
  }
  // Çeşme: Konya Hoca Fakih Çeşmesi. İki renk taştan, teğet kemerli nişli tek cepheli çeşme ve yalak.
  const cesme = () => {
    const s: string[] = [poly([P(5, 4), P(7, 4), P(7, 6), P(5, 6)], '#E6D8B4'), poly([P(5.15, 4.15), P(6.85, 4.15), P(6.85, 5.85), P(5.15, 5.85)], '#DDCDA5')]
    const [d, k] = box(5.3, 4.7, 1.4, 0.35, 18, '#B65A3F', '#D8C59D', C.stoneR)
    s.push(...d)
    const [, , B, L] = k
    for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) {
      if ((r + c) % 2) continue
      const p0 = up(lerp(L, B, c / 5), r * 4.2 + 0.5), p1 = up(lerp(L, B, (c + 1) / 5), r * 4.2 + 0.5)
      s.push(poly([p0, p1, up(p1, 3.6), up(p0, 3.6)], '#C2A77B', ' opacity=".6"'))
    }
    const ic = (u: number, v: number) => up(lerp(L, B, u), v)
    s.push(poly([ic(0.28, 1), ic(0.72, 1), ic(0.72, 10), ic(0.5, 14.5), ic(0.28, 10)], '#EFE3C6'))
    s.push(poly([ic(0.33, 1), ic(0.67, 1), ic(0.67, 9), ic(0.5, 12.5), ic(0.33, 9)], '#7A634A'))
    const lule = ic(0.5, 5)
    s.push(`<rect x="${lule[0] - 1.2}" y="${lule[1] - 1}" width="2.4" height="2.4" fill="${C.goldD}"/>`)
    const [y, yk] = box(5.55, 5.05, 0.9, 0.3, 3.5, '#CDB88E', '#BFA97F', '#D5C197')
    s.push(...y)
    const su = [topc(yk, 3.5, 0.1, 0.2), topc(yk, 3.5, 0.9, 0.2), topc(yk, 3.5, 0.9, 0.8), topc(yk, 3.5, 0.1, 0.8)]
    s.push(poly(su, g.akis === 'bos' ? '#A8957A' : '#7FB3C9'))
    if (g.akis !== 'bos') s.push(`<line x1="${lule[0]}" y1="${lule[1] + 1.5}" x2="${lule[0] - 1}" y2="${su[0][1] + 2}" stroke="#A9D2E0" stroke-width="1.4" class="sahne-akis" stroke-dasharray="2 2"/>`)
    return s
  }
  // Cami: Konya Alâeddin Camii. Uzun, kurşun örtülü düz damlı harim, küçük kubbe, konik külahlı Selçuklu kümbeti, külahlı tuğla minare.
  const cami = () => {
    const s: string[] = []
    const [d, k] = box(5.65, 4.1, 1.35, 1.9, 13, '#A9B9C6', C.stoneL, C.stoneR, [[4, 5]])
    s.push(...d)
    const [, R, B] = k
    s.push(...arches(k, R, 'L', 3, 3, 10), ...arches(k, R, 'R', 3, 3, 10))
    const kb = P(5.3, 5.55)
    s.push(...silindir(kb, 7, 16, '#D9C69C', '#E6D6B0'), ...koni(up(kb, 16), 7.8, 15, '#8EA3B5'))
    const kp = up(kb, 2)
    s.push(`<path d="M${kp[0] - 2.4},${kp[1] + 1} L${kp[0] - 2.4},${kp[1] - 6} Q${kp[0]},${kp[1] - 9.5} ${kp[0] + 2.4},${kp[1] - 6} L${kp[0] + 2.4},${kp[1] + 1} Z" fill="#5B4632"/>`)
    s.push(...dome(topc(k, 13, 0.55, 0.45), 8, false))
    const mb = lerp(B, R, 0.85)
    const taban: Nokta = [mb[0] + SAG_DISA[0] * 1.5, mb[1] + SAG_DISA[1] * 1.5]
    s.push(...silindir(taban, 3.8, 38, '#B5603F', '#C77250'))
    s.push(`<ellipse cx="${taban[0]}" cy="${taban[1] - 38}" rx="5.6" ry="2.5" fill="#E6D6B0"/>`)
    s.push(...silindir(up(taban, 38), 2.8, 7, '#B5603F', '#C77250'), ...koni(up(taban, 45), 3.4, 9, '#8EA3B5'))
    return s
  }
  const hayrat = () => {
    const kapali = g.hayratTur === 'cesme' ? 'cesme-kuru' : (`${g.hayratTur}-kapali` as const)
    const r = (g.akis === 'bos' && R_[kapali]) || R_[g.hayratTur]
    if (r) return resim('hayrat', r)
    return ({ asevi, medrese, cesme, cami })[g.hayratTur]()
  }
  const alev = () => {
    if (!g.yangin) return []
    const c = topc([P(4, 0), P(7, 0), P(7, 3), P(4, 3)], 26)
    return [[-14, 0], [0, -6], [14, 2]].map(
      ([dx, dy], i) =>
        `<path class="sahne-alev" style="animation-delay:${i * 0.15}s" d="M${c[0] + dx - 6},${c[1] + dy} Q${c[0] + dx},${c[1] + dy - 22} ${c[0] + dx + 6},${c[1] + dy} Z" fill="#F08A24" stroke="${C.red}" stroke-width="1.2"/>`,
    )
  }

  const items: [number, string[]][] = [
    [0, cypress(2, 0)], [0.5, roundtree(3, 0)], [2, hamam()], [4.5, han()], [6.9, dukkan()], [7.9, sandik()],
    [5.5, tarla()], [10.5, hayrat()], [8.6, cypress(1, 3)], [12.1, roundtree(6, 6)], [10.1, cypress(4, 6)], [5.2, roundtree(6, 0)], [11, alev()],
  ]
  items.sort((a, b) => a[0] - b[0]).forEach(([, s]) => out.push(...s))

  // Para akışı: mülklerden sandığa altın, sandıktan hayrata turkuaz.
  const S = topc([P(3, 3), P(5, 3), P(5, 5), P(3, 5)], 34)
  const D = topc([P(5, 4), P(7, 4), P(7, 6), P(5, 6)], 22)
  if (g.akis) {
    const kaynaklar: Nokta[] = []
    if (g.hamam > 0) kaynaklar.push(topc([P(0, 1), P(2, 1), P(2, 3), P(0, 3)], 26))
    if (g.han > 0 && !g.savas) kaynaklar.push(topc([P(4, 0), P(7, 0), P(7, 2), P(4, 2)], 28), P(5.5, 2.6, 16))
    if (g.arazi > 0 && !g.kuraklik) kaynaklar.push(P(1, 5.5, 4))
    kaynaklar.forEach((s0, i) => {
      const mx = (s0[0] + S[0]) / 2, my = Math.min(s0[1], S[1]) - 26
      const d = `M${f(s0)} Q${mx.toFixed(1)},${my.toFixed(1)} ${f(S)}`
      out.push(`<path d="${d}" fill="none" stroke="${C.goldD}" stroke-width="2" stroke-dasharray="1 5" stroke-linecap="round"/>`)
      out.push(`<circle r="4.2" fill="${C.gold}" stroke="${C.goldD}" stroke-width="1.2"><animateMotion dur="1.4s" begin="${i * 0.25}s" repeatCount="indefinite" path="${d}"/></circle>`)
    })
    const mx = (S[0] + D[0]) / 2 + 10, my = (S[1] + D[1]) / 2 - 24
    const renk = g.akis === 'bos' ? C.red : C.teal
    out.push(`<path class="sahne-akis" d="M${f(S)} Q${mx.toFixed(1)},${my.toFixed(1)} ${f(D)}" fill="none" stroke="${renk}" stroke-width="2.4" stroke-dasharray="6 4" stroke-linecap="round"/>`)
  }

  const e = g.etiketler ?? {}
  if (e.hamam) { const [x, y] = topc([P(0, 1), P(2, 1), P(2, 3), P(0, 3)], 26); out.push(...etiket(x, y - 22, e.hamam, g.hamamHasarli ? C.brick : '#8A5A00')) }
  if (e.han) { const [x, y] = topc([P(4, 0), P(7, 0), P(7, 2), P(4, 2)], 28); out.push(...etiket(x, y - 20, e.han, g.hanHasarli ? C.brick : '#8A5A00')) }
  if (e.arazi) { const [x, y] = P(1, 5.5, 4); out.push(...etiket(x, y - 14, e.arazi, '#8A5A00')) }
  if (e.sandik) out.push(...etiket(S[0], S[1] - 32, e.sandik, '#1B2433'))
  if (e.hayrat) out.push(...etiket(D[0] + 14, D[1] - 30, e.hayrat, g.akis === 'bos' ? C.brick : '#0E6E6D'))

  return out.join('\n')
}

// 844×390 geniş çerçeve: süs ağaçları, nehir ve izometrik köyün yerleşimi.
export const GENIS = { olcek: 1.3, tx: 422 - 195 * 1.3, ty: -8 }

function rtree(x: number, y: number, r = 11) {
  return `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r / 2}" fill="#000" opacity=".15"/><rect x="${x - 1.8}" y="${y - 10}" width="3.6" height="10" fill="#6B4E33"/><circle cx="${x}" cy="${y - 17}" r="${r}" fill="#4E7D43"/><circle cx="${x - 3.5}" cy="${y - 21}" r="${r * 0.42}" fill="#6E9A58"/>`
}
function cyp(x: number, y: number) {
  return `<ellipse cx="${x}" cy="${y}" rx="6" ry="3" fill="#000" opacity=".15"/><ellipse cx="${x}" cy="${y - 14}" rx="5.5" ry="16" fill="#355E33"/>`
}

export function arkaPlanSvg(): { arka: string; on: string } {
  const agac: [number, number][] = [[40, 70], [92, 40], [70, 150], [30, 250], [120, 330], [60, 360], [150, 210], [780, 60], [820, 150], [735, 30], [800, 280], [760, 350], [700, 330], [830, 370], [205, 370], [640, 375]]
  const servi: [number, number][] = [[130, 90], [20, 190], [110, 265], [720, 110], [690, 200], [815, 225], [600, 40], [250, 30]]
  const deco = [...agac.map(([x, y]) => rtree(x, y)), ...servi.map(([x, y]) => cyp(x, y))]
  const lekeler = ([[90, 110, 70, 26], [760, 200, 80, 30], [160, 330, 90, 28], [700, 380, 120, 30], [300, 20, 120, 22], [620, 15, 110, 20]] as const)
    .map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#76A052" opacity=".55"/>`)
    .join('')
  const bulutlar = [[120, 30, 1], [520, 18, 0.8], [760, 44, 1.1]].map(([x, y, k], i) => `<g class="sahne-bulut" style="animation-delay:${-i * 14}s" opacity=".9"><ellipse cx="${x}" cy="${y}" rx="${34 * k}" ry="${12 * k}" fill="#fff"/><ellipse cx="${x - 18 * k}" cy="${y + 4}" rx="${20 * k}" ry="${9 * k}" fill="#fff"/><ellipse cx="${x + 20 * k}" cy="${y + 3}" rx="${22 * k}" ry="${10 * k}" fill="#fff"/></g>`).join('')
  const arka = `<rect width="844" height="390" fill="#86AD60"/>${lekeler}<path d="M0,300 C120,285 180,330 300,390 L0,390 Z" fill="#7FB3C9"/><path class="sahne-nehir" d="M0,312 C110,300 170,338 270,390" fill="none" stroke="#A9D2E0" stroke-width="3" opacity=".7"/>${deco.slice(0, 9).join('')}`
  return { arka, on: deco.slice(9).join('') + bulutlar }
}
