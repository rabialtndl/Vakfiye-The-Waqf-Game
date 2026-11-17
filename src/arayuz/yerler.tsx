// Haritada vakfa ait olmayan yerler (köprü, değirmen, başka vakıfların çeşmesi, camisi...): dokununca
// envanterdeki gerçek örnekleri açılır. Envanterde karşılığı yoksa kaynaklı kısa bir bilgi gösterilir.
import type { AmacId } from '../motor/sabitler'
import { iki, L } from '../dil'
import { eserAc, type GercekEser } from '../ortam'
import type { EsnafHikayesi } from '../esnaf'

export type YerId = 'kopru' | 'degirmen' | AmacId

export type YerBilgisi = {
  ad: string
  turler: string[]
  baslik: string
  aciklama: string
  sec?: (e: GercekEser) => boolean
  ek?: React.ReactNode
}

const KopruBilgisi = () => L(
  <div className="yer-bilgi">
    <p>
      Vakıf Katılım envanterinde henüz köprü kaydı yok. Selçuklu ve Osmanlı döneminde çok sayıda köprü yapıldı ya da onarıldı. Bilinen birkaç örnek:
    </p>
    <ul>
      <li><b>Kayseri Tekgöz Köprüsü</b>: Selçuklu dönemi, 1202.</li>
      <li><b>Mustafa Paşa Köprüsü</b>: Meriç üzerinde (bugün Bulgaristan, Svilengrad), 1528–29; Mimar Sinan’ın eserleri arasında sayılır.</li>
      <li><b>Mostar Köprüsü</b>: Neretva üzerinde, 1557–1567.</li>
      <li><b>Büyükçekmece Köprüsü</b>: Mimar Sinan, 1567–68; yirmi sekiz gözlü, yaklaşık 635 m.</li>
    </ul>
  </div>,
  <div className="yer-bilgi">
    <p>
      The Vakıf Katılım inventory has no bridge records yet. Many bridges were built or repaired in the Seljuk and Ottoman periods. A few known examples:
    </p>
    <ul>
      <li><b>Tekgöz Bridge, Kayseri</b>: Seljuk period, 1202.</li>
      <li><b>Mustafa Pasha Bridge</b>: over the Maritsa (today Svilengrad, Bulgaria), 1528–29; counted among the works of Mimar Sinan.</li>
      <li><b>Mostar Bridge</b>: over the Neretva, 1557–1567.</li>
      <li><b>Büyükçekmece Bridge</b>: Mimar Sinan, 1567–68; twenty-eight arches, about 635 m long.</li>
    </ul>
  </div>,
)

const DegirmenBilgisi = () => (
  <div className="yer-bilgi">
    {L(<p>
      Vakıflar değirmen, dükkân, hamam gibi gelir getiren yapılar da edinirdi; gelirleri hayrata giderdi. Vakıf Katılım envanterinde
      Hatay’daki <b>Reyhanlı Yenişehir Değirmeni</b> kayıtlı.
    </p>, <p>
      Foundations also acquired income-earning buildings such as mills, shops and bathhouses; their income went to charity. The Vakıf Katılım inventory
      records the <b>Reyhanlı Yenişehir Mill</b> in Hatay.
    </p>)}
    <button className="ilham-git bag" onClick={() => eserAc('reyhanli-yenisehir-degirmeni-hatay')}>{L('Eser kartını aç →', 'Open the monument card →')}</button>
  </div>
)

/**
 * Haritadaki vakıf dışı yerler (köprü, değirmen, başka vakfın camisi...): dokununca kümbet gibi kısa bir kart açılır.
 * Kart, bilgi yerleriyle aynı bileşeni (EsnafKarti) kullanır; ödül yoktur. Envanterde karşılığı olan türlerde
 * kartın altında gerçek örnek şeridi görünür.
 */
