// Ekranda gösterilen sayı biçimleri ve sabit metinler.
import { iki, L } from '../dil'
import type { BinaId } from '../sahne/koySvg'

export const virgul = (n: number, basamak = 1) => L(n.toFixed(basamak).replace('.', ','), n.toFixed(basamak))
export const tam = (n: number) => String(Math.round(n))

/** Kurulum kartları: ondalık sayı yerine sade sözler. Kesin oranlar Nasıl Oynanır'da. */
export const MULK_BILGI = {
  hamam: iki({ ad: 'Hamam', kazanc: 'Çok', bakim: 'Orta', tehlike: 'Depremde yıkılır', iyi: false }, { ad: 'Bathhouse', kazanc: 'High', bakim: 'Medium', tehlike: 'Collapses in earthquakes' }),
  han: iki({ ad: 'Han', kazanc: 'Çok', bakim: 'Az', tehlike: 'Yangın, deprem, savaş', iyi: false }, { ad: 'Inn', kazanc: 'High', bakim: 'Low', tehlike: 'Fire, earthquake, war' }),
  arazi: iki({ ad: 'Arazi', kazanc: 'Az', bakim: 'Yok', tehlike: 'Kuraklık. Ama hiç yıkılmaz', iyi: true }, { ad: 'Farmland', kazanc: 'Low', bakim: 'None', tehlike: 'Drought. But it never collapses' }),
  nakit: iki({ ad: 'Nakit', kazanc: 'Yok, onarıma yarar', bakim: 'Yok', tehlike: 'Enflasyonda erir', iyi: false }, { ad: 'Cash', kazanc: 'None, pays for repairs', bakim: 'None', tehlike: 'Melts away in inflation' }),
} as const

export const BINA_ACIKLAMA: Record<BinaId, string> = iki<Record<BinaId, string>>({
  hamam: 'En çok kazandıran bina, ama depremde ilk yıkılan da o.',
  han: 'Kervanlar ve çarşı. Yangında yanar, savaşta yol kapanınca o tur gelir getirmez.',
  arazi: 'Az kazandırır ama hiç yıkılmaz. Kuraklıkta o tur ürün vermez.',
  sandik: 'Gelir önce buraya gelir. Şartın kadarı yedek fona ayrılır, kalanı hizmete gider.',
  hayrat: 'Vakfın hizmet binası. Sandık her tur bu hizmetin giderini ödemek zorunda.',
}, {
  hamam: 'The building that earns the most, but also the first to collapse in an earthquake.',
  han: 'Caravans and the bazaar. It burns in a fire, and in a war, when the road closes, it earns nothing that round.',
  arazi: 'Earns little but never collapses. In a drought it yields nothing that round.',
  sandik: 'Income comes here first. The share you set goes to the reserve fund; the rest goes to the service.',
  hayrat: 'The foundation’s service building. Every round, the chest must pay for this service.',
})
