import { useEffect, useRef, useState } from 'react'
import { hedefYili, sonucKarti, type Durum } from '../motor/motor'
import { kartHakki } from '../albumKartlari'
import { levelBul, levelGecildi, levelHedefleri, levelYildizi } from '../leveller'
import { LevelHedefleri } from './LevelHedefleri'
import { SABITLER as S } from '../motor/sabitler'
import type { GercekEser } from '../ortam'
import { eserAc } from '../ortam'
import { binaTurleri, EserFoto, GercekEserler, ilAdi } from './GercekEserler'
import { PaylasPaneli } from './PaylasPaneli'
import { VakfiyeBelgesi } from './VakfiyeBelgesi'
import { karsilastir, type Meydan } from '../meydan'
import { L } from '../dil'

type Props = { meydan?: Meydan | null; rutbeAd?: string; durum: Durum; yeniKartlar: GercekEser[] | null; onAlbum: () => void; onYeniden: () => void; onAnaMenu: () => void; onLeveller: () => void; onSonraki: (() => void) | null }

export function Sonuc({ meydan = null, rutbeAd = '', durum, yeniKartlar, onAlbum, onYeniden, onAnaMenu, onLeveller, onSonraki }: Props) {
  const y = levelYildizi(durum)
  const k = sonucKarti(durum)
  const ayakta = durum.sonuc === 'ayakta'
  const levelNo = durum.ayarlar.levelNo
  const level = levelBul(levelNo)
  const gecti = levelGecildi(durum)
  const baslik = useRef<HTMLHeadingElement>(null)
  const [gercekAcik, setGercekAcik] = useState(false)
  const hayratAd = S.AMACLAR[durum.ayarlar.amac].ad.toLocaleLowerCase(L('tr', 'en'))
  useEffect(() => baslik.current?.focus(), [])

  const [paylasAcik, setPaylasAcik] = useState(false)
  const [vakfiyeAcik, setVakfiyeAcik] = useState(false)
  const yil = Math.min(durum.yil, hedefYili(durum.ayarlar))
  const buMeydan = meydan && meydan.l === (levelNo ?? 0) ? meydan : null
  const sonucu = buMeydan ? karsilastir(buMeydan, y, yil) : null
  const kart = {
    ayakta, levelAd: levelNo ? `Level ${levelNo} · ${level.ad}` : L('Serbest oyun', 'Free play'), yildiz: y, yil, hedefYil: hedefYili(durum.ayarlar),
    olay: durum.olaySayisi, karar: durum.kararSayisi, ders: k.ders, rutbe: rutbeAd, hayrat: S.AMACLAR[durum.ayarlar.amac].ad,
  }

  return (
    <div className="ortala">
      <section className="sonuc" aria-labelledby="sonuc-baslik">
        <h1 id="sonuc-baslik" ref={baslik} tabIndex={-1} className={`sonuc-kurdele baslik golgeli ${ayakta ? 'altin' : 'kirmizi'}`}>
          {ayakta ? L('VAKIF AYAKTA!', 'THE FOUNDATION STANDS!') : L('VAKIF ÇÖKTÜ', 'THE FOUNDATION FELL')}
        </h1>
        <div className="alt-baslik baslik golgeli">
          {ayakta ? L(`${hedefYili(durum.ayarlar)} yıl boyunca ${hayratAd} kapanmadı`, `The ${hayratAd} never closed in ${hedefYili(durum.ayarlar)} years`) : `${k.baslik}${k.cokenOlay ? L(` Son darbe: ${k.cokenOlay}`, ` Final blow: ${k.cokenOlay}`) : ''}`}
        </div>

        {buMeydan && sonucu && (
          <div className={`meydan-sonucu ${sonucu}`} role="status">
            <b className="baslik">
              {sonucu === 'kazandin' ? L('🏆 Meydan okumayı kazandın!', '🏆 You won the challenge!') : sonucu === 'berabere' ? L('🤝 Berabere!', '🤝 A draw!') : L('Meydan okumayı bu sefer kaybettin', 'You lost the challenge this time')}
            </b>
            <span>
              {buMeydan.ad ?? L('Arkadaşın', 'Your friend')}: {'★'.repeat(buMeydan.y)}{'☆'.repeat(3 - buMeydan.y)} · {buMeydan.yil} {L('yıl', 'years')} — {L('Sen', 'You')}: {'★'.repeat(y)}{'☆'.repeat(3 - y)} · {yil} {L('yıl', 'years')}
            </span>
            <span className="kucuk">{sonucu === 'kaybettin' ? L('Aynı afetler yine gelecek: TEKRAR DENE.', 'The same disasters will come again: TRY AGAIN.') : L('Şimdi sen ona meydan oku: PAYLAŞ.', 'Now challenge them back: SHARE.')}</span>
          </div>
        )}

        {levelNo && (
          <div className={`level-sonucu ${gecti ? 'gecti' : 'kaldi'}`} role="status">
            <b className="baslik">Level {levelNo} · {level.ad}: {gecti ? L('GEÇİLDİ!', 'PASSED!') : L('geçilemedi', 'not passed')}</b>
            <LevelHedefleri hedefler={levelHedefleri(level, durum)} nasil={false} sonuc />
            <span>
              {gecti
                ? L(`${level.eserAd} kartı albümüne girdi.${onSonraki ? ` ${levelNo + 1}. level açıldı.` : ' Bütün levelleri bitirdin!'}`, `The ${level.eserAd} card is in your album.${onSonraki ? ` Level ${levelNo + 1} is open.` : ' You finished all the levels!'}`)
                : ayakta
                  ? L(`Vakıf ayakta kaldı ama yeterince yapı kurmadın. İpucu: kasada para birikince “Şehri gör”e bas ve boş arsalara yapı kur.`, `The foundation stood, but you did not build enough. Tip: when money piles up in the fund, tap “See the city” and build on the empty plots.`)
                  : `${L('İpucu', 'Tip')}: ${level.ipucu}`}
            </span>
          </div>
        )}

        <div className="yildizlar" aria-label={L(`${y} yıldız`, `${y} stars`)}>
          {[1, 2, 3].map((n) => (
            <span key={n} className={`yildiz ${n <= y ? 'dolu' : ''}`} style={{ animationDelay: `${0.25 * n}s` }}>★</span>
          ))}
        </div>

        <div className="madalyonlar">
          <div className="madalyon"><span className="sayi" style={{ color: 'var(--tugla)' }}>{durum.olaySayisi}</span><small>{L('olay', 'events')}</small></div>
          <div className="madalyon"><span className="sayi" style={{ color: 'var(--turkuaz)' }}>{durum.kararSayisi}</span><small>{L('karar', 'decisions')}</small></div>
          <div className="madalyon"><span className="sayi" style={{ color: 'var(--altin-yazi)' }}>{durum.toplamBos}</span><small>{L('boş sandık', 'empty chest')}</small></div>
        </div>

        {yeniKartlar === null && <div className="kart yeni-kartlar kucuk" role="status">{L('Eser kartların açılıyor…', 'Opening your monument cards…')}</div>}
        {yeniKartlar && yeniKartlar.length > 0 && (
          <div className="kart yeni-kartlar">
            <div className="yeni-kartlar-baslik">
              <span className="baslik">{L(`${yeniKartlar.length} yeni eser kartı!`, `${yeniKartlar.length} new monument card${yeniKartlar.length > 1 ? 's' : ''}!`)}</span>
              <button className="bag" onClick={onAlbum}>{L('Albümü aç →', 'Open the album →')}</button>
            </div>
            <ul className="eser-seridi">
              {yeniKartlar.map((e, i) => (
                <li key={e.id} className="kart-gel" style={{ animationDelay: `${0.9 + i * 0.15}s` }}>
                  <button className="eser-kucuk" onClick={() => eserAc(e.id)}>
                    <EserFoto e={e} />
                    <span className="eser-ad baslik">{e.ad}</span>
                    <span className="kucuk">{ilAdi(e.il)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {yeniKartlar && yeniKartlar.length === 0 && (
          <div className="kart yeni-kartlar kucuk">
            {kartHakki(durum) === 0 ? L('Vakfın 100 yılı görseydi bir gerçek eser kartı açacaktın. Tekrar dene!', 'Had your foundation reached 100 years, you would have opened a real monument card. Try again!') : L('Albümdeki bütün kartları topladın. Tebrikler!', 'You collected every card in the album. Congratulations!')}
          </div>
        )}

        <div className="kart ders-karti">
          {k.iyiKarar && (
            <>
              <small>{k.iyiKarar.etiket}</small>
              <div className="baslik" style={{ fontSize: 16 }}>{k.iyiKarar.metin}</div>
            </>
          )}
          <q>{k.ders}</q>
          <button className="bag" style={{ alignSelf: 'flex-start', paddingLeft: 0 }} onClick={() => setGercekAcik(true)}>
            {ayakta ? L(`Senin vakfın bir ${hayratAd} yaşattı.`, `Your foundation kept a ${hayratAd} alive.`) : L(`Vakfın bir ${hayratAd} için kurulmuştu.`, `Your foundation was set up for a ${hayratAd}.`)} {L('Gerçek örneklerini keşfet →', 'Explore real examples →')}
          </button>
        </div>

        <div className="sonuc-dugmeleri">
          <button className="dugme krem baslik" onClick={onYeniden}>{L('TEKRAR DENE', 'TRY AGAIN')}</button>
          <button className="dugme turkuaz baslik" onClick={() => setPaylasAcik(true)}>{L('MEYDAN OKU', 'CHALLENGE')}</button>
          <button className="dugme krem baslik vakfiye-dugme" onClick={() => setVakfiyeAcik(true)}>{L('VAKFİYENİ GÖR', 'SEE YOUR VAKFIYE')}</button>
          {onSonraki ? (
            <button className="dugme yesil baslik" onClick={onSonraki}>{L('SONRAKİ LEVEL', 'NEXT LEVEL')}</button>
          ) : (
            <button className="dugme yesil baslik" onClick={levelNo ? onLeveller : onAnaMenu}>{levelNo ? L('LEVELLER', 'LEVELS') : L('ANA MENÜ', 'MAIN MENU')}</button>
          )}
        </div>
      </section>
      {paylasAcik && <PaylasPaneli kart={kart} meydan={{ l: levelNo ?? 0, y, yil, a: ayakta }} onKapat={() => setPaylasAcik(false)} />}
      {vakfiyeAcik && <VakfiyeBelgesi durum={durum} onKapat={() => setVakfiyeAcik(false)} />}
      {gercekAcik && <GercekEserler turler={binaTurleri('hayrat', durum.ayarlar.amac)} onKapat={() => setGercekAcik(false)} />}
    </div>
  )
}
