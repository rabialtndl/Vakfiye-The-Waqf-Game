// Bina görselleri (docs/asset-istekleri.md). public/binalar/ klasöründe bulunan her resim, o binanın çiziminin yerine geçer.
// Bulunamayan resim için eski SVG çizimi kalır; yani görseller tek tek eklenebilir.
import { ortam } from '../ortam'

/** Resmin oturduğu taban: [i0, j0, a, b] (izometrik kare). Ayar: büyüklük çarpanı ve kaydırma (sahne birimi). */
export const RESIM_YERI: Record<string, { taban: [number, number, number, number]; olcek: number; dx: number; dy: number }> = {
  hamam: { taban: [0, 1, 2, 2], olcek: 1, dx: 0, dy: 0 },
  han: { taban: [4, 0, 3, 3], olcek: 1, dx: 0, dy: 0 },
  arazi: { taban: [0, 6, 1, 1], olcek: 1, dx: 0, dy: 0 },
  sandik: { taban: [3, 3, 2, 2], olcek: 0.82, dx: 0, dy: -3 },
  hayrat: { taban: [5, 4, 2, 2], olcek: 1, dx: 0, dy: 0 },
}

export const RESIM_ADLARI = [
  'hamam', 'hamam-hasarli', 'han', 'han-hasarli', 'arazi', 'arazi-kurak', 'sandik', 'sandik-bos',
  'asevi', 'asevi-kapali', 'medrese', 'medrese-kapali', 'cami', 'cami-kapali', 'cesme', 'cesme-kuru',
  // şehir genişlemesindeki yeni yapılar (henüz görseli yoksa geçici çizim kullanılır)
  'arasta', 'bedesten', 'evler', 'degirmen', 'kopru', 'kumbet', 'kervan', 'mektep',
] as const

export type Resimler = Partial<Record<(typeof RESIM_ADLARI)[number], string>>

function dene(adres: string): Promise<string | null> {
  return new Promise((coz) => {
    const r = new Image()
    r.onload = () => coz(adres)
    r.onerror = () => coz(null)
    r.src = adres
  })
}

let yukleniyor: Promise<Resimler> | null = null

/** Klasördeki resimleri bir kez yoklar (önce .webp, sonra .png). */
export function binaResimleriniYukle(): Promise<Resimler> {
  yukleniyor ??= Promise.all(
    RESIM_ADLARI.map(async (ad) => {
      const kok = `${ortam.varlikKoku}binalar/${ad}`
      return [ad, (await dene(`${kok}.webp`)) ?? (await dene(`${kok}.png`))] as const
    }),
  ).then((l) => Object.fromEntries(l.filter(([, a]) => a)) as Resimler)
  return yukleniyor
}
