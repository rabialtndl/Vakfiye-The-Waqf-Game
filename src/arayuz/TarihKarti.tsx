import type { TarihiOlay } from '../leveller'
import { OLAY_AD, iyiOlay } from '../motor/motor'
import { L } from '../dil'

/** Tarihten bir sayfa: levelin şehrinde o yıl gerçekten yaşanmış olay, Oyun okuyana kadar bekler. */
export function TarihKarti({ olay, sehir, oyunYili, onDevam }: { olay: TarihiOlay; sehir: string; oyunYili: number; onDevam: () => void }) {
  const iyi = iyiOlay(olay.olay)
  return (
    <div className="ortala" onClick={(e) => e.stopPropagation()}>
      <section className={`ahsap-panel tarih-karti ${iyi ? 'iyi' : ''}`} aria-labelledby="tarih-baslik" role="dialog">
        <h1 className="kurdele altin baslik golgeli">{L('TARİHTEN', 'FROM HISTORY')}</h1>
        <div className="tarih-ust">
          <span className="tarih-yil baslik">{olay.yil > 0 ? olay.yil : L('Bilgi', 'Info')}</span>
          <span className="kucuk">{olay.yil > 0 ? `${sehir} · ` : ''}{L(`oyunun ${oyunYili}. yılı`, `game year ${oyunYili}`)}</span>
        </div>
        <h2 id="tarih-baslik" className="baslik">{olay.baslik}</h2>
        <p className="tarih-metin">{olay.metin}</p>
        <p className="tarih-oyunda">
          {L(<><b>Oyunda:</b> bu tur <span className={`cip ${iyi ? 'iyi-cip' : 'kotu-cip'}`}>{OLAY_AD[olay.olay]}</span> sayılır.</>, <><b>In the game:</b> this round counts as <span className={`cip ${iyi ? 'iyi-cip' : 'kotu-cip'}`}>{OLAY_AD[olay.olay]}</span>.</>)}
        </p>
        <button className="dugme yesil baslik buyuk-dugme" onClick={onDevam} autoFocus>{L('DEVAM', 'CONTINUE')}</button>
      </section>
    </div>
  )
}
