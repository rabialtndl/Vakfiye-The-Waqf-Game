"""ChatGPT'den gelen durum görselini oyuna hazırlar.

Kullanım:  python3 scripts/durum_gorseli.py <indirilen.png> <ad>
  ad: han-yangin | han-yanik | han-yikik | han-salgin | hamam-yikik | arasta-yangin | arazi-kurak
Görseli bölgenin haritadaki boyutuna getirir, public/durumlar/<ad>.webp olarak kaydeder.
"""
import sys
from PIL import Image

BOLGE = {'han': (1030, 125, 1425, 398), 'hamam': (873, 368, 1092, 522), 'arasta': (990, 300, 1478, 528), 'arazi': (0, 78, 215, 338)}

kaynak, ad = sys.argv[1], sys.argv[2]
x1, y1, x2, y2 = BOLGE[ad.split('-')[0]]
# Haritadan 2 kat büyük kaydedilir: yakın kadrajda (kamera odaklanınca) keskin kalsın.
w, h = (x2 - x1) * 2, (y2 - y1) * 2
Image.open(kaynak).convert('RGB').resize((w, h), Image.LANCZOS).save(f'public/durumlar/{ad}.webp', quality=85)
print(f'public/durumlar/{ad}.webp  {w}x{h}')
