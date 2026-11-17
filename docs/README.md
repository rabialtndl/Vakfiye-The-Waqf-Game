# Dokümanlar

| Dosya | İçerik |
| --- | --- |
| [KURALLAR.md](KURALLAR.md) | Oyuncuya yönelik sade kurallar. Oyundaki "Nasıl oynanır" sayfası bu dosyayı doğrudan gösterir. |
| [vakif-oyunu-kurallari-v2.md](vakif-oyunu-kurallari-v2.md) | Oyunun kesin kuralları ve sayıları (v2, donduruldu). Motor buna uyar, kabul testleri buradan. |
| [sayfa-sayfa-icerik.md](sayfa-sayfa-icerik.md) | 13 sayfanın içeriği, ekran akışı, oyuncuya anlatılacak kurallar, kavramlar sözlüğü, öğretici, ayarlar, web/uygulama farkları. |
| [img/](img/) | Ekran akışı şeması ve koddaki ekranların görüntüleri. |
| [../araclar/denge_sim.py](../araclar/denge_sim.py) | Python denge simülasyonu. `python3 araclar/denge_sim.py` v1 ve v2 hayatta kalma oranlarını yazdırır. |

Canlı kopyalar claude.ai'de: tasarım tuvali "Vakfiye Oyun Ekranları" (Clash tarzı ekranlar) ve "Vakıf Oyunu · Sayfa sayfa içerik ve akış" dokümanı. Bir şey değişince önce canlı kopya, sonra buradaki dosya güncellenir.

## Oyunu başka uygulamaya gömme (web ve mobil)

```bash
npm run build:gomulu   # → dist-gomulu/vakfiye-oyun.js (tek dosya, ~96 KB gzip)
```

- **Mobil (feyzabb/vakfiye):** dosyayı `oyun.js` adıyla kopyala, `index.html`'deki `?v=` sayısını artır.
- **Web (Tekinoglu-Firin/web):** dosyayı `public/oyun/vakfiye-oyun.js`'e kopyala; `components/OyunGomulu.tsx` yükler.

Sözleşme: `VakfiyeOyun.baslat(kutu, araclar)` ve `VakfiyeOyun.durdur()`. Oyun Shadow DOM içinde çalışır, sayfanın stilini bozmaz.
`araclar` alanlarının hepsi isteğe bağlı: `bildir`, `pullar`, `kaydet`, `oku`, `eserler(turler)`, `eserAc(id)`.
`eserler` verilmezse gerçek eserler `vakfiye.vercel.app/api/eserler`'den çekilir; `eserAc` verilmezse eser sayfası yeni sekmede açılır.
Kutunun yüksekliği `--vakfiye-oyun-yukseklik` CSS değişkeniyle ayarlanır (varsayılan `min(80dvh, 720px)`).

### Bina görselleri

`public/binalar/` klasöründeki görseller (ad listesi ve ChatGPT istekleri: `docs/asset-istekleri.md`) oyunun çizimlerinin yerine geçer.
Gömülü kullanımda bu klasörü oyun dosyasının yanına kopyalayın: mobilde `binalar/` (oyun.js'in yanına), web'de `public/oyun/binalar/`.
