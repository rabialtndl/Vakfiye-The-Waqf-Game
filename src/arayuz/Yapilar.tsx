import { useState } from 'react'
import { SABITLER as S, type AmacId } from '../motor/sabitler'
import { ARSALAR, BOLGELER, YAPILAR, type YapiId } from '../motor/sehir'
import { eserAc, eserSayfasi, ortam } from '../ortam'
import { L } from '../dil'
import { TUR } from './EserPaneli'
import { EserFoto, ilAdi, useEserler } from './GercekEserler'
import { ESER_BILGI, ILHAM, YAPI_ILHAM, type Ilham } from './ilham'

// "Yapılar" sekmesi: oyundaki her yapı tek kartta. Ne işe yarar, ne getirir, neye dikkat.
// Karta dokununca üç alt sekme açılır: Özellikleri, İlham kaynağı, Gerçek örnekler.
// Yeni yapıların rakamları motordan (YAPILAR) gelir; kural değişince kart da değişir.

const resim = (ad: string) => `${ortam.varlikKoku}binalar/${ad}.webp`

type Kart = {
  id: string
  ad: string
  resim?: string
  simge?: string
  metin: string
  artilar: string[]
  dikkat?: string
  /** "Özellikleri" sekmesi: oyundaki davranışı, rakamlarıyla. */
  ozellik: string[]
  /** Tarihte bu yapı ne işe yarardı (yalnız emin olduğumuz kısa notlar). */
  tarih?: string
  ilham?: Ilham
  /** İlham eseri yoksa nedeni. */
  ilhamYok?: string
  /** Gerçek örnekler için envanter türleri; envanterde türü "diger" olanlarda kimliğe göre süzülür. */
  turler?: string[]
  sec?: RegExp
}

type Sekme = 'ozellik' | 'ilham' | 'ornek'

/** İlham kaynağı: ad ve yer oyunun içinde durur, fotoğraf ve eser kartı envanter yüklenirse eklenir. */
function IlhamPaneli({ ilham, kart }: { ilham: Ilham; kart: Kart }) {
  const eserler = useEserler([ilham.tur])
  const [fi, setFi] = useState(0)
  const e = eserler?.find((x) => x.id === ilham.id)
  const bilgi = ESER_BILGI[ilham.id]
  const gorseller = e ? (e.gorseller?.length ? e.gorseller : e.gorsel ? [e.gorsel] : []) : []
  const ad = e?.ad ?? bilgi?.ad ?? ilham.id
  const ilce = e?.ilce ?? bilgi?.ilce
  const il = e?.il ?? bilgi?.il ?? ''
  const tur = ilham.tur !== 'diger' && !ilham.id.startsWith('sukran-') && TUR[ilham.tur] ? L(TUR[ilham.tur][0], TUR[ilham.tur][1]) : ''
  const yer = [tur, ilce, il && ilAdi(il)].filter(Boolean).join(' · ')
  return (
    <div className="yp-il">
      <div className="yp-il-foto">
        {gorseller.length ? (
          <img src={gorseller[Math.min(fi, gorseller.length - 1)]} alt={ad} />
        ) : (
          <div className="yp-il-cizim">
            {kart.resim ? <img src={kart.resim} alt="" /> : <span aria-hidden="true">{kart.simge ?? '🕌'}</span>}
            <small>{eserler === null ? L('Eser fotoğrafları yükleniyor…', 'Loading monument photos…') : L('Oyundaki çizim', 'The drawing in the game')}</small>
          </div>
        )}
      </div>
      {gorseller.length > 1 && (
        <div className="yp-il-kucuk">
          {gorseller.slice(0, 5).map((g, i) => (
            <button key={g} type="button" aria-label={L(`${i + 1}. fotoğraf`, `Photo ${i + 1}`)} aria-pressed={i === fi} onClick={() => setFi(i)}>
              <img src={g} alt="" />
            </button>
          ))}
        </div>
      )}
      <span className="ilham-etiket">{L('İlham kaynağı', 'Inspired by')}</span>
      <h4 className="baslik yp-il-ad">{ad}</h4>
      <p className="kucuk">{yer}</p>
      <p>{ilham.neden}</p>
      <button type="button" className="dugme yesil baslik" onClick={() => (e ? eserAc(e.id) : window.open(eserSayfasi(ilham.id), '_blank', 'noopener'))}>
        {e ? L('Eser kartını aç →', 'Open the monument card →') : L('Eser sayfasını aç ↗', 'Open the monument page ↗')}
      </button>
    </div>
  )
}