export const YER_KARTLARI: Record<YerId, EsnafHikayesi> = {
  kopru: iki<EsnafHikayesi>({
    id: 'yer-kopru', kim: '', simge: '🌉', yer: [0, 0], yerAd: 'Köprü',
    baslik: 'Köprü',
    metin: 'Kasabanın taş köprüsü nehrin iki yakasını bağlar. Selçuklu ve Osmanlı döneminde çok sayıda köprü yapıldı ya da onarıldı. Örnekler: Kayseri Tekgöz Köprüsü (1202), Mostar Köprüsü (1557–1567), Mimar Sinan’ın Büyükçekmece Köprüsü (1567–68).',
    kaynak: { ad: 'TDV İslâm Ansiklopedisi: Köprü', url: 'https://islamansiklopedisi.org.tr/kopru' },
  }, {
    yerAd: 'Bridge', baslik: 'Bridge',
    metin: 'The town’s stone bridge joins the two banks of the river. Many bridges were built or repaired in the Seljuk and Ottoman periods. Examples: the Tekgöz Bridge in Kayseri (1202), the Mostar Bridge (1557–1567) and Mimar Sinan’s Büyükçekmece Bridge (1567–68).',
    kaynak: { ad: 'TDV İslâm Ansiklopedisi: Köprü (Turkish)', url: 'https://islamansiklopedisi.org.tr/kopru' },
  }),
  degirmen: iki<EsnafHikayesi>({
    id: 'yer-degirmen', kim: '', simge: '⚙️', yer: [0, 0], yerAd: 'Su değirmeni',
    baslik: 'Vakıf değirmeni',
    metin: 'Vakıflar değirmen, dükkân, hamam gibi gelir getiren yapılar da edinirdi; gelirleri hayrata giderdi. Vakıf Katılım envanterinde Hatay’daki Reyhanlı Yenişehir Değirmeni kayıtlı.',
    kaynak: { ad: 'Vakıf Katılım envanteri: Reyhanlı Yenişehir Değirmeni', eser: 'reyhanli-yenisehir-degirmeni-hatay' },
  }, {
    yerAd: 'Water mill', baslik: 'A foundation mill',
    metin: 'Foundations also acquired income-earning buildings such as mills, shops and bathhouses; their income went to charity. The Vakıf Katılım inventory records the Reyhanlı Yenişehir Mill in Hatay.',
    kaynak: { ad: 'Vakıf Katılım inventory: Reyhanlı Yenişehir Mill', eser: 'reyhanli-yenisehir-degirmeni-hatay' },
  }),
  cesme: iki<EsnafHikayesi>({
    id: 'yer-cesme', kim: '', simge: '⛲', yer: [0, 0], yerAd: 'Çeşme', turler: ['cesme', 'sebil'],
    baslik: 'Çeşme ve sebil',
    metin: 'Bu çeşme başka bir vakfın. Çeşme ve sebiller, yolculara ve mahalleliye karşılıksız su veren hayır yapılarıdır; çoğu bir vakıf tarafından yaptırılırdı.',
    kaynak: { ad: 'Vakıf Katılım envanteri' },
  }, {
    yerAd: 'Fountain', baslik: 'Fountains and sebils',
    metin: 'This fountain belongs to another foundation. Fountains and sebils are charitable buildings that gave travellers and neighbours water for free; most were built by a foundation.',
    kaynak: { ad: 'Vakıf Katılım inventory' },
  }),
  cami: iki<EsnafHikayesi>({
    id: 'yer-cami', kim: '', simge: '🕌', yer: [0, 0], yerAd: 'Cami', turler: ['cami'],
    baslik: 'Cami',
    metin: 'Bu cami başka bir vakfın. Cami çoğu zaman bir külliyenin merkeziydi; medrese, imaret, çeşme gibi vakıf yapıları çevresinde toplanırdı.',
    kaynak: { ad: 'Vakıf Katılım envanteri' },
  }, {
    yerAd: 'Mosque', baslik: 'Mosque',
    metin: 'This mosque belongs to another foundation. A mosque was often the centre of a külliye; foundation buildings such as the madrasa, imaret and fountain gathered around it.',
    kaynak: { ad: 'Vakıf Katılım inventory' },
  }),
  medrese: iki<EsnafHikayesi>({
    id: 'yer-medrese', kim: '', simge: '📖', yer: [0, 0], yerAd: 'Medrese', turler: ['medrese'],
    baslik: 'Medrese',
    metin: 'Bu medrese başka bir vakfın. Medreseler çoğunlukla vakıf gelirleriyle işlerdi; hocaların ücreti ve öğrencilerin giderleri vakfiyede yazılı gelirlerden karşılanırdı.',
    kaynak: { ad: 'Vakıf Katılım envanteri' },
  }, {
    yerAd: 'Madrasa', baslik: 'Madrasa',
    metin: 'This madrasa belongs to another foundation. Madrasas mostly ran on foundation income; the teachers’ pay and the students’ expenses were met from the income named in the vakfiye.',
    kaynak: { ad: 'Vakıf Katılım inventory' },
  }),
  asevi: iki<EsnafHikayesi>({
    id: 'yer-asevi', kim: '', simge: '🍲', yer: [0, 0], yerAd: 'Aşevi', turler: ['imaret', 'kulliye'],
    baslik: 'İmaret (aşevi)',
    metin: 'Bu aşevi başka bir vakfın. İmaret denen aşevleri yoksullara, yolculara ve medrese öğrencilerine yemek verirdi; giderleri vakıf gelirinden karşılanırdı.',
    kaynak: { ad: 'Vakıf Katılım envanteri' },
  }, {
    yerAd: 'Soup kitchen', baslik: 'Imaret (soup kitchen)',
    metin: 'This soup kitchen belongs to another foundation. Soup kitchens, called imarets, fed the poor, travellers and madrasa students; their costs were met from foundation income.',
    kaynak: { ad: 'Vakıf Katılım inventory' },
  }),
}

