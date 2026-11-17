"""Yürünebilir yol ağını haritadan üretir: src/sahne/npc/yolAgi.json

Yöntem: haritadaki kaldırım rengi (açık bej taş) maskelenir, binaların alanları (harita.ts'deki BINA/HAYRAT/ARSA
çokgenleri + EK_YASAK) ve nehir çıkarılır. Elle seçilen düğümler arasındaki her kenar, bu maske üzerinde
yol ortasına yakın en kısa yol (Dijkstra) ile çizilir ve sadeleştirilir. Böylece kenarlar kaldırımda kalır.

Kullanım:  python3 scripts/yol_agi.py [kontrol.png]
Düğüm eklemek/taşımak için aşağıdaki DUGUMLER ve KENARLAR listesini düzenleyin, betiği yeniden çalıştırın.
"""
import json, sys, re
import cv2, numpy as np
from skimage.graph import route_through_array
from skimage.measure import approximate_polygon

KOK = __file__.rsplit('/scripts/', 1)[0]
im = cv2.imread(f'{KOK}/public/harita.webp')
H, W = im.shape[:2]

# ---------- yürünebilir maske ----------
b = cv2.GaussianBlur(im, (9, 9), 0)
hsv = cv2.cvtColor(b, cv2.COLOR_BGR2HSV).astype(int)
h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
yol = ((h >= 11) & (h <= 24) & (s >= 55) & (s <= 175) & (v >= 185)).astype(np.uint8)
yol = cv2.morphologyEx(yol, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
yol = cv2.morphologyEx(yol, cv2.MORPH_CLOSE, np.ones((13, 13), np.uint8))

# harita.ts'deki çokgenler
kaynak = open(f'{KOK}/src/sahne/harita.ts').read()
def cokgenler(blok):
    m = re.search(blok + r'[^=]*=\s*\{(.*?)\n\}', kaynak, re.S)
    out = {}
    for ad, govde in re.findall(r'\n\s*(\w+):\s*(D\([^)]*\)|\[\[.*?\]\]),', m.group(1)):
        if govde.startswith('D('):
            x1, y1, x2, y2 = map(float, govde[2:-1].split(','))
            out[ad] = [(x1, y1), (x2, y1), (x2, y2), (x1, y2)]
        else:
            out[ad] = [tuple(map(float, p)) for p in re.findall(r'\[([\d.]+),\s*([\d.]+)\]', govde)]
    return out
# harita.ts'deki bazı alanlar dikdörtgen ve kaba; yürüme için resimdeki gerçek tabana göre daraltılır.
YASAK_DUZELTME = {
    # minarenin gövdesi resimde çarşı yolunun önüne uzanır; yalnız binanın tabanı yasak
    'HAYRAT_ALANI.medrese': [(1088, 545), (1345, 545), (1345, 705), (1088, 705)],
    # hamamın sol üst köşesi izometrik: türbe ile hamam arasında meydandan kuzeye geçit var
    'BINA_ALANI.hamam': [(877, 427), (940, 392), (1000, 368), (1092, 368), (1092, 522), (877, 522)],
    'ARSA_ALANI.c3': [(805, 215), (900, 215), (900, 366), (805, 366)],
}
yasak = np.zeros((H, W), np.uint8)
YASAK_ALANLAR = {}
for blok in ('HAYRAT_ALANI', 'BINA_ALANI', 'ARSA_ALANI'):
    for ad, p in cokgenler(blok).items():
        if ad in ('arazi', 'sandik'):  # tarla ve sandık binası kendi alanında; yol değil zaten
            pass
        p = YASAK_DUZELTME.get(f'{blok}.{ad}', p)
        YASAK_ALANLAR[f'{blok}.{ad}'] = p
        cv2.fillPoly(yasak, [np.array(p, np.int32)], 1)

# Nehrin üstündeki köprü tablası serbest bırakılır (yalnız köprü düğümleri arası).
KOPRU = [(55, 560), (250, 548), (350, 570), (480, 630), (480, 680), (420, 668), (330, 612), (240, 590), (55, 604)]
# Nehir: turkuaz-mavi su rengi (renkten bulunur), biraz genişletilir ki kıyıya da yaklaşılmasın.
nh = ((h >= 80) & (h <= 110) & (s >= 60) & (v >= 90)).astype(np.uint8)
nh = cv2.morphologyEx(nh, cv2.MORPH_OPEN, np.ones((7, 7), np.uint8))
n_, l_, st_, _ = cv2.connectedComponentsWithStats(nh)
nehir = np.zeros((H, W), np.uint8)
for j in range(1, n_):
    if st_[j, cv2.CC_STAT_AREA] > 3000: nehir[l_ == j] = 1
nehir = cv2.dilate(nehir, np.ones((15, 15), np.uint8))
kopru = np.zeros((H, W), np.uint8)
cv2.fillPoly(kopru, [np.array(KOPRU, np.int32)], 1)
nehir[kopru > 0] = 0

# Evler (aşağı mahalle): kiremit çatılar ve çatının hemen altındaki duvar şeridi. Çarşının tenteleri karışmasın diye yalnız y > 560.
cati = ((h >= 3) & (h <= 16) & (s >= 150) & (v >= 90) & (v <= 205)).astype(np.uint8)
cati = cv2.morphologyEx(cati, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
n_, l_, st_, _ = cv2.connectedComponentsWithStats(cati)
evler = np.zeros((H, W), np.uint8)
for j in range(1, n_):
    if st_[j, cv2.CC_STAT_AREA] > 400: evler[l_ == j] = 1
duvar = evler.copy()
for k in range(1, 22):
    duvar[k:] |= evler[:-k]
duvar[:560] = 0
yasak |= cv2.dilate(duvar, np.ones((5, 5), np.uint8))

yurunur = (yol > 0) & (yasak == 0) & (nehir == 0)
yurunur |= (kopru > 0)
yurunur = cv2.erode(yurunur.astype(np.uint8), np.ones((3, 3), np.uint8))
mesafe = cv2.distanceTransform(yurunur, cv2.DIST_L2, 5)
gecilmez = ((yasak > 0) | (nehir > 0)) & (kopru == 0)
# maliyet: yolun ortası ucuz, kenarı pahalı; kaldırım olmayan (gölge, çimen kenarı) pahalı; bina ve nehir geçilmez
maliyet = np.where(yurunur > 0, 1.0 + 6.0 / (1.0 + mesafe), 60.0)
maliyet[gecilmez] = 1e6
maliyet = maliyet.astype(np.float64)

# ---------- düğümler ----------
# ad: (x, y, etiketler).  Etiketler: giris (belirip kaybolma), dur:<yer> (duraklama noktası), kopru
DUGUMLER = {
    'koy_yolu':      (70, 582, ['giris']),
    'kopru_orta':    (240, 566, ['kopru']),
    'kopru_dogu':    (452, 640, ['kopru']),
    'mahalle_bati':  (430, 720, ['giris']),
    'asevi_onu':     (612, 585, ['dur:asevi']),
    'asevi_dogu':    (760, 560, []),
    'meydan_bati':   (775, 425, []),
    'meydan':        (838, 470, []),
    'turbe_onu':     (772, 362, ['dur:cami']),
    'turbe_dogu':    (900, 398, []),
    'hamam_kuzey':   (965, 345, []),
    'kuzey_yol':     (1000, 250, ['dur:han']),
    'kervan_yolu':   (1040, 150, ['giris']),
    'cesme_onu':     (858, 672, ['dur:cesme']),
    'hamam_guney':   (1000, 588, ['dur:hamam']),
    'carsi_bati':    (1100, 448, []),
    'carsi_orta':    (1215, 490, ['dur:pazar']),
    'carsi_dogu':    (1415, 585, ['dur:pazar']),
    'cami_kapisi':   (1132, 790, ['dur:cami']),
    'mahalle_guney': (1145, 1010, ['giris']),
    'cesme_guney':   (840, 715, []),
    'ev_onu':        (760, 800, ['dur:mahalle']),
    'mahalle_orta':  (660, 860, []),
    'mahalle_alt':   (625, 1010, ['giris']),
}
# (a, b, kaldırım dışı payı): toprak yol gibi kaldırım rengi olmayan kenarlarda pay büyütülür.
KENARLAR = [
    ('koy_yolu', 'kopru_orta'), ('kopru_orta', 'kopru_dogu'), ('kopru_dogu', 'asevi_onu'), ('kopru_dogu', 'mahalle_bati', 0.45),
    ('asevi_onu', 'asevi_dogu'), ('asevi_dogu', 'meydan'), ('asevi_dogu', 'cesme_onu'), ('meydan', 'meydan_bati'),
    ('meydan_bati', 'turbe_onu'), ('meydan', 'turbe_dogu', 0.3), ('turbe_dogu', 'hamam_kuzey', 0.3), ('hamam_kuzey', 'kuzey_yol'),
    ('kuzey_yol', 'kervan_yolu'), ('cesme_onu', 'hamam_guney'), ('hamam_guney', 'carsi_bati'), ('carsi_bati', 'carsi_orta'),
    ('carsi_orta', 'carsi_dogu'), ('hamam_guney', 'cami_kapisi'), ('cami_kapisi', 'mahalle_guney'),
    ('cesme_onu', 'cesme_guney', 0.25), ('cesme_guney', 'ev_onu', 0.25), ('ev_onu', 'mahalle_orta', 0.7), ('mahalle_orta', 'mahalle_alt', 0.7),
]

def yapistir(x, y):
    """Düğümü en yakın yürünebilir ve yolun ortasına yakın piksele taşı."""
    best = None
    for dy in range(-50, 51, 2):
        for dx in range(-50, 51, 2):
            X, Y = int(x + dx), int(y + dy)
            if 0 <= X < W and 0 <= Y < H and yurunur[Y, X]:
                sk = (dx * dx + dy * dy) ** 0.5 - 1.5 * min(mesafe[Y, X], 8)
                if best is None or sk < best[0]:
                    best = (sk, X, Y)
    if best is None:
        print(f'UYARI: düğüm yolda değil: {(x, y)}')
        return None
    return best[1], best[2]

dugum = {}
for ad, (x, y, et) in DUGUMLER.items():
    r = yapistir(x, y)
    if r is None:
        continue
    X, Y = r
    dugum[ad] = {'x': X, 'y': Y, 'etiket': et}

kenar = []
for kn in KENARLAR:
    a, c = kn[0], kn[1]
    pay = kn[2] if len(kn) > 2 else 0.12
    if a not in dugum or c not in dugum:
        continue
    pa, pc = dugum[a], dugum[c]
    yolu, top = route_through_array(maliyet, (pa['y'], pa['x']), (pc['y'], pc['x']), fully_connected=True, geometric=True)
    if top >= 1e6 or (maliyet[tuple(np.array(yolu).T)] >= 60).mean() > pay:
        print('UYARI: yol bulunamadı ya da çoğu kaldırım dışı', a, c, round(float((maliyet[tuple(np.array(yolu).T)] >= 60).mean()),2)); continue
    pts = np.array([(px, py) for py, px in yolu], float)
    sade = approximate_polygon(pts, tolerance=4.0)
    print(f'  {a:>14} → {c:<14} {len(yolu):4d} px, kaldırım dışı %{100*(maliyet[tuple(np.array(yolu).T)] >= 60).mean():.0f}')
    kenar.append({'a': a, 'b': c, 'noktalar': [[int(round(x)), int(round(y))] for x, y in sade]})

json.dump({'kaynak': 'scripts/yol_agi.py', 'dugumler': dugum, 'kenarlar': kenar}, open(f'{KOK}/src/sahne/npc/yolAgi.json', 'w'), ensure_ascii=False, indent=1)
print(len(dugum), 'düğüm', len(kenar), 'kenar')

if len(sys.argv) > 1:
    ov = im.copy()
    ov[yurunur > 0] = (ov[yurunur > 0] * 0.65 + np.array([255, 0, 255]) * 0.35).astype(np.uint8)
    ov[nehir > 0] = (ov[nehir > 0] * 0.7 + np.array([255, 120, 0]) * 0.3).astype(np.uint8)
    for k in kenar:
        cv2.polylines(ov, [np.array(k['noktalar'], np.int32)], False, (0, 0, 255), 3)
    for ad, d in dugum.items():
        cv2.circle(ov, (d['x'], d['y']), 7, (0, 255, 255), -1)
        cv2.putText(ov, ad, (d['x'] + 8, d['y'] - 6), 0, 0.45, (0, 0, 0), 2)
    cv2.imwrite(sys.argv[1], ov)
