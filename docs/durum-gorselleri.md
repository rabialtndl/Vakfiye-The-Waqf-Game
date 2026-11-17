# Durum görselleri (yangın, yıkık, salgın, kurak)

Oyunda bir bina yanınca, yıkılınca ya da salgında kapanınca haritanın o parçası değişir. Şu an bu
değişim kodla çiziliyor (renk filtresi, lekeli is izi, çatıda alevler, duman, moloz). Daha iyi bir
görüntü için her durumun **elle çizilmiş** hâli eklenebilir: `public/durumlar/<ad>.webp` dosyası
varsa oyun filtre yerine onu kullanır (alev, duman, kıvılcım gibi hareketli parçalar yine üstüne
çizilir). Dosya yoksa filtre devreye girer; hiçbir şey bozulmaz.

## Nasıl üretilir

1. `durum-kiti.zip` içindeki kırpıntılardan ilgili olanı ChatGPT'ye (görsel üretimi açık) yükle.
   `*-buyuk.png` 3 kat büyütülmüş hâlidir; onu yüklemek daha iyi sonuç verir.
2. Aşağıdaki istemi yapıştır. **Aynı açı, aynı kadraj, aynı boyut oranı** önemli: görsel haritanın
   tam o noktasına oturuyor.
3. İndirdiğin görseli hazırla:
   `python3 scripts/durum_gorseli.py indirilen.png han-yangin`
4. `npm run dev` ile bak; oyunda yangın çıkınca yeni görsel görünür.

Ortak istem başı (her istemin önüne):

> Bu, minyatür üslubunda çizilmiş izometrik bir Osmanlı şehri haritasından kırpılmış bir parça.
> Aynı çizim üslubunu, aynı kamera açısını, aynı kadrajı ve aynı en-boy oranını koru. Binanın yeri,
> şekli ve kenarlardaki çevre (yollar, ağaçlar) değişmesin ki görsel haritaya geri yapıştırılabilsin.
> Yazı, logo, çerçeve ekleme. Sadece şunu değiştir:

| Dosya adı | Kırpıntı | İstemin devamı |
|---|---|---|
| `han-yangin` | han | Han yanıyor: çatıların bir kısmında turuncu alevler, kapı ve pencerelerden kor ışığı, kararmış ahşap saçaklar, üstünden yükselen koyu duman. Dramatik ama çizgi film değil. |
| `han-yanik` | han | Yangın söndü: çatıların bir kısmı çökmüş, kirişler kömürleşmiş, duvarlarda kara is lekeleri, yer yer ince beyaz duman tütüyor. Bina ayakta ama onarım bekliyor. |
| `han-yikik` | han | Depremden sonra: bir köşe kulesi ve duvarın bir bölümü yıkılmış, avluya taş moloz yığılmış, duvarlarda çatlaklar, toz bulutu. |
| `han-salgin` | han | Veba salgını: kapılar kapalı ve tahtayla çakılı, avlu boş, renkler solgun ve gri-yeşil, kapının önünde tek bir bekçi. Kasvetli ama ürkütücü değil. |
| `hamam-yikik` | hamam | Depremden sonra: kubbenin bir kısmı çökmüş, duvarlarda çatlaklar, önüne taş moloz yığılmış, toz. |
| `arasta-yangin` | arasta | Çarşının dükkân sırası yanıyor: tente ve ahşap saçaklarda alevler, kararmış tezgâhlar, duman. |
| `arazi-kurak` | arazi | Kuraklık: tarlalar çatlamış kahverengi toprak, ekinler sararmış ve kurumuş, ağaçlar yapraksız. |

Görseller ChatGPT ile üretildiği için jüriye "durum görselleri yapay zekâyla üretilip elle seçildi"
diye belirtmek iyi olur.
