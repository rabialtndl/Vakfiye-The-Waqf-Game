# Bina görselleri: ChatGPT'den nasıl istenir

> **Not (22 Eki):** Bu dosyanın yerini `docs/chatgpt-gorsel-istekleri.md` aldı: önce tek bir stil görseli, sonra harita, sonra binalar.

Köydeki her bina için **iki görsel** gerekiyor: normal hâli ve oyunda olan bir olaydan sonraki hâli (16 görsel, teslim edildi). Şehir genişlemesindeki 8 yeni yapının her biri için birer görsel daha gerekiyor (aşağıda).

Görseller hazır olunca `public/binalar/` klasörüne aşağıdaki **dosya adlarıyla** koyun. Oyun dosyayı bulursa çizim yerine resmi gösterir, bulamazsa eski çizim kalır. Yani hepsini bir seferde bitirmek gerekmez.

## 1. Her istekten önce yapıştırılacak ortak stil metni

Bütün görsellerin aynı oyundan çıkmış gibi durması için **her isteğin başına** bu metni yapıştırın. Aynı sohbette sırayla isteyin ki ChatGPT stili korusun.

```
Game asset for a cozy mobile building game (Hay Day / Township style), Turkish Seljuk and early Ottoman architecture.
Camera: true isometric 2:1 view (dimetric, 30° from horizontal), looking at the building's front corner, so the left wall and the right wall are both visible and the front corner of the base points straight down toward the viewer. Use exactly this same camera for every image.
Light: soft warm daylight from the upper right; the right walls are lighter, the left walls slightly darker. Soft contact shadow under the building only.
Look: clean, rounded, slightly chunky shapes, saturated but warm colors (honey sandstone, terracotta brick, blue-grey lead domes, turquoise tile accents), gentle texture, no harsh black outlines, no photorealism.
Framing: square 1024×1024 PNG with a TRANSPARENT background. One building only, centered. The building's base (its footprint on the ground) forms a diamond that is twice as wide as it is tall; this base diamond spans 90% of the image width, and its bottom tip sits just above the bottom edge. Leave empty space above for domes and minarets.
Do NOT include: ground tiles, grass, background, sky, text, labels, people, UI.
```

## 2. Görseller

Her satırda: dosya adı → ortak stil metninden sonra yapıştırılacak açıklama. Kenarda **ilham kaynağı** fotoğrafı var; isterseniz o fotoğrafı da ChatGPT'ye ekleyip "bu yapıdan esinlen" deyin (fotoğraflar web sitesindeki eser sayfalarında).

### Hamam · ilham: Sahip Ata (Sultan) Hamamı, Konya

`hamam.png`
```
A Seljuk bathhouse (hamam) on a square base. Low, solid honey-colored cut-stone walls with two thin terracotta brick bands. On the flat roof: one large lead-grey dome at the front and two small domes behind it; every dome is dotted with small round glass skylights ("elephant eye" lights). A short brick chimney with a wisp of steam at the back right corner. A small carved stone portal with a pointed-arch wooden door on the left wall.
```

`hamam-hasarli.png` (depremden sonra)
```
The same Seljuk bathhouse after an earthquake: the large front dome has partly collapsed showing a jagged hole, the small domes are cracked, a few stones have fallen from the left wall and lie at its foot, a zigzag crack runs down the left wall, a little dust in the air. Same camera, size and colors as the intact version.
```

### Han ve dükkânlar · ilham: Zazadin (Sadeddin Köpek) Hanı, Konya

Bu görsel daha geniş bir alana oturur: **3×3 kare** taban (hanın kendisi arkada, önünde bir sıra dükkân).

`han.png`
```
A Seljuk caravanserai (han) on a square base, fortress-like: long thick honey sandstone walls reinforced with round and square buttress towers at regular intervals, a monumental carved portal (taçkapı) in two-color stone with a pointed-arch entrance and muqarnas niche on the right wall, an open inner courtyard visible from above with arcades around it, flat stone roofs. In front of the han's left wall, a row of small market shops with terracotta tile roofs and alternating turquoise and cream striped awnings.
```

