// NPC görünümleri: her tür için bir ya da birkaç görünüm. Üç çeşit desteklenir:
//  - 'atlas': yürüyüş sprite atlası (4 yön × N kare). Animasyona hazır asset gelince BURAYA eklenir.
//  - 'tek':   tek kare şeffaf resim (şimdiki ChatGPT karakter sayfasından kesildi: public/insanlar/sN.webp).
//             GEÇİCİDİR: yürüyüş, kodla verilen hafif sekme ve eğilmeyle taklit edilir; arkadan görünüş yoktur.
//  - 'gecici': resim yoksa ya da yüklenmezse kodla çizilen küçük silüet (bacakları adım atar).
// Ölçek: `boy` haritadaki yükseklik (harita pikseli). Kasabadaki bir ev ~120 px; insan ~28 px.
import type { NpcTuru } from './npc'

export type AtlasGorunumu = {
  tur: 'atlas'
  url: string
  /** Atlasın tamamının ve bir hücrenin piksel boyutu. */
  boyut: [number, number]
  hucre: [number, number]
  /** Her yönün satır numarası (0'dan). */
  satir: { asagi: number; yukari: number; sag: number; sol: number }
  /** Yürüyüş kare sayısı (her satırda soldan) ve bekleme karesi. */
  kare: number
  bekleKaresi?: number
  /** Ayak noktası, hücre içinde (piksel). */
  ayak: [number, number]
  boy: number
}
export type TekGorunum = { tur: 'tek'; url: string; en: number; boy: number; /** resimde yüzü sağa mı (1) sola mı (-1) bakıyor */ bakar: 1 | -1 }
export type GeciciGorunum = { tur: 'gecici'; giysi: string; bas: 'sarik' | 'fes' | 'ortu' | 'kece'; yuk?: 'cuval' | 'testi' | 'sepet' | 'kitap'; boy: number }
export type Gorunum = AtlasGorunumu | TekGorunum | GeciciGorunum

/** Bütün NPC'lerin ölçeği tek yerden: 1 = karakter sayfasındaki oranlar (yetişkin ~34 px). */
export const NPC_OLCEGI = 0.9

const tek = (n: number, en: number, boy: number, bakar: 1 | -1 = 1): TekGorunum => ({ tur: 'tek', url: `insanlar/s${n}.webp`, en: en * NPC_OLCEGI, boy: boy * NPC_OLCEGI, bakar })
const sil = (giysi: string, bas: GeciciGorunum['bas'], yuk?: GeciciGorunum['yuk'], boy = 26): GeciciGorunum => ({ tur: 'gecici', giysi, bas, yuk, boy })

/** Tür → görünümler (NPC kimliğine göre biri seçilir). */
export const GORUNUMLER: Record<NpcTuru, Gorunum[]> = {
  su_tasiyici: [tek(6, 15.6, 42), tek(18, 29.2, 35.4), tek(52, 26, 30.6, -1)],
  pazarci: [tek(3, 20, 33.8), tek(8, 21.8, 32.8), tek(11, 16.2, 29.8)],
  firinci: [tek(1, 21.8, 34.4, -1), tek(16, 17.4, 36.8)],
  hamal: [tek(5, 22.6, 36.6), tek(14, 20.4, 35)],
  alim: [tek(0, 17.2, 35.4)],
  asci: [tek(13, 20.8, 38.4)],
  esnaf: [tek(29, 18.2, 36), tek(2, 17, 34.2)],
  cocuk: [tek(10, 15.2, 25.6), tek(21, 17, 26.4)],
  gezgin: [tek(7, 20.4, 35.4)],
  yasli: [tek(9, 19.4, 36.8)],
  ciftci: [tek(49, 19.6, 32.2, -1), tek(19, 21, 35.4)],
  tuccar: [tek(4, 21.8, 36.2), tek(24, 18.4, 35.8)],
  cift: [tek(32, 28.8, 35.4)],
  esek: [tek(26, 36.6, 33.6)],
}

/** Resim yüklenemezse kullanılan geçici silüetler. */
export const GECICI: Record<NpcTuru, GeciciGorunum> = {
  su_tasiyici: sil('#2F6E8C', 'ortu', 'testi'),
  pazarci: sil('#5B7A2F', 'ortu', 'sepet'),
  firinci: sil('#E8DCC0', 'kece'),
  hamal: sil('#8C5A2F', 'fes', 'cuval'),
  alim: sil('#2E3F6E', 'sarik', 'kitap'),
  asci: sil('#F2EBDD', 'kece'),
  esnaf: sil('#8C3B2F', 'fes'),
  cocuk: sil('#3F6EA8', 'fes', undefined, 19),
  gezgin: sil('#7A6A4F', 'sarik'),
  yasli: sil('#4F5E3A', 'sarik'),
  ciftci: sil('#6E7A3A', 'kece', 'cuval'),
  tuccar: sil('#7A3A6E', 'sarik'),
  cift: sil('#A8432F', 'ortu'),
  esek: sil('#7A6A5A', 'kece', 'cuval'),
}

export function gorunumSec(t: NpcTuru, id: number): Gorunum {
  const g = GORUNUMLER[t]
  return g[id % g.length]
}
