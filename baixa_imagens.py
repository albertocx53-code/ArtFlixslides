"""Baixa as imagens do Wikimedia Commons listadas em imagens.txt para site/imagens/
e grava site/imagens/mapa.json. Depois rode parse.py: as aulas passam a usar as cópias locais.
Usa miniaturas em tamanhos padrão (como o Wikimedia pede) e respeita o limite de pedidos."""
import json, os, hashlib, subprocess, io, time, urllib.parse, re
from PIL import Image
Image.MAX_IMAGE_PIXELS = None
AQUI = os.path.dirname(os.path.abspath(__file__))
PASTA = os.path.join(AQUI, 'site', 'imagens'); os.makedirs(PASTA, exist_ok=True)
MAPA = os.path.join(PASTA, 'mapa.json')
UA = 'ArtFlixSlides/1.0 (educational slides for teachers)'
mapa = json.load(open(MAPA)) if os.path.exists(MAPA) else {}
urls = [u.strip() for u in open(os.path.join(AQUI, 'imagens.txt')) if u.strip()]
def baixa(u):
    r = subprocess.run(['curl', '-sS', '-L', '-m', '120', '-A', UA, '-D', '-', '-o', '/tmp/_img', '-w', '%{http_code}', u], capture_output=True, text=True)
    cod = r.stdout[-3:]; ra = re.findall(r'(?i)retry-after:\s*(\d+)', r.stdout)
    return cod, (int(ra[-1]) if ra else 0)
def miniatura(nome, w):
    n = nome.replace(' ', '_'); h = hashlib.md5(n.encode()).hexdigest(); q = urllib.parse.quote(n)
    ext = '.png' if n.lower().endswith(('.tif', '.tiff')) else ''
    return f'https://upload.wikimedia.org/wikipedia/commons/thumb/{h[0]}/{h[:2]}/{q}/{w}px-{q}{ext}'
def original(nome):
    n = nome.replace(' ', '_'); h = hashlib.md5(n.encode()).hexdigest()
    return f'https://upload.wikimedia.org/wikipedia/commons/{h[0]}/{h[:2]}/{urllib.parse.quote(n)}'
falhas = []
for u in urls:
    if u in mapa and os.path.exists(os.path.join(AQUI, 'site', mapa[u])): continue
    nome = urllib.parse.unquote(u.split('Special:FilePath/')[1].split('?')[0])
    w = 1280 if 'width=1280' in u else 960
    im = None
    for alvo in [miniatura(nome, w), miniatura(nome, 960 if w == 1280 else 500), original(nome)]:
        for tentativa in range(3):
            cod, ra = baixa(alvo)
            if cod == '429': print('espera', ra or 60, flush=True); time.sleep(min(ra or 60, 900)); continue
            break
        if cod == '200':
            try: im = Image.open('/tmp/_img'); im.load(); break
            except Exception: im = None
        time.sleep(2)
    arq = hashlib.sha1(u.encode()).hexdigest()[:12] + '.jpg'
    if im is None: falhas.append(nome); print('FALHOU', cod, nome, flush=True); continue
    if im.mode != 'RGB': im = im.convert('RGB')
    im.thumbnail((w, w)); im.save(os.path.join(PASTA, arq), 'JPEG', quality=82, optimize=True, progressive=True)
    mapa[u] = 'imagens/' + arq; json.dump(mapa, open(MAPA, 'w'), indent=0)
    print('ok', len(mapa), nome[:70], flush=True)
    time.sleep(2)
print(len(mapa), 'imagens locais;', len(falhas), 'falhas', flush=True)
for f in falhas: print(' -', f)
