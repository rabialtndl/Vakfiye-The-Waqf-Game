import type { Hedef } from '../leveller'
import { L } from '../dil'

/** Level hedefleri: işaret kutulu liste. Oyun sırasında ilerleme ve "nasıl" ipucuyla. */
export function LevelHedefleri({ hedefler, nasil = true, sonuc = false }: { hedefler: Hedef[]; nasil?: boolean; sonuc?: boolean }) {
  return (
    <ul className="hedef-listesi">
      {hedefler.map((h) => (
        <li key={h.id} className={h.tamam ? 'tamam' : sonuc ? 'olmadi' : ''}>
          <span className="hedef-kutu" aria-hidden="true">{h.tamam ? '✓' : sonuc ? '✗' : ''}</span>
          <span className="hedef-metin">
            <span className="hedef-ad">
              {h.ad}
              {h.ilerleme && <span className="hedef-ilerleme">{h.ilerleme}</span>}
            </span>
            {nasil && !h.tamam && <span className="hedef-nasil">{h.nasil}</span>}
          </span>
          <span className="gizli">{h.tamam ? L('tamamlandı', 'done') : sonuc ? L('tamamlanmadı', 'not done') : L('devam ediyor', 'in progress')}</span>
        </li>
      ))}
    </ul>
  )
}
