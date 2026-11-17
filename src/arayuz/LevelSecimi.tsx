import { useState } from 'react'
import { SABITLER as S } from '../motor/sabitler'
import { eserAc } from '../ortam'
import { levelAcik, levelHedefleri, LEVELLER, SERBEST, sehirdenPul, type Level } from '../leveller'
import { EserFoto, ilAdi, useEserler } from './GercekEserler'
import { LevelHedefleri } from './LevelHedefleri'
import { L } from '../dil'

type Props = { gecilen: Record<string, number>; pullar: string[]; onSec: (l: Level) => void; onGeri: () => void }

function LevelFoto({ l }: { l: Level }) {
  const eserler = useEserler(l.eserTur ? [l.eserTur] : [])
  const e = eserler?.find((x) => x.id === l.eser)
  return e ? <EserFoto e={e} /> : <span className="foto-yok" aria-hidden="true">🕌</span>
}

/** Level yolu: 1'den 4'e sıralı duraklar. Birine dokununca o levelin brifingi açılır. */
export function LevelSecimi({ gecilen, pullar, onSec, onGeri }: Props) {
  const [secili, setSecili] = useState<Level | null>(null)
  if (secili) return <Brifing l={secili} acik={secili.no === 0 || levelAcik(secili, gecilen, pullar)} yildiz={gecilen[secili.no] ?? 0} pullar={pullar} onBasla={() => onSec(secili)} onGeri={() => setSecili(null)} />

  const siradaki = LEVELLER.find((l) => !(gecilen[l.no] > 0) && levelAcik(l, gecilen, pullar))
  return (
    <div className="ortala" onClick={(e) => e.stopPropagation()}>
      <section className="ahsap-panel level-paneli" aria-labelledby="level-baslik">
        <h1 id="level-baslik" className="kurdele yesil baslik golgeli">{L('LEVELLER', 'LEVELS')}</h1>
        <button className="kapat-dugmesi" aria-label={L('Ana menüye dön', 'Back to main menu')} onClick={onGeri}>✕</button>
        <p className="level-giris">{L('Her level gerçek bir vakfın şehri. Hedefleri tuttur, leveli geç, sıradakine geç.', 'Each level is the city of a real foundation. Meet the goals, pass the level, move on to the next.')}</p>
        <ol className="level-yolu">
          {LEVELLER.map((l) => {
            const acik = levelAcik(l, gecilen, pullar)
            const yildiz = gecilen[l.no] ?? 0
            const durum = yildiz > 0 ? 'gecildi' : acik ? 'acik' : 'kilitli'
            return (
              <li key={l.no} className={`durak ${durum} ${l === siradaki ? 'siradaki' : ''}`}>
                <button className="durak-dugmesi" onClick={() => setSecili(l)} aria-label={`Level ${l.no}: ${l.ad}. ${durum === 'gecildi' ? L(`Geçildi, ${yildiz} yıldız`, `Passed, ${yildiz} stars`) : durum === 'acik' ? L('Açık', 'Open') : L('Kilitli', 'Locked')}`}>
                  <span className="durak-no baslik" aria-hidden="true">{durum === 'kilitli' ? '🔒' : durum === 'gecildi' ? '✓' : l.no}</span>
                  <span className="durak-govde">
                    <span className="durak-ust">
                      <span className="baslik durak-ad">{l.no}. {l.ad}</span>
                      {yildiz > 0 && <span className="level-yildiz" aria-hidden="true">{'★'.repeat(yildiz)}<span className="soluk">{'★'.repeat(3 - yildiz)}</span></span>}
                    </span>
                    <span className="durak-yer">{ilAdi(l.il)} · {S.AMACLAR[l.amac!].ad}</span>
                    <span className="durak-cipler">
                      <span className="cip hedef-cip">⏳ {l.hedefYil} {L('yıl', 'years')}</span>
                      {l.yapiHedefi > 0 && <span className="cip hedef-cip">🔨 {l.yapiHedefi} {L('yapı', l.yapiHedefi > 1 ? 'buildings' : 'building')}</span>}
                      <span className="cip tehlike-cip">⚠ {l.tehlike}</span>
                    </span>
                    {durum === 'kilitli' && <span className="durak-kilit">{sehirdenPul(l.il, pullar) ? '' : L(`${l.no - 1}. leveli geçince açılır`, `Opens after you pass level ${l.no - 1}`)}</span>}
                  </span>
                  <span className="durak-ok" aria-hidden="true">{l === siradaki ? L('OYNA ›', 'PLAY ›') : '›'}</span>
                </button>
              </li>
            )
          })}
        </ol>
        <button className="serbest-dugmesi" onClick={() => setSecili(SERBEST)}>
          <span className="baslik">{L('Serbest oyun', 'Free play')}</span>
          <span className="kucuk">{L('Hizmeti sen seç, 600 yıl. Her zaman açık.', 'Choose your service, 600 years. Always open.')}</span>
        </button>
      </section>
    </div>
  )
}

