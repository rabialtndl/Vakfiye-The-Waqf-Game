import { useState } from 'react'
import { eserAc } from '../ortam'
import { ilAdi } from './GercekEserler'
import { L } from '../dil'
import { soruBilgisi, kaynakAdi } from '../veri/sorularEn'

export type Soru = {
  id: string
  bilgi: string
  dogru: string
  secenekler: { id: string; ad: string; il: string }[]
  kaynak: string
  sayfa?: number | string | null
}

export const BILGI_ODULU = 5

/** Envanterden kaynaklı bir bilgi: "Bu hangi esere ait?" Doğru cevap yapı parasına bağış getirir. */
export function BilgiSorusu({ soru, onCevap, onKapat }: { soru: Soru; onCevap: (dogru: boolean) => void; onKapat: () => void }) {
  const [secilen, setSecilen] = useState<string | null>(null)
  const dogru = secilen === soru.dogru
  const dogruAd = soru.secenekler.find((x) => x.id === soru.dogru)?.ad

  return (
    <div className="ortala" onClick={(e) => e.stopPropagation()}>
      <section className="ahsap-panel soru-paneli" aria-labelledby="soru-baslik">
        <h1 id="soru-baslik" className="kurdele turkuaz baslik golgeli">{L('BİLGİ SORUSU', 'QUIZ QUESTION')}</h1>
        <p className="kucuk" style={{ margin: 0 }}>{L(`Bir hayırsever vakfı sınıyor. Doğru bilirsen yapı parasına ${BILGI_ODULU} akçe bağışlayacak.`, `A benefactor is testing the foundation. Get it right and they will give ${BILGI_ODULU} akçe to building money.`)}</p>
        <blockquote className="soru-bilgi">“{soruBilgisi(soru)}”</blockquote>
        <p className="baslik soru-soru">{L('Bu bilgi hangi esere ait?', 'Which monument is this about?')}</p>
        <ul className="soru-secenekler">
          {soru.secenekler.map((x) => {
            const durum = secilen === null ? '' : x.id === soru.dogru ? 'dogru' : x.id === secilen ? 'yanlis' : 'soluk'
            return (
              <li key={x.id}>
                <button
                  className={`soru-secenek ${durum}`}
                  disabled={secilen !== null}
                  onClick={() => {
                    setSecilen(x.id)
                    onCevap(x.id === soru.dogru)
                  }}
                >
                  <span className="baslik">{x.ad}</span>
                  <span className="kucuk">{ilAdi(x.il)}</span>
                </button>
              </li>
            )
          })}
        </ul>
        {secilen !== null && (
          <div className={`soru-sonuc ${dogru ? 'dogru' : 'yanlis'}`} role="status">
            <b>{dogru ? L(`Doğru! +${BILGI_ODULU} akçe yapı parasına.`, `Right! +${BILGI_ODULU} akçe to building money.`) : L(`Doğrusu: ${dogruAd}.`, `The answer: ${dogruAd}.`)}</b>
            <span className="kucuk">
              {L('Kaynak', 'Source')}: {kaynakAdi(soru.kaynak)}
              {soru.sayfa ? L(`, s. ${soru.sayfa}`, `, p. ${soru.sayfa}`) : ''} {L('(Vakıf Katılım envanteri)', '(Vakıf Katılım inventory)')}
            </span>
            <button className="ilham-git bag" onClick={() => eserAc(soru.dogru)}>{L(`${dogruAd} sayfasını aç →`, `Open the ${dogruAd} page →`)}</button>
          </div>
        )}
        <div className="ikili">
          {secilen === null && <button className="dugme krem baslik" onClick={onKapat}>{L('Geç', 'Skip')}</button>}
          {secilen !== null && <button className="dugme yesil baslik buyuk-dugme" onClick={onKapat} autoFocus>{L('DEVAM', 'CONTINUE')}</button>}
        </div>
      </section>
    </div>
  )
}
