// Afet müdahalesinde oyuncunun üstlendiği rol: adı, ne yapacağı ve rolün gerçek tarihteki karşılığı (kaynaklı).
import { L } from './dil'
import type { MudahaleTuru } from './mudahale'

export type Rol = { ad: string; simge: string; gorev: string[]; tarih: string; kaynak: { ad: string; url: string }; sonuc: (oran: number) => string }

const yuzde = (x: number) => L(`%${Math.round(x * 100)}`, `${Math.round(x * 100)}%`)

/** 1720'de Tulumbacı Ocağı kuruldu; ondan önce yangını esnaf, görevliler ve mahalleli söndürürdü. */
export function rolBul(tur: MudahaleTuru, takvimYili: number | null): Rol {
  if (tur === 'yangin') {
    const tulumba = takvimYili !== null && takvimYili >= 1720
    return {
      ad: tulumba ? L('Tulumbacı', 'Fire pumper') : L('Kova zinciri', 'Bucket chain'),
      simge: '🚒',
      gorev: L([
        'Alevlere dokun: her dokunuş bir kova su, alevi bir kademe küçültür.',
        'Su bitince çeşmeye (💧) dokunup doldur.',
        'Büyüyen alevi bırakma: en büyük hâlinde fazla kalırsa yayılır.',
      ], [
        'Tap the flames: each tap is a bucket of water and makes the flame one step smaller.',
        'When the water runs out, tap the fountain (💧) to refill.',
        'Do not leave a growing flame: if it stays at its biggest for too long, it spreads.',
      ]),
      tarih: tulumba
        ? L('1720’de Sadrazam Nevşehirli İbrahim Paşa, tulumbanın mucidi Gerçek Davud’u Tulumbacı Ocağı’nı kurmakla görevlendirdi. Ücretli tulumbacılar yangına koştu.', 'In 1720 Grand Vizier Nevşehirli İbrahim Pasha charged Gerçek Davud, the inventor of the fire pump, with founding the Fire Pump Corps. Paid pumpers rushed to the fires.')
        : L('Tulumbacı Ocağı 1720’de kuruldu. Ondan önce, taşra şehirlerinde XIX. yüzyılda bile yangınlar esnafın, görevlilerin ve mahallelinin yardımıyla geleneksel yollarla söndürülürdü.', 'The Fire Pump Corps was founded in 1720. Before that, and in provincial towns even in the 19th century, fires were put out the traditional way, with the help of tradesmen, officials and neighbours.'),
      kaynak: { ad: 'TDV İslâm Ansiklopedisi: İtfaiye', url: 'https://islamansiklopedisi.org.tr/itfaiye' },
      sonuc: (o) => L(`Yangını ${yuzde(o)} başarıyla söndürdün: hasar ${yuzde(o * 0.5)} azaldı.`, `You put out ${yuzde(o)} of the fire: damage reduced by ${yuzde(o * 0.5)}.`),
    }
  }
  if (tur === 'deprem') {
    return {
      ad: L('Yardım ekibi', 'Rescue team'),
      simge: '⛑️',
      gorev: L([
        'Enkaz yığınına üç kez dokunup kaldır.',
        'Bazı yığınların altında insanlar var, bazılarında onarıma yarayacak sağlam taşlar.',
        'Geç kalırsan yığın çöker; hızlı ol.',
      ], [
        'Tap a rubble heap three times to clear it.',
        'Some heaps have people under them, others have sound stones for repairs.',
        'If you are too late the heap collapses; be quick.',
      ]),
      tarih: L('10 Eylül 1509 İstanbul depreminden sonra Anadolu’dan ve Rumeli’den on binlerce işçi, taşçı ve marangoz getirildi. Şehir 1510 baharında birkaç ay içinde yeniden yapıldı.', 'After the Istanbul earthquake of 10 September 1509, tens of thousands of workers, stonemasons and carpenters were brought from Anatolia and the Balkans. The city was rebuilt within a few months in the spring of 1510.'),
      kaynak: { ad: 'Erhan Afyoncu (Sabah): Depremin yaraları dokuz ayda sarıldı', url: 'https://sabah.com.tr/yazarlar/erhan-afyoncu/2023/04/16/depremin-yaralari-dokuz-ayda-sarildi' },
      sonuc: (o) => L(`Enkazı ${yuzde(o)} başarıyla kaldırdın, sağlam taşlar ayrıldı: hasar ${yuzde(o * 0.5)} azaldı.`, `You cleared ${yuzde(o)} of the rubble and set aside the sound stones: damage reduced by ${yuzde(o * 0.5)}.`),
    }
  }
  return {
    ad: L('Darüşşifa hekimi', 'Hospital physician'),
    simge: '🩺',
    gorev: L([
      'Ateşi yükselen hastaya dokun: boş yatağa yatırırsın.',
      'Yatakta birkaç saniyede iyileşir, yatak boşalır.',
      'Ateşi en yükseğe çıkan hastayı bekletme.',
    ], [
      'Tap a patient whose fever is rising to put them in an empty bed.',
      'In bed they recover in a few seconds and the bed is free again.',
      'Do not keep the patient with the highest fever waiting.',
    ]),
    tarih: L('Darüşşifalar parasız bakılan hastanelerdi; çoğu bir vakfa bağlıydı. Manisa’daki Hafsa Sultan Darüşşifası (1539) Hafsa Sultan’ın vakfıydı; vakfiyesi hekimleri ve diğer görevlileri tek tek sayardı.', 'Darüşşifas were hospitals where care was free; most belonged to a foundation. The Hafsa Sultan Darüşşifa in Manisa (1539) was Hafsa Sultan’s foundation; its deed listed the physicians and other staff one by one.'),
    kaynak: { ad: 'TDV İslâm Ansiklopedisi: Bîmâristan', url: 'https://islamansiklopedisi.org.tr/bimaristan' },
    sonuc: (o) => L(`Hastaların ${yuzde(o)} kadarını iyileştirdin: salgının fazladan giderinin ${yuzde(o)} kadarı yedek fona döndü.`, `You healed ${yuzde(o)} of the patients: ${yuzde(o)} of the epidemic’s extra cost went back to the reserve fund.`),
  }
}
