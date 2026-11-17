import { iki } from '../dil'

// Vakıf Oyunu sabitleri. Kaynak: docs/vakif-oyunu-kurallari-v2.md, bölüm 2.
// Denge ayarı yalnızca bu dosyadan yapılır.

export const SABITLER = {
  TUR_YIL: 10,
  HEDEF_YIL: 600,
  SERMAYE_TOPLAM: 100,
  SERMAYE_ADIM: 5,

  MULKLER: {
    hamam: { gelir: 0.8, bakim: 0.2 },
    han: { gelir: 0.72, bakim: 0.07 },
    arazi: { gelir: 0.36, bakim: 0.0 },
  },
  NAKIT_KATKI: 0.02,

  AMACLAR: {
    asevi: iki({ ad: 'Aşevi', gider: 26 }, { ad: 'Soup Kitchen' }),
    medrese: iki({ ad: 'Medrese', gider: 22 }, { ad: 'Madrasa' }),
    cami: iki({ ad: 'Cami', gider: 20 }, { ad: 'Mosque' }),
    cesme: iki({ ad: 'Çeşme', gider: 12 }, { ad: 'Fountain' }),
  },

  HAYRAT_BAKIM_ORANI: 0.05,

  YEDEK_FON_MIN: 0,
  YEDEK_FON_MAX: 50,
  YEDEK_FON_ADIM: 5,

  MUTEVELLI: {
    durust: iki({ ad: 'Dürüst ama beceriksiz', gelirCarpani: 1.0, zimmet: false }, { ad: 'Honest but unskilled' }),
    becerikli: iki({ ad: 'Becerikli ama riskli', gelirCarpani: 1.05, zimmet: true }, { ad: 'Skilled but risky' }),
  },
  ZIMMET_IHTIMAL: 0.15,
  ZIMMET_ORAN: 0.6,
  ZIMMET_ESIK_FON: 10,

  // Kümülatif sırayla okunur. v3 (23 Eki): deprem ve yangın seyreldi; salgın ve üç iyi olay eklendi.
  // Kötü olaylar toplamı %33 (v2'de %36), iyi olaylar %16.
  OLAYLAR: [
    { id: 'deprem', ihtimal: 0.07 },
    { id: 'yangin', ihtimal: 0.08 },
    { id: 'kuraklik', ihtimal: 0.06 },
    { id: 'savas', ihtimal: 0.06 },
    { id: 'enflasyon', ihtimal: 0.05 },
    { id: 'salgin', ihtimal: 0.07 },
    { id: 'bereket', ihtimal: 0.05 },
    { id: 'kervan', ihtimal: 0.04 },
    { id: 'bagis', ihtimal: 0.03 },
  ],
  /** Oyuncuya iyi gelen olaylar: günlükte yeşil, olay sayısına girmez. */
  IYI_OLAYLAR: ['bereket', 'kervan', 'bagis'],
  SALGIN_HAN: 0.4, // salgında kervan gelmez: han geliri yarıya iner
  SALGIN_GIDER: 1.5, // hayrata ihtiyaç artar: o turun hizmet gideri %30 fazla
  BEREKET_ARAZI: 2, // bereketli yılda tarla iki kat ürün verir
  KERVAN_HAN: 1.5, // kervan mevsimi: han geliri %50 fazla
  BAGIS_FON: 6, // hayırsever yedek fona bağışlar

  DEPREM_HAMAM: 0.8,
  DEPREM_HAN: 0.4,
  YANGIN_HAN: 0.6,
  ENFLASYON_NAKIT: 0.4,
  ENFLASYON_FON: 0.2,
  ENFLASYON_GIDER_ARTIS: 0.12,

  ONARIM_CARPANI: 0.9, // v2
  KIS_GERI_ORAN: 0.85, // v2
  KIS_GERI_GELIS_TUR: 4,
  KIS_HIZMET_TUR: 2,
  KIS_HIZMET_CARPANI: 0.5,

  COKUS_ART_ARDA_BOS: 3,

  // Kolay mod: gelir ×1,1 ve çöküş için 4 tur. Olay zarları aynı kalır (aynı tohum aynı olaylar).
  KOLAY_GELIR_CARPANI: 1.1,

  VARSAYILAN: {
    sermaye: { hamam: 30, han: 30, arazi: 25, nakit: 15 },
    amac: 'asevi',
    yedekFonOrani: 20,
    mutevelli: 'durust',
    tohum: 10,
  },
} as const

export type OlayId = (typeof SABITLER.OLAYLAR)[number]['id']
export type AmacId = keyof typeof SABITLER.AMACLAR
export type MutevelliId = keyof typeof SABITLER.MUTEVELLI
export type MulkId = keyof typeof SABITLER.MULKLER
