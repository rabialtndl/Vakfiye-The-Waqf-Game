import type { Ilerleme } from '../ayarlar'
import { dil, dilDegistir, L } from '../dil'
import { LEVELLER, SERBEST } from '../leveller'
import { rutbe } from '../rutbe'
import type { Meydan } from '../meydan'

type Props = {
  meydan?: Meydan | null
  onMeydan?: () => void
  onMeydanReddet?: () => void
  ilerleme: Ilerleme
  onOyna: () => void
  onNasil: () => void
  onAyarlar: () => void
  onAlbum: () => void
}

export function AnaMenu({ ilerleme, onOyna, onNasil, onAyarlar, onAlbum, meydan = null, onMeydan, onMeydanReddet }: Props) {
  const gecilen = LEVELLER.filter((l) => (ilerleme.leveller?.[l.no] ?? 0) > 0).length
  const son = ilerleme.sonOyun
  return (
    <div className="ana-menu">
      <div className="logo-alani">
        <div className="logo baslik">Vakfiye</div>
        <div className="slogan baslik">{L('Vakfını kur, yüzyıllara bırak.', 'Found your waqf, leave it to the centuries.')}</div>
        <DilSecici />
      </div>

      {meydan && (
        <div className="meydan-daveti" role="region" aria-label={L('Meydan okuma', 'Challenge')}>
          <span className="meydan-simge" aria-hidden="true">⚔️</span>
          <div>
            <b className="baslik">{meydan.ad ? L(`${meydan.ad} sana meydan okuyor!`, `${meydan.ad} challenges you!`) : L('Sana bir meydan okuma var!', 'You have a challenge!')}</b>
            <span>
              {L(
                <>{(LEVELLER.find((l) => l.no === meydan.l) ?? SERBEST).ad}: vakfı {meydan.yil} yıl {meydan.a ? 'ayakta tuttu' : 'yaşattı'}, {'★'.repeat(meydan.y)}{'☆'.repeat(3 - meydan.y)}. Aynı afetlerle sen daha iyisini yapabilir misin?</>,
                <>{(LEVELLER.find((l) => l.no === meydan.l) ?? SERBEST).ad}: {meydan.a ? 'kept the foundation standing' : 'kept the foundation alive'} for {meydan.yil} years, {'★'.repeat(meydan.y)}{'☆'.repeat(3 - meydan.y)}. Can you do better with the same disasters?</>,
              )}
            </span>
            <div className="meydan-dugmeler">
              <button className="dugme yesil baslik" onClick={onMeydan}>{L('KABUL ET', 'ACCEPT')}</button>
              <button className="bag" onClick={onMeydanReddet}>{L('Sonra', 'Later')}</button>
            </div>
          </div>
        </div>
      )}

      <div className="menu-dugmeleri">
        <button className="dugme yesil baslik buyuk-dugme" data-ogretici="oyna" onClick={onOyna}>
          {ilerleme.ogreticiBitti ? L('OYNA', 'PLAY') : L('OYNAMAYA BAŞLA', 'START PLAYING')}
        </button>
        <button className="dugme turkuaz baslik nasil-dugmesi" onClick={onNasil}>
          <span>{L('NASIL OYNANIR ?', 'HOW TO PLAY ?')}</span>
          <small>{ilerleme.ogreticiBitti ? L('4 adımda oyun, rehberli oyun', 'The game in 4 steps, guided game') : L('İlk kez mi? Buradan başla', 'First time? Start here')}</small>
        </button>
        <div className="ikili">
          <button className="dugme altin baslik album-dugmesi" onClick={onAlbum}>
            {L('ALBÜM', 'ALBUM')} <span>{ilerleme.album.length}</span>
          </button>
          <button className="dugme krem baslik" onClick={onAyarlar}>{L('AYARLAR', 'SETTINGS')}</button>
        </div>
      </div>

      <div className="seviye-rozeti" aria-label={L(`${gecilen} / ${LEVELLER.length} level geçildi, toplam ${ilerleme.toplamYildiz} yıldız`, `${gecilen} / ${LEVELLER.length} levels passed, ${ilerleme.toplamYildiz} stars in total`)}>
        <div className="seviye-sayi baslik">{Math.min(gecilen + 1, LEVELLER.length)}</div>
        <div>
          <div className="baslik" style={{ fontSize: 15 }}>{gecilen >= LEVELLER.length ? L('Bütün leveller bitti', 'All levels done') : `Level ${gecilen + 1}`}</div>
          <div className="seviye-cubuk"><div style={{ width: `${(100 * gecilen) / LEVELLER.length}%` }} /></div>
          <div className="kucuk">⭐ {ilerleme.toplamYildiz} {L('yıldız', 'stars')} · {rutbe(ilerleme.afetDogru ?? 0).simdiki.simge} {rutbe(ilerleme.afetDogru ?? 0).simdiki.ad}</div>
        </div>
      </div>

      {son && (
        <div className="son-oyun">
          {L(`Son vakfın ${son.ayakta ? `${son.yil} yıl ayakta kaldı` : `${son.yil} yıl yaşadı`}`, `Your last foundation ${son.ayakta ? `stood for ${son.yil} years` : `lived for ${son.yil} years`}`)} {'⭐'.repeat(son.yildiz)}
        </div>
      )}
    </div>
  )
}

/** Türkçe / English seçimi: ana menüde (oyunun ilk sayfası) ve Ayarlar'da. */
export function DilSecici() {
  const d = dil()
  return (
    <div className="parcali dil-secici" role="radiogroup" aria-label="Dil · Language">
      <button role="radio" aria-checked={d === 'tr'} lang="tr" onClick={() => dilDegistir('tr')}>
        Türkçe
      </button>
      <button role="radio" aria-checked={d === 'en'} lang="en" onClick={() => dilDegistir('en')}>
        English
      </button>
    </div>
  )
}
