import { ESNAF_HIKAYELERI } from '../esnaf'
import type { Durum } from '../motor/motor'
import { ARSALAR, BOLGELER, bolgeAcik, insaKontrol, sehirTuru, YAPILAR, type ArsaId, type BolgeId, type YapiId } from '../motor/sehir'
import { eserAc, ortam } from '../ortam'
import { IlhamKarti, useEserler } from './GercekEserler'
import { Ikon } from './Ikon'
import { YAPI_ILHAM } from './ilham'
import { tam } from './metin'
import { iki, L } from '../dil'

const TUR_AD: Record<'akar' | 'destek' | 'hayrat', string> = iki({ akar: 'Gelir getirir', destek: 'Destek', hayrat: 'Hizmet' }, { akar: 'Earns income', destek: 'Support', hayrat: 'Service' })

/** Arsaya dokununca açılan panel: boşsa kurulabilecek yapılar, doluysa yapının ne yaptığı ve gerçek örneği. */
export function ArsaPaneli({ durum: d, arsa, pulSayisi, onInsa }: { durum: Durum; arsa: ArsaId; pulSayisi: number; onInsa: (a: ArsaId, y: YapiId) => void }) {
  const a = ARSALAR[arsa]
  const yapi = d.yapilar[arsa]
  if (yapi) {
    const t = YAPILAR[yapi]
    const kira = sehirTuru(d.yapilar, null, 0, 0).ayrinti[arsa] ?? t.gelir
    const ilham = YAPI_ILHAM[yapi]
    return (
      <section className="bina-paneli genis" aria-live="polite" aria-label={t.ad}>
        <div className="bina-ust">
          <div className="simge" aria-hidden="true"><Ikon ad="insa" boyut={34} renk="#7A5E34" /></div>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
              <h2 className="baslik">{t.ad}</h2>
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--kahve)' }}>{a.ad}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span className="cip" style={{ background: 'var(--parsomen-koyu)' }}>{TUR_AD[t.tur]}</span>
              {t.gelir > 0 && <span className="cip" style={{ background: 'var(--altin)', color: '#3A2205' }}>{L(`Kira ${tam(kira)} / 10 yıl`, `Rent ${tam(kira)} / 10 yrs`)}</span>}
              <span className="cip" style={{ background: 'var(--parsomen-koyu)' }}>{L('Bakım', 'Upkeep')} {L(String(t.bakim).replace('.', ','), String(t.bakim))}</span>
            </div>
            <p>{t.etki}</p>
            <p style={{ color: 'var(--tugla)' }}>{t.olay}</p>
          </div>
        </div>
        <YapiNedir yapi={yapi} />
        {ilham ? <IlhamKarti ilham={ilham} /> : <p className="kucuk">{L('Envanterde bu türden bir eser henüz yok.', 'The inventory has no monument of this kind yet.')}</p>}
      </section>
    )
  }

  const acik = bolgeAcik(a.bolge, d.yil, pulSayisi)
  return (
    <section className="bina-paneli genis" aria-live="polite" aria-label={L(`${a.ad}: boş arsa`, `${a.ad}: empty plot`)}>
      <div className="bina-ust">
        <div className="simge" aria-hidden="true"><Ikon ad="insa" boyut={34} renk="#7A5E34" /></div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <h2 className="baslik">{L('Boş arsa', 'Empty plot')}</h2>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--kahve)' }}>{a.ad}</span>
          </div>
          {L(
            <p>
              Hizmetten artan para <b>yapı parasında</b> birikir: şu an <b>{tam(d.artan)} akçe</b>. {acik ? 'Bir yapı seç ve kur.' : ''}
            </p>,
            <p>
              Money left over after the service collects as <b>building money</b>: right now <b>{tam(d.artan)} akçe</b>. {acik ? 'Choose a building and build it.' : ''}
            </p>,
          )}
        </div>
      </div>
      {a.izin.map((y) => <YapiNedir key={y} yapi={y} />)}
      <ul className="insa-listesi">
        {a.izin.map((y) => (
          <InsaSecenegi key={y} durum={d} arsa={arsa} yapi={y} pulSayisi={pulSayisi} onInsa={onInsa} />
        ))}
      </ul>
    </section>
  )
}

function InsaSecenegi({ durum: d, arsa, yapi, pulSayisi, onInsa }: { durum: Durum; arsa: ArsaId; yapi: YapiId; pulSayisi: number; onInsa: (a: ArsaId, y: YapiId) => void }) {
  const t = YAPILAR[yapi]
  const k = insaKontrol(d, arsa, yapi, pulSayisi)
  const ilham = YAPI_ILHAM[yapi]
  const eserler = useEserler(ilham ? [ilham.tur] : [])
  const e = ilham ? eserler?.find((x) => x.id === ilham.id) : undefined
  const foto = e ? (e.gorseller?.[(ilham?.foto ?? 1) - 1] ?? e.gorsel) : undefined
  return (
    <li className={`insa-secenegi ${k.olur ? '' : 'kapali'}`}>
      <span className="insa-foto" aria-hidden="true">
        {foto ? <img src={foto} alt="" loading="lazy" /> : <Ikon ad="insa" boyut={28} renk="#9C7C50" />}
      </span>
      <span className="insa-metin">
        <span className="insa-ust">
          <b className="baslik">{t.ad}</b>
          <span className="cip" style={{ background: 'var(--parsomen-koyu)' }}>{TUR_AD[t.tur]}</span>
        </span>
        <span>{t.etki}</span>
        <span className="insa-alt">
          {t.gelir > 0 && <span className="cip" style={{ background: 'var(--altin)', color: '#3A2205' }}>+{t.gelir} {L('kira', 'rent')}</span>}
          <span className="cip" style={{ background: 'var(--parsomen-koyu)' }}>{L('Bakım', 'Upkeep')} {L(String(t.bakim).replace('.', ','), String(t.bakim))}</span>
          {e && (
            <button className="bag" onClick={() => eserAc(e.id)}>
              {L('Gerçeği', 'The real one')}: {e.ad} →
            </button>
          )}
        </span>
        {!k.olur && <span className="insa-neden">{k.neden}</span>}
      </span>
      <button className="dugme yesil baslik insa-dugmesi" disabled={!k.olur} onClick={() => onInsa(arsa, yapi)}>
        {L('Kur', 'Build')}
        <small>{L(`${t.maliyet} akçe yapı parasından`, `${t.maliyet} akçe from building money`)}</small>
      </button>
    </li>
  )
}