export const YERLER: Record<YerId, YerBilgisi> = {
  kopru: iki<YerBilgisi>({ ad: 'Köprü', turler: ['kopru'], baslik: 'Köprüler', aciklama: 'Kasabanın taş köprüsü nehrin iki yakasını bağlar.', ek: <KopruBilgisi /> }, { ad: 'Bridge', baslik: 'Bridges', aciklama: 'The town’s stone bridge joins the two banks of the river.' }),
  degirmen: iki<YerBilgisi>({
    ad: 'Su değirmeni', turler: ['diger'], baslik: 'Değirmenler',
    aciklama: 'Nehir kıyısındaki su değirmeni.',
    sec: (e) => /degirmen/.test(e.id),
    ek: <DegirmenBilgisi />,
  }, { ad: 'Water mill', baslik: 'Mills', aciklama: 'The water mill on the riverbank.' }),
  cesme: iki<YerBilgisi>({ ad: 'Çeşme', turler: ['cesme', 'sebil'], baslik: 'Gerçek çeşmeler', aciklama: 'Bu çeşme başka bir vakfın. Envanterdeki gerçek çeşmeler ve sebiller:' }, { ad: 'Fountain', baslik: 'Real fountains', aciklama: 'This fountain belongs to another foundation. Real fountains and sebils in the inventory:' }),
  cami: iki<YerBilgisi>({ ad: 'Cami', turler: ['cami'], baslik: 'Gerçek camiler', aciklama: 'Bu cami başka bir vakfın. Envanterdeki gerçek camiler:' }, { ad: 'Mosque', baslik: 'Real mosques', aciklama: 'This mosque belongs to another foundation. Real mosques in the inventory:' }),
  medrese: iki<YerBilgisi>({ ad: 'Medrese', turler: ['medrese'], baslik: 'Gerçek medreseler', aciklama: 'Bu medrese başka bir vakfın. Envanterdeki gerçek medreseler:' }, { ad: 'Madrasa', baslik: 'Real madrasas', aciklama: 'This madrasa belongs to another foundation. Real madrasas in the inventory:' }),
  asevi: iki<YerBilgisi>({ ad: 'Aşevi', turler: ['imaret', 'kulliye'], baslik: 'Gerçek imaretler ve külliyeler', aciklama: 'Bu aşevi başka bir vakfın. Envanterdeki gerçek imaretler ve külliyeler:' }, { ad: 'Soup kitchen', baslik: 'Real imarets and külliyes', aciklama: 'This soup kitchen belongs to another foundation. Real imarets and külliyes in the inventory:' }),
}
