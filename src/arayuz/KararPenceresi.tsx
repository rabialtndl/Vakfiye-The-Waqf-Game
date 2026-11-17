import { useEffect, useRef } from 'react'
import { secenekler, type Durum, type Secim } from '../motor/motor'
import { SABITLER as S } from '../motor/sabitler'
import { tam } from './metin'
import { L } from '../dil'

type Props = { durum: Durum; onSec: (s: Secim) => void; ipucu: boolean; onMudahale?: (() => void) | null }

/** Deprem ya da yangında oyun durur; oyuncu hasarı nasıl karşılayacağını seçer. */
export function KararPenceresi({ durum, onSec, ipucu, onMudahale }: Props) {
  const k = durum.bekleyenKarar!
  const ilkAcik = useRef<HTMLButtonElement>(null)
  useEffect(() => ilkAcik.current?.focus(), [])

  const ss = secenekler(durum)
  const acik = (s: Secim) => ss.find((x) => x.secim === s)!
  const hayrat = S.AMACLAR[durum.ayarlar.amac].ad.toLocaleLowerCase(L('tr', 'en'))

  const hasarMetni = [
    k.hasarHamam > 0 && L(`hamamdan ${k.hasarHamam}`, `${k.hasarHamam} of the bathhouse`),
    k.hasarHan > 0 && L(`handan ${k.hasarHan}`, `${k.hasarHan} of the inn`),
  ].filter(Boolean).join(', ')

  // Nakitle onarımda kaç birim kurtulur, gelir ne olur? Önizleme motor kuralıyla aynı.
  const harcanan = Math.min(durum.nakit, k.bedel)
  const oran = harcanan / k.bedel
  const yeniHamam = Math.floor(durum.mulk.hamam - k.hasarHamam + k.hasarHamam * oran)
  const yeniHan = Math.floor(durum.mulk.han - k.hasarHan + k.hasarHan * oran)
  const kayip = durum.mulk.hamam - yeniHamam + (durum.mulk.han - yeniHan)
  const toplamHasarYarisi = (k.hasarHamam + k.hasarHan) / 2

  // Pencere açılınca odak ilk açık seçeneğe gider.
  const ilk = (['fon', 'nakit', 'kis'] as Secim[]).find((s) => acik(s).acik)
  const ref = (s: Secim) => (s === ilk ? ilkAcik : undefined)

  // Kolay modda ya da ipuçları açıkken: hangi seçeneğin neden mantıklı olduğu, tek cümle.
  const ipucuMetni = acik('fon').acik
    ? L('Fon yetiyorsa onarmak çoğu zaman en iyisidir: gelirin hiç düşmez.', 'If the fund is enough, repairing is usually best: your income does not drop at all.')
    : kayip <= toplamHasarYarisi
      ? L('Nakit hasarın çoğunu kurtarıyor; kaybın az olur.', 'Cash saves most of the damage; your loss will be small.')
      : L('Nakit yetmiyor. Kısmak para harcatmaz ama binaların bir kısmı kalıcı gider.', 'Cash is not enough. Cutting back costs nothing, but part of the buildings is lost for good.')

  // Kolay modda ya da ipuçları açıkken önerilen seçenek rozetle işaretlenir.
  const onerilen: Secim = acik('fon').acik ? 'fon' : acik('nakit').acik && kayip <= toplamHasarYarisi ? 'nakit' : 'kis'
  const rozet = (s: Secim) => ipucu && onerilen === s && <span className="oneri-rozeti">{L('Önerilen', 'Recommended')}</span>

  return (
    <div className="ortala">
      <section className="ahsap-panel karar" role="dialog" aria-modal="true" aria-labelledby="karar-baslik">
        <h2 id="karar-baslik" className="kurdele kirmizi baslik golgeli">{k.olay === 'deprem' ? L('DEPREM!', 'EARTHQUAKE!') : L('ÇARŞIDA YANGIN!', 'FIRE IN THE BAZAAR!')}</h2>
        <div className="ozet">
          <span style={{ color: 'var(--tugla)' }}>{L(`${durum.yil}. yıl`, `Year ${durum.yil}`)}</span> · {L(`${hasarMetni} birim yıkıldı`, `${hasarMetni} units destroyed`)}
          {k.mudahale && <> · <span className="mudahale-yapildi">{L('müdahale edildi, hasar azaldı ✓', 'responded, damage reduced ✓')}</span></>}
        </div>
        {onMudahale && !k.mudahale && (
          <button className="mudahale-dugmesi" onClick={onMudahale}>
            <span className="mud-simge" aria-hidden="true">{k.olay === 'yangin' ? '🚒' : '⛑️'}</span>
            <span>
              <b className="baslik">{k.olay === 'yangin' ? L('Yangına koş', 'Run to the fire') : L('Enkaza koş', 'Run to the rubble')}</b>
              <span className="kucuk">{L('20 saniyelik müdahale: iyi iş çıkarırsan hasar %50’ye kadar azalır', '20-second response: do well and damage drops by up to 50%')}</span>
            </span>
          </button>
        )}

        <div className="secenekler">
          <div className={`kart secenek ${acik('fon').acik ? '' : 'pasif'}`} data-ogretici="karar">
            {rozet('fon')}
            {acik('fon').acik ? (
              <button ref={ref('fon')} className="dugme turkuaz baslik" onClick={() => onSec('fon')}>{L('FONLA ONAR', 'REPAIR WITH FUND')}</button>
            ) : (
              <>
                <div className="ad baslik">{L('Yedek fonu kullan', 'Use the reserve fund')}</div>
                <div className="neden" aria-disabled="true">{acik('fon').neden}</div>
              </>
            )}
            <p className="kisa">{L('Gelir düşmez', 'Income does not drop')}<br />{L('Fon', 'Fund')} {tam(durum.fon)} → {tam(Math.max(0, durum.fon - k.bedel))}</p>
          </div>
          <div className={`kart secenek ${acik('nakit').acik ? '' : 'pasif'}`}>
            {rozet('nakit')}
            {acik('nakit').acik ? (
              <button ref={ref('nakit')} className="dugme altin baslik" onClick={() => onSec('nakit')}>{tam(harcanan)} {L('NAKİT', 'CASH')}</button>
            ) : (
              <>
                <div className="ad baslik">{L('Nakitle onar', 'Repair with cash')}</div>
                <div className="neden" aria-disabled="true">{acik('nakit').neden}</div>
              </>
            )}
            <p className="kisa">
              {kayip > 0 ? L(`${kayip} birim kalıcı kayıp`, `${kayip} units lost for good`) : L('Hasar tamamen onarılır', 'All the damage is repaired')}
              <br />{L('Nakit', 'Cash')} {tam(durum.nakit)} → {tam(durum.nakit - harcanan)}
            </p>
          </div>
          <div className="kart secenek">
            {rozet('kis')}
            <button ref={ref('kis')} className="dugme krem baslik" onClick={() => onSec('kis')}>{L('HİZMETİ KIS', 'CUT BACK')}</button>
            <p className="kisa">
              {L('Para harcanmaz', 'No money is spent')}
              <br />{L(`Hasarın %${S.KIS_GERI_ORAN * 100}'i ${S.KIS_GERI_GELIS_TUR} turda geri gelir, ${hayrat} ${S.KIS_HIZMET_TUR} tur yarım çalışır`, `${S.KIS_GERI_ORAN * 100}% comes back over ${S.KIS_GERI_GELIS_TUR} rounds; the ${hayrat} works at half capacity for ${S.KIS_HIZMET_TUR} rounds`)}
            </p>
          </div>
        </div>

        {ipucu && <p className="karar-ipucu">{ipucuMetni}</p>}
      </section>
    </div>
  )
}