/** Keşif görevleri: gerçek hayatta pasaporta pul aldıkça şehrin bölgeleri erken açılır. */
export function KesifPaneli({ durum: d, pulSayisi, onKapat }: { durum: Durum; pulSayisi: number; onKapat: () => void }) {
  const pasaportVar = !!ortam.araclar.pullar
  const bagis = Math.min(30, pulSayisi * 5)
  return (
    <div className="ortala" onClick={(e) => e.stopPropagation()}>
      <section className="ahsap-panel bilgi-paneli" aria-labelledby="kesif-baslik">
        <h1 id="kesif-baslik" className="kurdele yesil baslik golgeli">{L('KEŞİF GÖREVLERİ', 'EXPLORATION QUESTS')}</h1>
        <button className="kapat-dugmesi" aria-label={L('Kapat', 'Close')} onClick={onKapat}>✕</button>
        <p className="ayar-aciklama" style={{ margin: '0 0 8px', maxWidth: 'none' }}>
          {L(
            `Şehrin bölgeleri yüzyıllar geçtikçe kendiliğinden açılır. Gerçek bir vakıf eserini gezip${pasaportVar ? ' pasaportuna pul alırsan' : ' Vakfiye pasaportuna pul alırsan'} beklemeden açılır. Her pul yeni vakfına 5 akçe bağışlar (en çok 30).`,
            `The city’s areas open by themselves as the centuries pass. Visit a real foundation monument and collect a stamp in your${pasaportVar ? '' : ' Vakfiye'} passport, and they open without waiting. Each stamp gives your new foundation 5 akçe (up to 30).`,
          )}
        </p>
        <div className="kesif-ozet">
          <span className="baslik">{pulSayisi} {L('pul', pulSayisi === 1 ? 'stamp' : 'stamps')}</span>
          <span className="kucuk">{pulSayisi > 0 ? L(`Bu oyunda yapı parana ${bagis} akçe bağış geldi.`, `This game your fund received a ${bagis} akçe gift.`) : pasaportVar ? L('Henüz pulun yok. Rotadaki bir eserin QR kodunu okut.', 'You have no stamps yet. Scan the QR code of a monument on the route.') : L('Pasaport, Vakfiye uygulamasında ve web sitesinde.', 'The passport is in the Vakfiye app and on the website.')}</span>
        </div>
        <ul className="kesif-listesi">
          {(Object.keys(BOLGELER) as BolgeId[]).map((b) => {
            const t = BOLGELER[b]
            const acik = bolgeAcik(b, d.yil, pulSayisi)
            const neden = acik ? (t.yil === 0 ? L('baştan açık', 'open from the start') : d.yil >= t.yil ? L(`${t.yil}. yıla geldin`, `you reached year ${t.yil}`) : L(`${t.pul} pulla açtın`, `opened with ${t.pul} stamps`)) : L(`${t.yil}. yılda ya da ${t.pul} pulla`, `in year ${t.yil} or with ${t.pul} stamps`)
            return (
              <li key={b} className={acik ? 'acik' : ''}>
                <span className="kesif-durum" aria-hidden="true">{acik ? '✓' : <Ikon ad="kesif" boyut={20} renk="#7A4A22" />}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <b className="baslik">{t.ad}</b>
                  <span className="kucuk" style={{ display: 'block' }}>{BOLGE_ACIKLAMA[b]}</span>
                </span>
                <span className="kesif-neden">
                  {neden}
                  {!acik && (
                    <span className="seviye-cubuk" style={{ width: 90 }}>
                      <span style={{ display: 'block', height: '100%', background: 'var(--altin)', width: `${Math.min(100, (100 * pulSayisi) / t.pul)}%` }} />
                    </span>
                  )}
                </span>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}

const BOLGE_ACIKLAMA: Record<BolgeId, string> = iki<Record<BolgeId, string>>({
  carsi: 'Arasta ve bedesten: esnaf kira öder.',
  mahalle: 'Vakıf evleri, sıbyan mektebi, ek hizmet binaları.',
  koyler: 'Nehrin öbür yakası: köprü ve değirmen.',
  yol: 'Kervansaray: kervanı şehre çeker.',
}, {
  carsi: 'Arasta and bedesten: tradesmen pay rent.',
  mahalle: 'Foundation houses, primary school, extra service buildings.',
  koyler: 'Across the river: bridge and mill.',
  yol: 'Caravanserai: draws caravans to the city.',
})

/** "Kümbet nedir?" gibi: yapının kaynaklı tanımı (şehrin bilgi yerlerinden). */
function YapiNedir({ yapi }: { yapi: YapiId }) {
  const h = ESNAF_HIKAYELERI.find((x) => x.id === yapi)
  if (!h) return null
  return (
    <details className="yapi-nedir">
      <summary className="baslik">{h.baslik}</summary>
      <p>{h.metin}</p>
    </details>
  )
}
