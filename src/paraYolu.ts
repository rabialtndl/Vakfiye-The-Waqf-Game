import { turOyna, varsayilanAyarlar, yeniOyun } from './motor/motor'
import { SABITLER as S, type AmacId } from './motor/sabitler'

// "Paranın yolu" sayfasının rakamları. Elle yazılmaz: seçilen hizmetle varsayılan kurulum,
// normal zorluk ve olaysız bir ilk tur motorun kendisiyle oynatılır (Nasıl oynanır sayfasıyla aynı yol).

export type ParaYoluRakamlari = {
  amac: AmacId
  hamam: number
  han: number
  arazi: number
  /** Birim sayıları (varsayılan kurulum). */
  birim: { hamam: number; han: number; arazi: number; nakit: number }
  gelir: number
  fon: number
  fonOrani: number
  bakim: number
  nakit: number
  kalan: number
  gereken: number
  artan: number
}

export function paraYoluRakamlari(amac: AmacId = S.VARSAYILAN.amac): ParaYoluRakamlari {
  const a = { ...varsayilanAyarlar(), amac, zorluk: 'normal' as const, zorlaOlaylar: { 10: null } }
  const d0 = yeniOyun(a)
  const t = turOyna(d0).sonTur!
  const m = S.MULKLER
  return {
    amac,
    hamam: d0.mulk.hamam * m.hamam.gelir,
    han: d0.mulk.han * m.han.gelir,
    arazi: d0.mulk.arazi * m.arazi.gelir,
    birim: { ...d0.mulk, nakit: d0.nakit },
    gelir: t.gelir,
    fon: t.fonPayi,
    fonOrani: a.yedekFonOrani,
    bakim: t.bakim,
    nakit: d0.nakit * S.NAKIT_KATKI,
    kalan: t.hizmeteKalan,
    gereken: t.gereken,
    artan: t.artanEk,
  }
}