`han-hasarli.png` (yangından sonra)
```
The same caravanserai and shops after a fire: blackened scorch marks around the portal and the courtyard, the shop awnings burnt and torn, a collapsed section of one shop roof, thin grey smoke rising from the courtyard, a crack in one buttress. Same camera, size and colors.
```

### Arazi (tarla ambarı) · ilham yok

Tarlalar oyunda çizili kalır; bu görsel tarlanın köşesindeki küçük ambardır. **1×1 kare** taban.

`arazi.png`
```
A small farm granary for wheat fields on a 1×1 square base: stone lower walls, terracotta tile roof, a wooden door, a neat stack of golden wheat sheaves and a wooden cart next to it.
```

`arazi-kurak.png` (kuraklıkta)
```
The same small granary during a drought: the wheat sheaves are few and pale brown, the cart is empty, dry cracked earth patches around the base, the roof tiles dusty. Same camera, size and colors.
```

### Vakıf sandığı (vakfın hazinesi) · ilham yok

Köyün ortasındaki, gelirin toplandığı bina. **2×2 kare** taban.

`sandik.png`
```
A small, stately foundation treasury building in the village center on a square base: cream stone walls with three terracotta brick bands, arched windows, a single lead dome on top, and a large iron-bound wooden chest with gold coins spilling out displayed in front of its door.
```

`sandik-bos.png` (sandık boşken)
```
The same treasury building when the funds are empty: the wooden chest in front stands open and completely empty, the door is shut, cobwebs at a window corner, a slightly gloomy dusty look. Same camera, size and colors.
```

### Aşevi (imaret) · ilham: Orhan Bey Külliyesi, Bursa

**2×2 kare** taban.

`asevi.png`
```
An early Ottoman public soup kitchen (imaret) on a square base: walls in alternating layers of cut stone and red brick (Bursa "almaşık" masonry), a large lead-grey dome, a small portico of three pointed arches on the left wall, two tall brick kitchen chimneys on the right with white cooking smoke, a big copper cauldron visible at the door.
```

`asevi-kapali.png` (sandık boş, aşevi kapalı)
```
The same soup kitchen when it has run out of money: no smoke from the chimneys, the wooden door shut and barred with a plank, the copper cauldron turned upside down by the door, empty clay bowls stacked aside. Same camera, size and colors.
```

### Medrese · ilham: İnce Minareli Medrese, Konya

**2×2 kare** taban.

`medrese.png`
```
A Seljuk madrasa on a square base: cut-stone walls, a large lead dome, and on the left wall a tall, richly carved "baroque" stone portal with interlaced bands and two round medallions around a pointed-arch door. Right next to the portal stands a slender cylindrical brick minaret decorated with turquoise tile bands; its top is broken off and short (it was struck by lightning).
```

`medrese-kapali.png` (sandık boş, medrese kapalı)
```
The same madrasa when it has run out of money: the portal door closed with a chain, a pile of old books tied with string by the door, shutters closed, a few weeds growing at the base of the walls. Same camera, size and colors.
```

### Cami · ilham: Sultan Alâeddin Camii, Konya

**2×2 kare** taban.

`cami.png`
```
A Seljuk mosque on a square base: a long low prayer hall with cut-stone walls, small arched windows and a flat lead-grey roof with one small dome; in front on the left a Seljuk tomb tower (kümbet): an octagonal stone tower with a pointed conical lead roof; at the right corner a cylindrical brick minaret with a stone balcony and a conical lead cap.
```

`cami-kapali.png` (sandık boş, cami bakımsız)
```
The same mosque when the foundation has no money: oil lamps unlit, the door closed, a few roof leads missing, weeds by the walls, a bird nest on the minaret balcony. Same camera, size and colors.
```

### Çeşme · ilham: Hoca Fakih Çeşmesi, Konya

