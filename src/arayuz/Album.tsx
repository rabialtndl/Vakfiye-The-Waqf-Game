import { ALBUM_BOLUMLERI, ALBUM_TURLERI } from '../albumKartlari'
import { eserAc } from '../ortam'
import { EserFoto, IlhamKarti, ilAdi, useEserler } from './GercekEserler'
import { ILHAM } from './ilham'
import { L } from '../dil'

type Props = { toplanan: string[]; onKapat: () => void }

/** Eser albümü: açılan kartlar fotoğrafıyla, kilitliler soru işaretiyle. Her 100 yıl ayakta kalınca bir kart açılır. */
export function Album({ toplanan, onKapat }: Props) {
  const eserler = useEserler(ALBUM_TURLERI)
  const toplam = eserler?.length ?? 0
  const acik = eserler?.filter((e) => toplanan.includes(e.id)).length ?? 0
  return (
    <div className="ortala" onClick={(e) => e.stopPropagation()}>
      <section className="ahsap-panel bilgi-paneli album" aria-labelledby="album-baslik">
        <h1 id="album-baslik" className="kurdele altin baslik golgeli">{L('ESER ALBÜMÜ', 'MONUMENT ALBUM')}</h1>
        <button className="kapat-dugmesi" aria-label={L('Kapat', 'Close')} onClick={onKapat}>✕</button>
        <div className="album-ozet">
          <span className="baslik">{acik} / {toplam || '…'} {L('kart', 'cards')}</span>
          <div className="seviye-cubuk" style={{ flex: 1 }}><div style={{ width: `${toplam ? (100 * acik) / toplam : 0}%` }} /></div>
        </div>
        <p className="ayar-aciklama" style={{ margin: '0 0 8px' }}>
          {L('Vakfın her 100 yıl ayakta kaldıkça, köyündeki binalara benzeyen gerçek bir vakıf eserinin kartı açılır. Açılan karta dokun, eserin sayfasını gör.', 'For every 100 years your foundation stands, you open the card of a real foundation monument like the buildings in your village. Tap an open card to see the monument’s page.')}
        </p>
        <div className="kaydirilir">
          <h2 className="bolum baslik">{L('Köyün ilham kaynakları', 'What inspired your village')} <span className="kucuk">{L('her zaman açık', 'always open')}</span></h2>
          <ul className="ilham-izgara">
            {Object.values(ILHAM).map((i) => (
              <li key={i.id}><IlhamKarti ilham={i} kucuk /></li>
            ))}
          </ul>
          {eserler === null && <p className="kucuk" role="status">{L('Eserler yükleniyor…', 'Loading monuments…')}</p>}
          {eserler !== null &&
            ALBUM_BOLUMLERI.map((b) => {
              const liste = eserler.filter((e) => b.turler.includes(e.tur))
              if (!liste.length) return null
              const sirali = [...liste].sort((x, y) => Number(toplanan.includes(y.id)) - Number(toplanan.includes(x.id)))
              return (
                <div key={b.ad}>
                  <h2 className="bolum baslik">
                    {b.ad} <span className="kucuk">{liste.filter((e) => toplanan.includes(e.id)).length} / {liste.length}</span>
                  </h2>
                  <ul className="eser-izgara">
                    {sirali.map((e) =>
                      toplanan.includes(e.id) ? (
                        <li key={e.id}>
                          <button className="eser-kucuk" onClick={() => eserAc(e.id)}>
                            <EserFoto e={e} />
                            <span className="eser-ad baslik">{e.ad}</span>
                            <span className="kucuk">{ilAdi(e.il)}{e.ilce ? ` · ${e.ilce}` : ''}</span>
                          </button>
                        </li>
                      ) : (
                        <li key={e.id}>
                          <div className="eser-kucuk kilitli" aria-label={L(`Kilitli kart · ${ilAdi(e.il)}`, `Locked card · ${ilAdi(e.il)}`)}>
                            <span className="foto-yok" aria-hidden="true">?</span>
                            <span className="eser-ad baslik">{L('Kilitli', 'Locked')}</span>
                            <span className="kucuk">{ilAdi(e.il)}</span>
                          </div>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              )
            })}
        </div>
      </section>
    </div>
  )
}
