import { useState } from 'react'
import { eserAc, turSayfasiAc } from '../ortam'
import { ESNAF_ODULU, type EsnafHikayesi } from '../esnaf'
import { EserSeridi, GercekEserler } from './GercekEserler'
import { L } from '../dil'

/** Haritadaki esnafa dokununca: kısa, kaynaklı bir hikâye ve teşekkür olarak yapı parasına küçük bir katkı. */
export function EsnafKarti({ h, onKapat, odulVerildi }: { h: EsnafHikayesi; onKapat: () => void; odulVerildi: boolean }) {
  const [hepsi, setHepsi] = useState(false)
  // Oyunda dış kaynak bağlantısı yok: kaynak ya sitedeki eser sayfasına ya da sitenin tür listesine gider.
  const kaynak = h.kaynak.url ? null : h.kaynak.eser ? (
    <button className="tarih-kaynak bag" onClick={() => eserAc(h.kaynak.eser!)}>{L('Kaynak', 'Source')}: {h.kaynak.ad} →</button>
  ) : h.turler ? (
    <button className="tarih-kaynak bag" onClick={() => turSayfasiAc(h.turler![0])}>{L('Kaynak', 'Source')}: {h.kaynak.ad} →</button>
  ) : (
    <p className="tarih-kaynak">{L('Kaynak', 'Source')}: {h.kaynak.ad}</p>
  )
  return (
    <>
      <div className="ortala" onClick={(e) => e.stopPropagation()}>
        <section className="ahsap-panel tarih-karti esnaf-karti" aria-labelledby="esnaf-baslik" role="dialog">
          <h1 className="kurdele turkuaz baslik golgeli">{h.yerAd.toLocaleUpperCase(L('tr', 'en'))}</h1>
          <button className="kapat-dugmesi" aria-label={L('Kapat', 'Close')} onClick={onKapat}>✕</button>
          <div className="tarih-ust">
            <span className="esnaf-simge" aria-hidden="true">{h.simge}</span>
            {h.kim && <span className="kucuk">{L(`${h.kim} anlatıyor`, `Told by the ${h.kim.toLocaleLowerCase('en')}`)}</span>}
          </div>
          <h2 id="esnaf-baslik" className="baslik">{h.baslik}</h2>
          <p className="tarih-metin">{h.metin}</p>
          {kaynak}
          {h.turler && <EserSeridi turler={h.turler} onHepsi={() => setHepsi(true)} />}
          {h.odul && odulVerildi && <p className="tarih-oyunda">{L(<>{h.kim} vakfa teşekkür etti: yapı parasına <b>+{ESNAF_ODULU} akçe</b>.</>, <>The {h.kim.toLocaleLowerCase('en')} thanked the foundation: <b>+{ESNAF_ODULU} akçe</b> to building money.</>)}</p>}
          <button className="dugme yesil baslik buyuk-dugme" onClick={onKapat} autoFocus>{L('TAMAM', 'OK')}</button>
        </section>
      </div>
      {hepsi && h.turler && <GercekEserler turler={h.turler} onKapat={() => setHepsi(false)} />}
    </>
  )
}