/** Level başlamadan önce: ne yapacaksın, neye dikkat edeceksin, ne kazanacaksın. */
function Brifing({ l, acik, yildiz, pullar, onBasla, onGeri }: { l: Level; acik: boolean; yildiz: number; pullar: string[]; onBasla: () => void; onGeri: () => void }) {
  const serbest = l.no === 0
  return (
    <div className="ortala" onClick={(e) => e.stopPropagation()}>
      <section className="ahsap-panel brifing" aria-labelledby="brifing-baslik">
        <h1 id="brifing-baslik" className="kurdele yesil baslik golgeli">{serbest ? L('SERBEST OYUN', 'FREE PLAY') : `LEVEL ${l.no}`}</h1>
        <button className="kapat-dugmesi" aria-label={L('Levellere dön', 'Back to levels')} onClick={onGeri}>✕</button>

        {!serbest && (
          <div className="brifing-ust">
            <span className="brifing-foto"><LevelFoto l={l} /></span>
            <span className="brifing-baslik">
              <span className="baslik brifing-ad">{l.ad}</span>
              <span className="kucuk">{ilAdi(l.il)} · {S.AMACLAR[l.amac!].ad}</span>
              <span className="brifing-hikaye">{l.hikaye}</span>
            </span>
          </div>
        )}

        <div className="brifing-bolum">
          <h2 className="baslik">{L('Hedefler', 'Goals')}</h2>
          {serbest ? <p className="brifing-p">{l.hikaye} {L('Hedefe bağlı level yok, yalnızca yıldız toplarsın.', 'There are no level goals; you only collect stars.')}</p> : <LevelHedefleri hedefler={levelHedefleri(l)} />}
        </div>

        {!serbest && (
          <div className="brifing-bolum odul">
            <h2 className="baslik">{L('Ödül', 'Reward')}</h2>
            <p className="brifing-p">
              {L(<><b>{l.eserAd}</b> kartı albümüne girer{l.no < LEVELLER.length ? ` ve ${l.no + 1}. level açılır` : ''}.</>, <>The <b>{l.eserAd}</b> card goes into your album{l.no < LEVELLER.length ? ` and level ${l.no + 1} opens` : ''}.</>)}{' '}
              <button className="bag" style={{ padding: 0 }} onClick={() => eserAc(l.eser)}>{L('Eseri gör →', 'See the monument →')}</button>
            </p>
          </div>
        )}

        {acik ? (
          <button className="dugme yesil baslik buyuk-dugme" onClick={onBasla} autoFocus>{yildiz ? L('TEKRAR OYNA', 'PLAY AGAIN') : L('BAŞLA', 'START')}</button>
        ) : (
          <div className="brifing-kilit">
            <b>{L('Bu level kilitli.', 'This level is locked.')}</b> {L('Açmak için:', 'To open it:')}
            <ul>
              <li>{L(`${l.no - 1}. leveli geç, ya da`, `pass level ${l.no - 1}, or`)}</li>
              <li>{L(`${ilAdi(l.il)}’daki bir vakıf eserini gezip mobil uygulamada pasaport pulunu al${pullar.length ? '' : ' (QR’ı okut)'}.`, `visit a foundation monument in ${ilAdi(l.il)} and collect its passport stamp in the mobile app${pullar.length ? '' : ' (scan the QR code)'}.`)}</li>
            </ul>
          </div>
        )}
      </section>
    </div>
  )
}
