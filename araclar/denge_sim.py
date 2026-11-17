"""Vakıf Oyunu denge simülasyonu (Python referansı).

TypeScript motoruyla (src/motor) aynı sayıları üretir; katsayı denemek için hızlı yol.
Çalıştır:  python3 araclar/denge_sim.py
BASE = v1 değerleri; V2 = docs/vakif-oyunu-kurallari-v2.md'deki değerler.
"""
import math, itertools, sys
def mulberry32(a):
    a&=0xffffffff
    def r():
        nonlocal a
        a=(a+0x6D2B79F5)&0xffffffff
        t=a
        t=((t^(t>>15))*(t|1))&0xffffffff
        t^=(t+(((t^(t>>7))*(t|61))&0xffffffff))&0xffffffff
        return ((t^(t>>14))&0xffffffff)/4294967296
    return r
BASE=dict(ONARIM=1.1,GERI=1.0,KIS_H=0.5,KIS_TUR=2,GERI_TUR=4,ZIM_P=0.15,ZIM_O=0.6,BEC=1.05,DEP_HAMAM=0.8,DEP_HAN=0.4,YAN_HAN=0.6,HAMAM_G=0.8,HAMAM_B=0.2,HAN_G=0.72,HAN_B=0.07,ARAZI_G=0.36)
def play(cap,K,fon_or=0.2,mut='durust',gider=26,seed=1,policy='bot',log=False):
    s=dict(yil=0,hamam=cap['hamam'],han=cap['han'],arazi=cap['arazi'],nakit=float(cap['nakit']),fon=0.0,g=gider,bos=0,geri=[],kis=0,ev=0,dec=0,rows=[],last=None,bostop=0)
    rng=mulberry32(seed); carp=K['BEC'] if mut=='becerikli' else 1.0
    while True:
        s['yil']+=10
        for gg in s['geri']:
            if gg['kt']>0:
                add=gg['kal'] if gg['kt']==1 else gg['per']
                add=min(add,gg['kal']); s[gg['m']]+=add; gg['kal']-=add; gg['kt']-=1
        half=s['kis']>0
        if s['kis']>0: s['kis']-=1
        r1=rng(); r2=rng(); ev=None
        if mut=='becerikli' and s['fon']>10 and r1<K['ZIM_P']:
            s['fon']-=s['fon']*K['ZIM_O']; s['last']='zimmet'
        for n,c in [('deprem',.09),('yangin',.18),('kuraklik',.24),('savas',.30),('enflasyon',.36)]:
            if r2<c: ev=n;break
        if ev: s['ev']+=1; s['last']=ev
        if ev=='enflasyon': s['nakit']*=0.6; s['fon']*=0.8; s['g']*=1.12
        h=s['hamam']*K['HAMAM_G']; hn=0 if ev=='savas' else s['han']*K['HAN_G']; ar=0 if ev=='kuraklik' else s['arazi']*K['ARAZI_G']
        gelir=(h+hn+ar)*carp; fp=gelir*fon_or; s['fon']+=fp
        bakim=s['hamam']*K['HAMAM_B']+s['han']*K['HAN_B']+s['g']*.05
        kalan=gelir-fp-bakim+s['nakit']*.02
        ger=s['g']*(K['KIS_H'] if half else 1)
        if kalan>=ger: s['bos']=0
        else:
            acik=ger-kalan
            if s['fon']>=acik: s['fon']-=acik; s['bos']=0
            else: s['fon']=0; s['bos']+=1; s['bostop']+=1
        dec=None
        if ev in ('deprem','yangin'):
            hh=math.floor(s['hamam']*K['DEP_HAMAM']) if ev=='deprem' else 0
            hn2=math.floor(s['han']*(K['DEP_HAN'] if ev=='deprem' else K['YAN_HAN']))
            tot=hh+hn2
            if tot>0:
                bed=tot*K['ONARIM']; s['dec']+=1
                if policy=='kis': ch='kis'
                elif policy=='nakitsiz': ch='fon' if s['fon']>=bed else 'kis'
                else: ch='fon' if s['fon']>=bed else ('nakit' if s['nakit']>0 else 'kis')
                dec=ch
                if ch=='fon': s['fon']-=bed
                elif ch=='nakit':
                    sp=min(s['nakit'],bed); s['nakit']-=sp; o=sp/bed
                    s['hamam']=math.floor(s['hamam']-hh+hh*o); s['han']=math.floor(s['han']-hn2+hn2*o)
                else:
                    s['hamam']-=hh; s['han']-=hn2; s['kis']=K['KIS_TUR']
                    for m,d in (('hamam',hh),('han',hn2)):
                        dd=math.floor(d*K['GERI'])
                        if dd>0: s['geri'].append(dict(m=m,per=dd//K['GERI_TUR'],kt=K['GERI_TUR'],kal=dd))
        if log: s['rows'].append((s['yil'],ev,dec,round(gelir,2),round(kalan,2),round(s['fon'],2),s['hamam'],s['han'],round(s['nakit'],2),s['bos']))
        if s['bos']>=3: return False,s
        if s['yil']>=600: return True,s
D=dict(hamam=30,han=30,arazi=25,nakit=15)
HEAVY={'hamam':dict(hamam=70,han=8,arazi=7,nakit=15),'han':dict(hamam=8,han=70,arazi=7,nakit=15),'arazi':dict(hamam=8,han=7,arazi=70,nakit=15)}
SEEDS=range(1,1001)
def rate(K,cap=D,**kw):
    return 100*sum(play(cap,K,seed=s,**kw)[0] for s in SEEDS)/len(SEEDS)
def report(K):
    r={}
    r['dengeli']=rate(K)
    for k,c in HEAVY.items(): r[k]=rate(K,c)
    r['fon0']=rate(K,fon_or=0); r['fon40']=rate(K,fon_or=0.4)
    r['becerikli']=rate(K,mut='becerikli')
    r['medrese']=rate(K,gider=22); r['cesme']=rate(K,gider=12)
    r['kisan']=rate(K,policy='kis')
    return r
def ok(r):
    return (r['dengeli']>max(r['hamam'],r['han'],r['arazi'])+2 and r['fon0']<r['dengeli']<r['fon40']
            and r['becerikli']<r['dengeli']-5 and r['dengeli']<r['medrese']<=r['cesme'] and r['kisan']<r['dengeli']-8)

V2 = dict(BASE, ONARIM=0.9, GERI=0.85)

if __name__ == '__main__':
    for ad, K in (('v1', BASE), ('v2', V2)):
        r = report(K)
        print(ad, {k: round(v) for k, v in r.items()}, 'dersler doğru' if ok(r) else 'DERS BOZUK')