**2×2 kare** taban (çeşme ortada küçük, çevresi taş döşeli meydan).

`cesme.png`
```
A small Seljuk public fountain standing on a square paved stone plaza: a single freestanding wall built in symmetric two-color stone blocks (light and dark), a pointed-arch niche in its center with a brass spout pouring water into a long stone trough below, a small terracotta tile cap on top of the wall, a plane tree branch peeking from behind.
```

`cesme-kuru.png` (sandık boş, çeşme kurumuş)
```
The same fountain when it has run dry: no water from the spout, the stone trough empty with dry leaves inside, moss stains in the niche. Same camera, size and colors.
```

### Şehir genişlemesindeki yeni yapılar

Bunlar haritanın açılan bölgelerine kurulur. Görsel gelene kadar oyunda basit bir geçici çizim görünür. Ortak stil metni aynı; her biri **2×2 kare** taban (köprü **2×1**, kervansaray **3×3**).

`arasta.png` · ilham: Şükran Mescidi zemin kat dükkânları, Konya
```
A row of small market shops (arasta) under one long terracotta tile roof on a rectangular base: three shop fronts with wooden shutters opened up, striped turquoise and cream awnings, baskets of spices, bread and copper pots displayed in front, cut-stone and brick walls.
```

`bedesten.png` · ilham: Cağalzade Bedesteni, Ereğli
```
A covered market hall (bedesten): a solid rectangular cut-stone building with a long barrel vault roof covered in lead, three arched doors with iron-bound wooden gates, small high windows, a few bolts of fabric and a carpet displayed at the main door.
```

`evler.png` · ilham: Samandağ Vakıflı Köyü vakıf evi, Hatay
```
Two small two-story Anatolian village houses side by side in a little walled garden: rough stone lower floor, wooden-framed upper floor, terracotta gabled roofs, small windows with wooden shutters, a fig tree and a well in the garden.
```

`degirmen.png` · ilham: Reyhanlı Yenişehir Değirmeni, Hatay
```
A stone watermill on a riverbank: a long low building with rough stone walls and a vaulted roof, a large wooden water wheel on the right side turning in a small water channel, sacks of flour stacked by the door.
```

`kopru.png` (2×1 taban, nehrin üstünde)
```
A short Ottoman stone bridge with three pointed arches crossing a small river, honey sandstone, a gently humped deck with low parapets, water visible under the arches. Same isometric camera; the bridge runs from the lower left to the upper right.
```

`sarnic.png` · ilham: Hocacihan Sarnıcı, Konya
```
A large underground cistern seen from outside: a low, half-sunken cut-stone structure with a broad shallow dome, a small arched opening with steps going down, a stone water trough beside it, a little grass on the dome.
```

`kervansaray.png` (3×3 taban) · ilham: Kanuni Sultan Süleyman Kervansarayı, Belen
```
An Ottoman roadside caravanserai: a large square stone building with an open courtyard surrounded by arcades, a row of small lead domes along the roof, a tall arched main portal, a camel and a loaded mule resting at the gate.
```

`mektep.png` · ilham: Dolap Mektep Mescidi, Konya
```
A small neighborhood primary school (sıbyan mektebi): a single-room building with whitewashed stone walls, a hipped terracotta tile roof, two arched windows, a wooden door with a small porch, a slate board and a few cushions visible inside the open door.
```

## 3. Teslim

- 1024×1024 **PNG**, şeffaf arka plan. ChatGPT bazen beyaz arka plan verir; o zaman "make the background transparent" deyin.
- Dosya adları yukarıdaki gibi, küçük harf.
- `public/binalar/` klasörüne koyun ya da bana gönderin; webp'ye çevirip yerleştiririm.
- Bir resim yerine tam oturmazsa (biraz büyük, biraz kaymış) `src/sahne/binaResimleri.ts` dosyasındaki `olcek`, `dx`, `dy` sayılarıyla düzeltilir; resmi yeniden çizdirmeye gerek yok.
