import { useMemo, useState } from 'react'
import { ayaktaKalmaSansi, kurulumGecerli, olaysizGelir, sermayeToplami, varsayilanAyarlar, type Ayarlar, type Sermaye } from '../motor/motor'
import { SABITLER as S, type AmacId, type MutevelliId } from '../motor/sabitler'
import { useEserler } from './GercekEserler'
import { ILHAM } from './ilham'
import { Ikon } from './Ikon'
import { MULK_BILGI, tam } from './metin'
import { levelBul } from '../leveller'
import { L } from '../dil'

type Sekme = 'sermaye' | 'amac' | 'fon' | 'mutevelli'

type Props = { ayarlar: Ayarlar; pulSayisi?: number; onDegis: (a: Ayarlar) => void; onKur: () => void; onGeri: () => void }

const MULK_IKON = { hamam: 'hamam', han: 'han', arazi: 'arazi', nakit: 'nakit' } as const

export function Kurulum({ ayarlar, pulSayisi = 0, onDegis, onKur, onGeri }: Props) {
  const [sekme, setSekme] = useState<Sekme>('sermaye')
  const toplam = sermayeToplami(ayarlar.sermaye)
  const gecerli = kurulumGecerli(ayarlar)
  const amac = S.AMACLAR[ayarlar.amac]
  // Bu ayarlarla akıllı oynayan bir oyuncunun ayakta kalma şansı: 300 oyun, tarayıcıda anında.
  const { sermaye, yedekFonOrani, mutevelli, zorluk, hedefYil, levelNo } = ayarlar
  const level = levelBul(levelNo)
  const sans = useMemo(
    () => (gecerli ? ayaktaKalmaSansi({ sermaye, amac: ayarlar.amac, yedekFonOrani, mutevelli, zorluk, hedefYil, tohum: 1 }) : null),
    [gecerli, sermaye, ayarlar.amac, yedekFonOrani, mutevelli, zorluk, hedefYil],
  )
  const sansEtiketi = sans === null ? '' : sans >= 70 ? L('Güvenli', 'Safe') : sans >= 50 ? L('Dengeli', 'Balanced') : sans >= 30 ? L('Riskli', 'Risky') : L('Çok riskli', 'Very risky')
  const sansRengi = sans === null ? '#999' : sans >= 70 ? 'var(--yesil)' : sans >= 50 ? 'var(--altin-koyu)' : 'var(--tugla)'

  const sermayeDegis = (k: keyof Sermaye, fark: number) => {
    const yeni = Math.max(0, Math.min(100, ayarlar.sermaye[k] + fark))
    onDegis({ ...ayarlar, sermaye: { ...ayarlar.sermaye, [k]: yeni } })
  }

  const sekmeler: { id: Sekme; ad: string; ozet: string }[] = [
    { id: 'sermaye', ad: L('1 · Sermaye', '1 · Capital'), ozet: L(`${toplam} / 100 akçe`, `${toplam} / 100 akçe`) },
    { id: 'amac', ad: L('2 · Hizmet', '2 · Service'), ozet: amac.ad },
    { id: 'fon', ad: L('3 · Yedek fon', '3 · Fund'), ozet: L(`Gelirin %${ayarlar.yedekFonOrani}'i`, `${ayarlar.yedekFonOrani}% of income`) },
    { id: 'mutevelli', ad: L('4 · Mütevelli', '4 · Trustee'), ozet: ayarlar.mutevelli === 'durust' ? L('Dürüst', 'Honest') : L('Becerikli', 'Skilled') },
  ]

  return (
    <div className="ortala">
      <section className="ahsap-panel kurulum" aria-labelledby="kurulum-baslik">
        <h1 id="kurulum-baslik" className="kurdele kirmizi baslik golgeli">{levelNo ? `LEVEL ${levelNo}` : L('VAKFINI KUR', 'FOUND YOUR WAQF')}</h1>
        <button className="kapat-dugmesi" aria-label={L('Ana menüye dön', 'Back to main menu')} onClick={onGeri}>✕</button>

        <div className="sekmeler" role="tablist" aria-label={L('Kurulum adımları', 'Setup steps')}>
          {sekmeler.map((s) => (
            <button key={s.id} role="tab" aria-selected={sekme === s.id} className="sekme" onClick={() => setSekme(s.id)}>
              <span className="baslik">{s.ad}</span>
              <small>{s.ozet}</small>
            </button>
          ))}
        </div>

        <div className="icerik" role="tabpanel">
          {levelNo ? <p className="level-gorev"><span><b>{L('Hedef:', 'Goal:')}</b> {L(`${level.hedefYil} yıl ayakta kal${level.yapiHedefi ? `, ${level.yapiHedefi} yeni yapı kur` : ''}.`, `Stand for ${level.hedefYil} years${level.yapiHedefi ? ` and build ${level.yapiHedefi} new building${level.yapiHedefi > 1 ? 's' : ''}` : ''}.`)}</span></p> : null}
          {sekme === 'sermaye' && (
            <>
              <div className="ipucu" style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                <span>{L('100 akçeyi dörde paylaştır. Çok kazandıran mülk daha kolay yıkılır.', 'Split 100 akçe four ways. The properties that earn more collapse more easily.')}</span>
                <button className="bag" onClick={() => onDegis({ ...ayarlar, sermaye: { ...varsayilanAyarlar().sermaye } })}>{L('Dengeli dağıt', 'Spread evenly')}</button>
              </div>
              <div className="kartlar" data-ogretici="sermaye">
                {(Object.keys(MULK_BILGI) as (keyof Sermaye)[]).map((k) => {
                  const b = MULK_BILGI[k]
                  const deger = ayarlar.sermaye[k]
                  return (
                    <div key={k} className="kart mulk-karti">
                      <div className="resim" aria-hidden="true"><Ikon ad={MULK_IKON[k]} boyut={34} renk="#7A5E34" /></div>
                      <div className="ad baslik">{b.ad}</div>
                      <dl className="bilgi">
                        <div><dt>{L('Kazanç', 'Earnings')}</dt><dd>{b.kazanc}</dd></div>
                        <div><dt>{L('Bakım', 'Upkeep')}</dt><dd>{b.bakim}</dd></div>
                        <div className={b.iyi ? 'iyi' : 'tehlike'}><dt>{L('Tehlike', 'Danger')}</dt><dd>{b.tehlike}</dd></div>
                      </dl>
                      <div className="adim">
                        <button className="eksi" aria-label={L(`${b.ad} ${S.SERMAYE_ADIM} azalt`, `${b.ad} minus ${S.SERMAYE_ADIM}`)} disabled={deger <= 0} onClick={() => sermayeDegis(k, -S.SERMAYE_ADIM)}>−</button>
                        <output aria-live="polite">{deger}</output>
                        <button className="arti" aria-label={L(`${b.ad} ${S.SERMAYE_ADIM} artır`, `${b.ad} plus ${S.SERMAYE_ADIM}`)} disabled={toplam >= 100} onClick={() => sermayeDegis(k, S.SERMAYE_ADIM)}>+</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {sekme === 'amac' && (
            <>
              <div className="ipucu">{levelNo ? L(`Bu levelde vakfın hizmeti belli: ${amac.ad.toLocaleLowerCase('tr')}. Serbest oyunda istediğini seçebilirsin.`, `In this level the foundation’s service is set: ${amac.ad.toLocaleLowerCase('en')}. In free play you can choose any.`) : L('Vakfın ne hizmet vereceğini seç. Büyük hizmet daha çok para ister.', 'Choose what service your foundation will give. A bigger service needs more money.')}</div>
              <div className="kartlar" role="radiogroup" aria-label={L('Vakfın amacı', 'The foundation’s purpose')}>
                {(levelNo ? [ayarlar.amac] : (Object.keys(S.AMACLAR) as AmacId[])).map((id) => (
                  <button key={id} role="radio" aria-checked={ayarlar.amac === id} className="kart secim-karti" onClick={() => onDegis({ ...ayarlar, amac: id })}>
                    <HizmetFotosu amac={id} />
                    <span className="ad baslik">{S.AMACLAR[id].ad}</span>
                    <small>{L(`Her 10 yılda ${S.AMACLAR[id].gider} akçe gider`, `Costs ${S.AMACLAR[id].gider} akçe every 10 years`)}</small>
                  </button>
                ))}
              </div>
              <div className="ipucu">{L('Enflasyon olunca bu gider kalıcı olarak biraz artar.', 'When inflation hits, this cost rises a little for good.')}</div>
            </>
          )}

          {sekme === 'fon' && (
            <>
              <div className="ipucu">{L('Her gelirden bu kadarı önce yedek fona (kumbaraya) ayrılır. Deprem, yangın gibi kötü günlerde onarımı bu para yapar.', 'This share of every income goes first to the reserve fund (the piggy bank). On bad days such as earthquakes and fires, this money pays for repairs.')}</div>
              <label className="baslik" style={{ fontSize: 28 }} htmlFor="fon-orani">{L(`%${ayarlar.yedekFonOrani}`, `${ayarlar.yedekFonOrani}%`)}</label>
              <input
                id="fon-orani"
                className="kaydirici"
                type="range"
                min={S.YEDEK_FON_MIN}
                max={S.YEDEK_FON_MAX}
                step={S.YEDEK_FON_ADIM}
                value={ayarlar.yedekFonOrani}
                onChange={(e) => onDegis({ ...ayarlar, yedekFonOrani: Number(e.target.value) })}
              />
              <div className="ipucu">{L(`Sakin bir 10 yılda fona yaklaşık ${tam((olaysizGelir(ayarlar) * ayarlar.yedekFonOrani) / 100)} akçe gider.`, `In a calm 10 years, about ${tam((olaysizGelir(ayarlar) * ayarlar.yedekFonOrani) / 100)} akçe goes to the fund.`)}</div>
            </>
          )}

          {sekme === 'mutevelli' && (
            <>
              <div className="ipucu">{L('Vakfı yönetecek kişiyi seç. Becerikli olan biraz daha çok kazandırır ama bir gün fondan para kaçırabilir.', 'Choose who will run the foundation. The skilled one earns a little more but may one day slip money out of the fund.')}</div>
              <div className="kartlar" role="radiogroup" aria-label={L('Mütevelli', 'Trustee')}>
                {(Object.keys(S.MUTEVELLI) as MutevelliId[]).map((id) => (
                  <button key={id} role="radio" aria-checked={ayarlar.mutevelli === id} className="kart secim-karti" onClick={() => onDegis({ ...ayarlar, mutevelli: id })}>
                    <span className="ad baslik">{S.MUTEVELLI[id].ad}</span>
                    <small>
                      {S.MUTEVELLI[id].zimmet
                        ? L(`Gelir %${Math.round((S.MUTEVELLI[id].gelirCarpani - 1) * 100)} fazla. Ama bazen fonun bir kısmını kaçırır.`, `Income ${Math.round((S.MUTEVELLI[id].gelirCarpani - 1) * 100)}% higher. But sometimes takes part of the fund.`)
                        : L('Normal gelir. Fona hiç dokunmaz.', 'Normal income. Never touches the fund.')}
                    </small>
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="sans" data-ogretici="sans" aria-live="polite">
            <span className="baslik">{L('Ayakta kalma şansı', 'Chance of standing')}</span>
            <div className="sans-cubuk" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={sans ?? 0} aria-label={L('Ayakta kalma şansı', 'Chance of standing')}>
              <div style={{ width: `${sans ?? 0}%`, background: sansRengi }} />
            </div>
            <span className="baslik" style={{ color: sansRengi, minWidth: 120 }}>{sans === null ? L('Toplam 100 olmalı', 'Total must be 100') : L(`%${sans} · ${sansEtiketi}`, `${sans}% · ${sansEtiketi}`)}</span>
          </div>

          <div className="alt-satir">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="toplam baslik">{L('Toplam', 'Total')} {toplam} / 100</span>
                <span className="cip" style={{ background: gecerli ? 'var(--turkuaz)' : 'var(--tugla)', color: '#fff' }}>{gecerli ? L('tamam', 'ok') : toplam > 100 ? L('fazla', 'too much') : L('eksik', 'too little')}</span>
              </div>
              <div className="ipucu">{L(`Bu dağılımla her 10 yılda yaklaşık ${tam(olaysizGelir(ayarlar))} akçe gelir.`, `With this split, about ${tam(olaysizGelir(ayarlar))} akçe comes in every 10 years.`)}</div>
              {pulSayisi > 0 && <div className="ipucu" style={{ color: 'var(--turkuaz)' }}>{L(`Pasaportundaki ${pulSayisi} pul vakfına ${Math.min(30, pulSayisi * 5)} akçe bağışladı.`, `The ${pulSayisi} stamps in your passport gave your foundation ${Math.min(30, pulSayisi * 5)} akçe.`)}</div>}
            </div>
            <button className="dugme yesil baslik" data-ogretici="kur" style={{ height: 56, fontSize: 22, minWidth: 170 }} disabled={!gecerli} onClick={onKur}>
              {L('VAKFI KUR', 'FOUND IT')}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

/** Hizmet seçeneğinde, oyundaki binanın çiziminde örnek alınan gerçek eser. */
function HizmetFotosu({ amac }: { amac: AmacId }) {
  const ilham = ILHAM[amac]
  const eserler = useEserler([ilham.tur])
  const e = eserler?.find((x) => x.id === ilham.id)
  const foto = e?.gorseller?.[ilham.foto - 1] ?? e?.gorsel
  if (!e || !foto) return <span className="hizmet-foto bos" aria-hidden="true" />
  return (
    <span className="hizmet-foto">
      <img src={foto} alt="" loading="lazy" onError={(ev) => { if (e.gorsel && ev.currentTarget.src !== e.gorsel) ev.currentTarget.src = e.gorsel }} />
      <small>{L('İlham', 'Inspired by')}: {e.ad}</small>
    </span>
  )
}
