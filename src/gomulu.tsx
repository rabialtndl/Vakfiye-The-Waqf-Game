// Gömülü giriş: oyunu başka bir uygulamanın içine koyar.
//   <script src="vakfiye-oyun.js"></script>
//   VakfiyeOyun.baslat(alan, araclar)   // alan: oyunun çizileceği kutu
//   VakfiyeOyun.durdur()
// Sözleşme feyzabb/vakfiye/oyun.js ile aynıdır. Oyun bir Shadow DOM içinde çalışır:
// ev sahibinin stilleri oyunu, oyunun stilleri ev sahibini bozmaz.
import { StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import App from './App'
import stilHam from './arayuz/stil.css?inline'
import { ortam, type Araclar } from './ortam'
import { dilYenidenOku } from './dil'

// Bina görselleri oyun dosyasının yanındaki binalar/ klasöründe aranır (ör. /oyun/vakfiye-oyun.js → /oyun/binalar/).
const betik = document.currentScript as HTMLScriptElement | null
if (betik?.src) ortam.varlikKoku = new URL('.', betik.src).href

/** Sayfa geneli için yazılmış stilleri gölge köke uyarlar. */
function golgeyeUyarla(css: string): string {
  return (
    css
      .replace(/html\s*,\s*body\s*,\s*#root\s*\{[^}]*\}/g, '')
      .replace(/:root\[([^\]]+)\]\s+body/g, ':host([$1]) .kok')
      .replace(/:root\[([^\]]+)\]/g, ':host([$1])')
      .replace(/:root/g, ':host')
      .replace(/(^|[}\n])\s*body\s*\{/g, '$1.kok{')
      // Telefon düzeni ekran yönüne değil, oyunun kutusunun genişliğine göre seçilir (mobil uygulama 440 px).
      .replace(/@media\s*\(orientation:\s*portrait\)\s*and\s*\((?:max-width:\s*600px|width\s*<=\s*600px)\)/g, '@container kok (max-width: 600px)')
      .replace(/@media\s*\((?:max-height:\s*430px|height\s*<=\s*430px)\)/g, '@container kok (max-height: 430px)') +
    `
:host { display: block; position: relative; width: 100%; height: var(--vakfiye-oyun-yukseklik, min(80dvh, 720px)); min-height: 360px; overflow: hidden; border-radius: 16px; contain: layout paint; }
.kok { position: absolute; inset: 0; container: kok / size; background: #86ad60; font-family: var(--govde); color: var(--kahve-koyu); }
.ekran { position: absolute; }
.ogretici-balon { position: absolute; }
`
  )
}

// EB Garamond: vakfiye belgesi (parşömen) için; Türkçe harfleri içerir.
const FONT = 'https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,600;0,700;1,600&family=Fredoka:wght@500;600;700&family=Nunito:wght@600;700;800;900&display=swap'

let kok: Root | null = null
let ev: HTMLElement | null = null

function baslat(alan: HTMLElement, araclar: Araclar = {}) {
  durdur()
  if (!document.querySelector(`link[href="${FONT}"]`)) {
    const l = document.createElement('link')
    l.rel = 'stylesheet'
    l.href = FONT
    document.head.appendChild(l)
  }
  alan.replaceChildren()
  ev = document.createElement('div')
  ev.className = 'vakfiye-oyun'
  alan.appendChild(ev)
  const golge = ev.attachShadow({ mode: 'open' })
  const stil = document.createElement('style')
  stil.textContent = golgeyeUyarla(stilHam)
  const sarmal = document.createElement('div')
  sarmal.className = 'kok'
  golge.append(stil, sarmal)

  ortam.araclar = araclar
  ortam.kok = ev
  ortam.gomulu = true
  dilYenidenOku()
  kok = createRoot(sarmal)
  kok.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

function durdur() {
  kok?.unmount()
  kok = null
  ev?.remove()
  ev = null
}

declare global {
  interface Window {
    VakfiyeOyun: { baslat: typeof baslat; durdur: typeof durdur; surum: string }
  }
}

window.VakfiyeOyun = { baslat, durdur, surum: __SURUM__ }