function Detay({ k }: { k: Kart }) {
  const [sekme, setSekme] = useState<Sekme>('ozellik')
  const [sehir, setSehir] = useState('hepsi')
  const eserler = useEserler(k.turler ?? [])
  const ornekler = eserler && eserler.filter((e) => e.id !== k.ilham?.id && (!k.sec || k.sec.test(e.id)))
  const sehirler = ornekler ? [...new Set(ornekler.map((e) => e.il))].sort() : []
  const liste = (ornekler ?? []).filter((e) => sehir === 'hepsi' || e.il === sehir)
  const SEKMELER: [Sekme, string][] = [
    ['ozellik', L('Özellikleri', 'Features')],
    ['ilham', L('İlham kaynağı', 'Inspiration')],
    ['ornek', L('Gerçek örnekler', 'Real examples')],
  ]
  return (
    <div className="yp-detay">
      <div className="parcali yp-alt-sekmeler" role="tablist" aria-label={L('Yapı detayları', 'Building details')}>
        {SEKMELER.map(([id, ad]) => (
          <button key={id} type="button" role="tab" aria-selected={sekme === id} onClick={() => setSekme(id)}>{ad}</button>
        ))}
      </div>
      {sekme === 'ozellik' && (
        <div role="tabpanel">
          <section className="yp-d-bolum">
            <h4 className="baslik">{L('Oyundaki özelliği', 'How it works in the game')}</h4>
            <ul className="yp-d-liste">{k.ozellik.map((o) => <li key={o}>{o}</li>)}</ul>
          </section>
          {k.tarih && (
            <section className="yp-d-bolum">
              <h4 className="baslik">{L('Tarihte', 'In history')}</h4>
              <p>{k.tarih}</p>
            </section>
          )}
        </div>
      )}
      {sekme === 'ilham' && (
        <div role="tabpanel">{k.ilham ? <IlhamPaneli ilham={k.ilham} kart={k} /> : <p className="yp-d-not">{k.ilhamYok}</p>}</div>
      )}
      {sekme === 'ornek' && (
        <div role="tabpanel">
          {k.turler?.length ? (
            <>
              <p className="kucuk">{L('Vakıf Katılım envanterinden · dokun, eser kartını aç', 'From the Vakıf Katılım inventory · tap to open the monument card')}</p>
              {eserler === null && <p className="yp-d-not" role="status">{L('Gerçek örnekler yükleniyor…', 'Loading real examples…')}</p>}
              {ornekler && ornekler.length === 0 && <p className="yp-d-not">{L('Envanterde şu an gösterilecek örnek bulunamadı.', 'No examples to show from the inventory right now.')}</p>}
              {sehirler.length > 1 && (
                <div className="parcali yp-sehir" role="radiogroup" aria-label={L('Şehir', 'City')}>
                  {['hepsi', ...sehirler].map((c) => (
                    <button key={c} type="button" role="radio" aria-checked={sehir === c} onClick={() => setSehir(c)}>{c === 'hepsi' ? L('Hepsi', 'All') : ilAdi(c)}</button>
                  ))}
                </div>
              )}
              <ul className="eser-izgara">
                {liste.map((e) => (
                  <li key={e.id}>
                    <button type="button" className="eser-kucuk" onClick={() => eserAc(e.id)}>
                      <EserFoto e={e} />
                      <span className="eser-ad baslik">{e.ad}</span>
                      <span className="kucuk">{ilAdi(e.il)}{e.ilce ? ` · ${e.ilce}` : ''}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="yp-d-not">{L('Bu kalem gerçek bir yapı olmadığı için envanterde örneği yok.', 'This item is not a real building, so there are no examples in the inventory.')}</p>
          )}
        </div>
      )}
    </div>
  )
}

function Kartlar({ kartlar, acik, onSec }: { kartlar: Kart[]; acik: string | null; onSec: (id: string | null) => void }) {
  return (
    <ul className="yp-liste">
      {kartlar.map((k) => {
        const a = acik === k.id
        return (
          <li key={k.id} className={`yp-kart${a ? ' acik' : ''}`}>
            <button type="button" className="yp-kart-ust" aria-expanded={a} onClick={() => onSec(a ? null : k.id)}>
              <span className="yp-resim" aria-hidden="true">{k.resim ? <img src={k.resim} alt="" /> : k.simge}</span>
              <div>
                <h3 className="baslik">{k.ad}</h3>
                <p>{k.metin}</p>
                <div className="yp-cipler">
                  {k.artilar.map((x) => <span key={x} className="yp-cip">{x}</span>)}
                  {k.dikkat && <span className="yp-cip dikkat">⚠ {k.dikkat}</span>}
                </div>
              </div>
              <span className="yp-ok" aria-hidden="true">▾</span>
            </button>
            {a ? <Detay k={k} /> : <div className="yp-ipucu" aria-hidden="true">{L('Detay için dokun', 'Tap for details')}</div>}
          </li>
        )
      })}
    </ul>
  )
}

const YENI_SIMGE: Record<YapiId, string> = { arasta: '🏪', bedesten: '🏛️', evler: '🏘️', degirmen: '⚙️', kumbet: '🕌', kopru: '🌉', kervan: '🐪', mektep: '📖', asevi: '🍲', cesme: '⛲', medrese: '📚', cami: '🕌' }

export function Yapilar() {
  const [acik, setAcik] = useState<string | null>(null)
  const R = S.MULKLER
  const u = (q: number) => L(String(q).replace('.', ','), String(q))
  const yz = (q: number) => L(`%${Math.round(q * 100)}`, `${Math.round(q * 100)}%`)
  const mulkler: Kart[] = [
    {
      id: 'hamam', ad: L('Hamam', 'Bathhouse'), resim: resim('hamam'), metin: L('En çok kazandıran mülk.', 'The property that earns the most.'),
      artilar: [L('Kazanç: çok', 'Earns: a lot'), L('Bakım: orta', 'Upkeep: medium')], dikkat: L('Depremde yıkılır', 'Falls in earthquakes'),
      ozellik: [
        L(`Her birim (1 akçe) 10 yılda ${u(R.hamam.gelir)} akçe getirir, ${u(R.hamam.bakim)} akçe bakım ister.`, `Each unit (1 akçe) earns ${u(R.hamam.gelir)} akçe per 10 years and costs ${u(R.hamam.bakim)} akçe in upkeep.`),
        L(`Depremde ${yz(S.DEPREM_HAMAM)}'i yıkılır; yıkılan kısım fonla ya da nakitle onarılır.`, `In an earthquake ${yz(S.DEPREM_HAMAM)} of it collapses; the damage is repaired with the fund or with cash.`),
        L('En çok kazandıran mülktür; bu yüzden en riskli olanıdır.', 'It is the property that earns the most, and so the riskiest one.'),
      ],
      tarih: L('Vakıf hamamları kiraya verilir, geliri cami ve medrese gibi hayır kurumlarının masrafına gider. Böyle gelir getiren mülke akar denir.', 'Foundation bathhouses were rented out and their income paid for charities such as mosques and madrasas. A property that earns income like this is called an akar.'),
      ilham: ILHAM.hamam, turler: ['hamam'],
    },
    {
      id: 'han', ad: L('Han', 'Inn'), resim: resim('han'), metin: L('Kervanların konakladığı yer. İyi kazandırır.', 'Where caravans stay. Earns well.'),
      artilar: [L('Kazanç: çok', 'Earns: a lot'), L('Bakım: az', 'Upkeep: low')], dikkat: L('Yangın, deprem, savaş', 'Fire, earthquake, war'),
      ozellik: [
        L(`Her birim 10 yılda ${u(R.han.gelir)} akçe getirir, ${u(R.han.bakim)} akçe bakım ister.`, `Each unit earns ${u(R.han.gelir)} akçe per 10 years and costs ${u(R.han.bakim)} akçe in upkeep.`),
        L(`Yangında ${yz(S.YANGIN_HAN)}'ı, depremde ${yz(S.DEPREM_HAN)}'ı yıkılır.`, `In a fire ${yz(S.YANGIN_HAN)} of it is destroyed, in an earthquake ${yz(S.DEPREM_HAN)}.`),
        L('Savaşta yol kapanır, o tur gelir gelmez. Kervan mevsiminde geliri artar.', 'In a war the road closes and no income comes that round. In caravan season its income rises.'),
      ],
      tarih: L('Han ve kervansaraylar yolcunun ve tüccarın konakladığı yerdi; kira ve konaklama geliri vakfa kalırdı.', 'Inns and caravanserais were where travellers and merchants stayed; the rent and lodging income went to the foundation.'),
      ilham: ILHAM.han, turler: ['han', 'bedesten-carsi'],
    },
    {
      id: 'arazi', ad: L('Arazi', 'Farmland'), resim: resim('arazi'), metin: L('Az kazandırır ama hiç yıkılmaz. Kötü günde vakfı ayakta tutar.', 'Earns little but never falls. Keeps the foundation going on bad days.'),
      artilar: [L('Kazanç: az', 'Earns: little'), L('Bakım: yok', 'Upkeep: none')], dikkat: L('Kuraklıkta ürün vermez', 'No crops in a drought'),
      ozellik: [
        L(`Her birim 10 yılda ${u(R.arazi.gelir)} akçe getirir; bakım istemez.`, `Each unit earns ${u(R.arazi.gelir)} akçe per 10 years and needs no upkeep.`),
        L('Hiçbir felakette yıkılmaz. Kötü günde vakfı ayakta tutan mülktür.', 'It never collapses in any disaster. It is the property that keeps the foundation standing on bad days.'),
        L('Kuraklıkta o tur ürün vermez. Bereketli yılda geliri artar.', 'In a drought it yields nothing that round. In a bountiful year its income rises.'),
      ],
      tarih: L('Tarla, bağ ve bahçeler vakıflara sık bağışlanan mallardandı.', 'Fields, vineyards and gardens were among the goods often donated to foundations.'),
      ilhamYok: L('Arazi bir yapı değil, bir toprak. Bu yüzden envanterde ilham aldığımız tek bir eser yok.', 'Farmland is land, not a building, so there is no single monument in the inventory that inspired it.'),
      turler: ['diger'], sec: /arazi|tarla|bahce|bag-|zeytin|ciftlik|mezra/i,
    },
    {
      id: 'nakit', ad: L('Nakit', 'Cash'), simge: '🪙', metin: L('Para kazandırmaz. Felakette onarım için elde tutulur.', 'Earns nothing. Kept at hand for repairs after a disaster.'),
      artilar: [L('Onarıma yedek', 'Kept for repairs')], dikkat: L('Enflasyonda erir', 'Melts in inflation'),
      ozellik: [
        L('Doğrudan gelir getirmez; elde tutulur.', 'It does not earn directly; you keep it in hand.'),
        L('“Nakitle onar” dersen, nakdin yettiği kadarı onarılır, gerisi kaybolur.', 'If you choose “Repair with cash”, it repairs what the cash can cover and the rest is lost.'),
        L('Enflasyonda değeri erir.', 'It melts in inflation.'),
      ],
      ilhamYok: L('Nakit bir yapı değil. Envanterde ilham aldığımız bir eser yok.', 'Cash is not a building. There is no monument in the inventory that inspired it.'),
    },
    {
      id: 'sandik', ad: L('Vakıf sandığı', 'Foundation chest'), resim: resim('sandik'), metin: L('Bütün gelir buraya girer. Buradan önce yedek fona pay ayrılır, sonra bakım ve hizmet ödenir.', 'All income comes in here. First a share goes to the reserve fund, then upkeep and the service are paid.'),
      artilar: [L('Paranın toplandığı yer', 'Where the money collects')],
      ozellik: [
        L('Bütün gelir önce buraya girer.', 'All income comes in here first.'),
        L('Her tur sırasıyla: yedek fona pay, bina bakımı, hizmetin gideri ödenir.', 'Every round, in order: the reserve fund share, building upkeep and the service cost are paid.'),
        L('Sandık hizmeti ödeyemezse hizmet kapanır. Artan para yapı parasında birikir.', 'If the chest cannot pay for the service, it closes. Any surplus collects as building money.'),
      ],
      ilhamYok: L('Sandık oyunun paranın toplandığı yeri; gerçek bir yapıya değil, vakıf mantığına dayanır.', 'The chest is the game’s place where money collects; it follows foundation logic, not a real building.'),
    },
  ]

  const HAYRAT: Record<AmacId, [string, string, string]> = {
    asevi: ['asevi', 'Yoksullara ve yolculara yemek verir.', 'Feeds the poor and travellers.'],
    medrese: ['medrese', 'Öğrencilere ders ve yatak verir.', 'Gives students lessons and a bed.'],
    cami: ['cami', 'İmam, müezzin ve temizlik giderini karşılar.', 'Pays for the imam, the muezzin and cleaning.'],
    cesme: ['cesme', 'Mahalleye temiz su verir. En ucuz hizmet.', 'Gives the neighbourhood clean water. The cheapest service.'],
  }
  const hayratlar: Kart[] = (Object.keys(HAYRAT) as AmacId[]).map((id) => ({
    id,
    ad: S.AMACLAR[id].ad,
    resim: resim(HAYRAT[id][0]),
    metin: L(HAYRAT[id][1], HAYRAT[id][2]),
    artilar: [L(`Her 10 yılda ${S.AMACLAR[id].gider} akçe ister`, `Needs ${S.AMACLAR[id].gider} akçe every 10 years`)],
    ozellik: [
      L(`Her 10 yılda ${S.AMACLAR[id].gider} akçe gider ister.`, `It needs ${S.AMACLAR[id].gider} akçe every 10 years.`),
      L(`Binasının bakımı için giderin ${yz(S.HAYRAT_BAKIM_ORANI)}'i ayrıca ödenir.`, `${yz(S.HAYRAT_BAKIM_ORANI)} of the cost is paid on top for the building’s upkeep.`),
      L('Sandıkta para yoksa hizmet kapanır; hizmet gelirini aşarsa vakıf zor durumda kalır.', 'If the chest has no money the service closes; if the service outgrows the income, the foundation is in trouble.'),
    ],
    ilham: ILHAM[id],
    turler: id === 'asevi' ? ['imaret', 'kulliye'] : id === 'medrese' ? ['medrese'] : id === 'cami' ? ['cami'] : ['cesme', 'sebil'],
  }))

  const bolgesi = (y: YapiId) => {
    const a = Object.values(ARSALAR).find((x) => x.izin.includes(y))
    return a ? BOLGELER[a.bolge] : null
  }
  // Envanterde türü "diger" olan yapılarda örnekler kimliğe göre süzülür (yanlış eser karışmasın).
  const ORNEK_TUR: Partial<Record<YapiId, { turler: string[]; sec?: RegExp }>> = {
    arasta: { turler: ['han', 'bedesten-carsi'] },
    bedesten: { turler: ['han', 'bedesten-carsi'] },
    kumbet: { turler: ['turbe'] },
    kervan: { turler: ['han'] },
    mektep: { turler: ['mescit'] },
    evler: { turler: ['diger'], sec: /konut|-evi|evleri|hane/i },
    degirmen: { turler: ['diger'], sec: /degirmen/i },
    kopru: { turler: ['diger'], sec: /kopru/i },
  }
  const yeniler: Kart[] = (Object.keys(YAPILAR) as YapiId[]).map((id) => {
    const t = YAPILAR[id]
    const b = bolgesi(id)
    return {
      id,
      ad: t.ad,
      simge: YENI_SIMGE[id],
      metin: t.etki,
      artilar: [
        L(`${t.maliyet} akçe`, `${t.maliyet} akçe`),
        ...(t.gelir > 0 ? [id === 'kumbet' ? L(`+${t.gelir} bağış`, `+${t.gelir} donations`) : L(`+${t.gelir} kira`, `+${t.gelir} rent`)] : []),
        ...(b ? [L(`${b.ad}: ${b.yil}. yılda açılır`, `${b.ad}: opens in year ${b.yil}`)] : []),
      ],
      dikkat: t.olay === L('Olaylardan etkilenmez.', 'Not affected by events.') ? undefined : t.olay.replace(/\.$/, ''),
      ozellik: [
        t.etki,
        L(`${t.maliyet} akçe yapı parasıyla kurulur; 10 yılda ${u(t.bakim)} akçe bakım ister.`, `Built with ${t.maliyet} akçe of building money; costs ${u(t.bakim)} akçe in upkeep per 10 years.`),
        ...(t.gelir > 0 ? [id === 'kumbet' ? L(`Her tur ${t.gelir} akçe bağış getirir.`, `Brings ${t.gelir} akçe in donations every round.`) : L(`Her tur ${t.gelir} akçe kira getirir.`, `Brings ${t.gelir} akçe in rent every round.`)] : []),
        t.olay,
        ...(t.tek ? [L('Şehirde yalnızca bir tane kurulabilir.', 'Only one can be built in the city.')] : []),
        ...(t.gerek ? [L(`Önce ${YAPILAR[t.gerek].ad.toLocaleLowerCase('tr')} kurulmalı.`, `A ${YAPILAR[t.gerek].ad.toLocaleLowerCase('en')} must be built first.`)] : []),
      ],
      ilham: YAPI_ILHAM[id],
      ilhamYok: L('Bu yapıyı oyunun kendi kurgusundan ekledik; envanterde ilham aldığımız tek bir eser yok.', 'We added this building from the game’s own design; there is no single monument in the inventory that inspired it.'),
      ...ORNEK_TUR[id],
    }
  })

  return (
    <div className="yp">
      <section>
        <h2 className="baslik bolum">{L('Başlangıç mülkleri', 'Starting properties')}</h2>
        <p className="yp-giris">{L('Kurulumda 100 akçeyi bunlara dağıtırsın. Gelir getiren mülklere akar denir. Bir karta dokun: özelliklerini, ilham aldığımız gerçek eseri ve benzer örnekleri gör.', 'At setup you split 100 akçe among these. Income-earning properties are called akar. Tap a card to see how it works, the real monument that inspired it and similar examples.')}</p>
        <Kartlar kartlar={mulkler} acik={acik} onSec={setAcik} />
      </section>
      <section>
        <h2 className="baslik bolum">{L('Hizmetler (hayrat)', 'Services (hayrat)')}</h2>
        <p className="yp-giris">{L('Vakfının yaşattığı hizmet. Kurulumda birini seçersin; parası ödenemezse kapanır.', 'The service your foundation keeps alive. You pick one at setup; if it cannot be paid for, it closes.')}</p>
        <Kartlar kartlar={hayratlar} acik={acik} onSec={setAcik} />
      </section>
      <section>
        <h2 className="baslik bolum">{L('Yeni yapılar', 'New buildings')}</h2>
        <p className="yp-giris">{L('Yapı parasıyla kurulur. “Şehri gör”e bas, sarı + işaretli arsaya dokun. Pasaportuna pul alırsan bölgeler daha erken açılır.', 'Built with building money. Press “See the city” and tap a plot with a yellow +. Passport stamps open the areas sooner.')}</p>
        <Kartlar kartlar={yeniler} acik={acik} onSec={setAcik} />
      </section>
    </div>
  )
}
