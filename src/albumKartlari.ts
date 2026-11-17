// Eser albümü: vakıf her 100 yıl ayakta kaldıkça envanterden bir gerçek eserin kartı açılır.
// Kart, oyuncunun köyündeki bina türlerinden seçilir (hamamı olana hamam, aşevi kurana imaret...).
import type { Durum } from './motor/motor'
import type { GercekEser } from './ortam'
import { binaTurleri } from './arayuz/GercekEserler'
import { iki } from './dil'

export const ALBUM_BOLUMLERI: { ad: string; turler: string[] }[] = [
  iki({ ad: 'Hamamlar', turler: ['hamam'] }, { ad: 'Bathhouses' }),
  iki({ ad: 'Hanlar ve çarşılar', turler: ['han', 'bedesten-carsi'] }, { ad: 'Inns and bazaars' }),
  iki({ ad: 'İmaretler ve külliyeler', turler: ['imaret', 'kulliye'] }, { ad: 'Imarets and külliyes' }),
  iki({ ad: 'Medreseler', turler: ['medrese'] }, { ad: 'Madrasas' }),
  iki({ ad: 'Çeşmeler ve sebiller', turler: ['cesme', 'sebil'] }, { ad: 'Fountains and sebils' }),
]
export const ALBUM_TURLERI = ALBUM_BOLUMLERI.flatMap((b) => b.turler)

/** Bu oyunda kazanılan kart sayısı: her 100 yıl için bir, en çok 6. */
export const kartHakki = (d: Durum) => Math.min(6, Math.floor(d.yil / 100))

function karistir<T>(dizi: T[], tohum: number): T[] {
  const a = [...dizi]
  let s = tohum >>> 0 || 1
  for (let i = a.length - 1; i > 0; i--) {
    s = (Math.imul(s ^ (s >>> 15), 2246822507) + 0x9e3779b9) >>> 0
    const j = s % (i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Henüz toplanmamış eserlerden bu oyunun kartlarını seçer. Önce oyuncunun bina türleri, fotoğraflılar önde. */
export function kartlariSec(d: Durum, toplanan: string[], havuz: GercekEser[], sira: number): GercekEser[] {
  const n = kartHakki(d)
  if (n === 0) return []
  const sermaye = d.ayarlar.sermaye
  const benim = new Set([
    ...(sermaye.hamam > 0 ? binaTurleri('hamam', d.ayarlar.amac) : []),
    ...(sermaye.han > 0 ? binaTurleri('han', d.ayarlar.amac) : []),
    ...binaTurleri('hayrat', d.ayarlar.amac),
  ])
  const alinmamis = havuz.filter((e) => !toplanan.includes(e.id))
  const sirala = (l: GercekEser[]) => karistir(l, d.ayarlar.tohum * 31 + sira).sort((a, b) => Number(!!b.gorsel) - Number(!!a.gorsel))
  const once = sirala(alinmamis.filter((e) => benim.has(e.tur)))
  const sonra = sirala(alinmamis.filter((e) => !benim.has(e.tur)))
  return [...once, ...sonra].slice(0, n)
}
