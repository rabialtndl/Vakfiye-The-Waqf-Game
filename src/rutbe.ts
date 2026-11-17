// Afet sorularında doğru cevaplar rütbe kazandırır. Ahilik geleneğindeki sıra: çırak, kalfa, usta, ahi.
// Her rütbe kalıcı bir ayrıcalık açar; ilerleme oyunlar arasında saklanır.

import { iki } from './dil'

export type Rutbe = { no: number; ad: string; simge: string; gereken: number; ayricalik: string }

export const RUTBELER: Rutbe[] = [
  iki({ no: 0, ad: 'Çırak', simge: '🔰', gereken: 0, ayricalik: 'Afette soruyu bilirsen afet söner.' }, { ad: 'Apprentice', ayricalik: 'Answer the question right in a disaster and it is put out.' }),
  iki({ no: 1, ad: 'Kalfa', simge: '🪣', gereken: 3, ayricalik: 'Oyuna bir fazla canla başlarsın (4 ❤️).' }, { ad: 'Journeyman', ayricalik: 'You start each game with one extra life (4 ❤️).' }),
  iki({ no: 2, ad: 'Usta', simge: '🛠️', gereken: 6, ayricalik: 'Doğru cevapta hayırseverler vakfa +3 akçe bağışlar.' }, { ad: 'Master', ayricalik: 'On a right answer, benefactors donate +3 akçe to the foundation.' }),
  iki({ no: 3, ad: 'Ahi', simge: '🏅', gereken: 10, ayricalik: 'İlk yanlışta can gitmez: bir soru hakkı daha.' }, { ad: 'Ahi', ayricalik: 'Your first wrong answer costs no life: you get one more question.' }),
]

/** Can: her oyun bu kadar canla başlar; yanlış cevap bir can götürür, her yüzyıl bir can geri gelir. */
export const CAN = 3
export const CAN_YENILEME_YIL = 100
export function canEnCok(dogru: number): number {
  return CAN + (rutbe(dogru).simdiki.no >= 1 ? 1 : 0)
}
export const USTA_BAGISI = 3

export function rutbe(dogru: number): { simdiki: Rutbe; sonraki: Rutbe | null; kalan: number } {
  const simdiki = [...RUTBELER].reverse().find((r) => dogru >= r.gereken) ?? RUTBELER[0]
  const sonraki = RUTBELER[simdiki.no + 1] ?? null
  return { simdiki, sonraki, kalan: sonraki ? sonraki.gereken - dogru : 0 }
}

/** Bu cevapla rütbe atlandıysa yeni rütbe. */
export function rutbeAtladi(onceki: number, simdi: number): Rutbe | null {
  const a = rutbe(onceki).simdiki
  const b = rutbe(simdi).simdiki
  return b.no > a.no ? b : null
}
