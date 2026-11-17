// mulberry32: tohumlu, deterministik PRNG.
// Durum tek bir 32 bit sayı; oyun durumunun içinde saklanır, böylece kayıt ve tekrar kolaydır.

export function cek(durum: number): [deger: number, yeniDurum: number] {
  const a = (durum + 0x6d2b79f5) >>> 0
  let t = a
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, a]
}
