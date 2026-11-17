# Oyunu ekip uygulamalarına ekleme

Bu klasördeki yamalar oyunu iki uygulamaya ekler. Her biri kendi reposunda uygulanır:

| Yama | Repo | Ne yapar |
|---|---|---|
| `mobil-oyun-gomulu.patch` | feyzabb/vakfiye | `oyun.js` yerine yeni oyun paketi, `harita.webp` ve `binalar/`; Oyun sekmesinden gerçek eserlere ve eser kartına bağlantı; `?meydan=` ile açılınca doğrudan Oyun sekmesi. Feyza'nın 288a492 "Yeni tasarım" sürümüne oturur. |
| `web-oyun-gomulu.patch` | Tekinoglu-Firin/web | `/tr/oyun` sayfası aynı oyun paketini yükler (`components/OyunGomulu.tsx`); eser kartı `/[dil]/eser/[id]`'ye gider; sayfa metni levellere göre güncel. |

```bash
git checkout -b oyun-gomulu
git am /yol/entegrasyon/mobil-oyun-gomulu.patch   # ya da web-oyun-gomulu.patch
git push -u origin oyun-gomulu                    # sonra GitHub'da pull request aç
```

## İki uygulama oyuna aynı şeyi verir

Oyun tek paket (`window.VakfiyeOyun.baslat(kutu, araclar)` / `durdur()`). Web ve mobil aynı araçları verir; böylece oyun iki yerde aynı davranır:

| Araç | Mobil (feyzabb/vakfiye, `uygulama.js`) | Web (Tekinoglu-Firin/web, `OyunGomulu.tsx`) |
|---|---|---|
| `pullar()` | Telefondaki pullar (hesapla eşitlenir) | Supabase `pullar` tablosu, giriş/çıkışta yeniden okunur |
| `kaydet` / `oku` | `vakfiye:oyun:<anahtar>` (cihazda) | `vakfiye:oyun:<anahtar>` (cihazda), aynı anahtarlar |
| `eserAc(id)` | Keşfet'te o eserin kartı | `/[dil]/eser/[id]` sayfası |
| `eserler(turler)` | Uygulamadaki ESERLER listesi | verilmez; oyun `/api/eserler`'den çeker |
| `bildir(metin)` | Uygulamanın bildirimi | verilmez |
| `dil` (isteğe bağlı) | verilmez: oyuncunun son seçimi | sayfanın dili (`'tr'` / `'en'`): `/en/oyun` İngilizce açılır |

- **Pullar ortak:** iki uygulama aynı Supabase projesini ve aynı `pullar(kullanici, eser_id)` tablosunu kullanır. Telefonda QR ile alınan pul, aynı hesapla webde de görünür; oyunda bölge ve level açar, albüme kart olarak girer.
- **Geç gelen pullar:** ev sahibi pulları sonradan yüklerse `window.dispatchEvent(new Event('vakfiye:pullar'))` ile haber verir; oyun yeniden okur. Oyun ayrıca menüye ve level ekranına her girişte, sekmeye dönüşte de okur.
- **Meydan okuma bağlantısı:** oyun, bulunduğu sayfanın adresine `?meydan=...` ekleyerek paylaşır ve açılışta bu parametreyi okur. Ev sahibi uygulama bu parametre varsa doğrudan oyun sekmesini/sayfasını açmalı (web'de `/tr/oyun?meydan=...` zaten oyunu açar; mobilde `?meydan` görülünce Oyun sekmesine geçilmeli).
- **Oyun ilerlemesi (level, albüm, ayarlar) cihazda kalır;** telefon ile web arasında taşınmaz. Taşınması istenirse Supabase'e bir `oyun_kayitlari(kullanici, anahtar, deger jsonb)` tablosu eklenip iki uygulamanın `kaydet/oku`'su oraya yazacak şekilde değiştirilir; oyunda değişiklik gerekmez.

Oyun paketi güncellenince: bu repoda `npm run build:gomulu`, çıkan `dist-gomulu/vakfiye-oyun.js` dosyasını mobilde `oyun.js`, web'de `public/oyun/vakfiye-oyun.js` olarak kopyalayın. Oyun dosyasının yanına (mobilde kök, web'de `public/oyun/`) şunlar da kopyalanmalı: `public/binalar/`, `public/insanlar/`, `public/harita.webp`, `public/vakfiye-parsomen.webp` (vakfiye belgesi).

## Dil (31 Ekim)

Oyun Türkçe ve İngilizce oynanır; ana menüde ve Ayarlar'da Türkçe / English seçicisi var, seçim `kaydet`/`oku` ile `vakfiye:oyun:vakfiye.dil` anahtarına yazılır. Ev sahibi `dil` verirse oyun o dilde açılır (oyuncu yine oyun içinden değiştirebilir). Web için `OyunGomulu.tsx`'teki `baslat` çağrısına tek satır yeter:

```ts
oyun.baslat(kutu.current, { pullar: ..., kaydet, oku, eserAc: ..., dil })
```

Mobilde bir şey eklemek gerekmez. Oyun, ev sahibi sayfanın `lang`'ına ve başlığına dokunmaz.
