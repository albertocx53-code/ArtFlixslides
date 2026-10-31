"""Converte conteudo/*.txt em site/decks.js (200 apresentações de Arte).
Cabeçalho:  # slug | Título | Subtítulo | Área | Tema | estilo | imagem do Wikimedia Commons (opcional)
Slides:     T tópicos · C conceito · B biografia · X comparação · L linha do tempo · Q citação
            O obra em foco · P paleta · A atividade · D debate · R resumo"""
import json, re, glob, os
from urllib.parse import quote

AQUI = os.path.dirname(os.path.abspath(__file__))
ESTILOS = {'abstrato', 'galeria', 'barroco', 'impressao', 'expressao', 'cubo', 'sonho', 'pop', 'bauhaus', 'brasil', 'raiz', 'atelie', 'cena', 'som'}
AREAS = ['Artes Visuais', 'História da Arte', 'Arte Brasileira', 'Música', 'Teatro', 'Dança']

def itens(s): return [x.strip() for x in s.split(' ; ') if x.strip()]

def slide(l):
    k, p = l[0], [x.strip() for x in l[2:].strip().split(' | ')]
    if k == 'T': return {'t': 'topicos', 'titulo': p[0], 'itens': itens(p[1])}
    if k == 'C': return {'t': 'conceito', 'termo': p[0], 'def': p[1], 'ex': p[2] if len(p) > 2 else ''}
    if k == 'B': return {'t': 'bio', 'nome': p[0], 'datas': p[1], 'itens': itens(p[2])}
    if k == 'Q': return {'t': 'citacao', 'texto': p[0], 'autor': p[1], 'obra': p[2] if len(p) > 2 else ''}
    if k == 'D': return {'t': 'debate', 'pergunta': p[0], 'itens': itens(p[1])}
    if k == 'R': return {'t': 'resumo', 'itens': itens(p[0]), 'enem': p[1] if len(p) > 1 else ''}
    if k == 'O':
        o = {'t': 'obra', 'titulo': p[0], 'ficha': itens(p[1]), 'itens': itens(p[2])}
        if len(p) > 3 and p[3]: o['img'] = arquivo(p[3], 1280); o['cred'] = pagina(p[3])
        return o
    if k == 'G':
        obras = []
        for c in itens(p[1]):
            nome, leg = [x.strip() for x in c.split('::', 1)]
            obras.append([arquivo(nome, 900), leg, pagina(nome)])
        assert 2 <= len(obras) <= 4, p[0]
        return {'t': 'galeria', 'titulo': p[0], 'obras': obras}
    if k == 'A': return {'t': 'atividade', 'titulo': p[0], 'materiais': itens(p[1]), 'passos': itens(p[2])}
    if k == 'P':
        cores = []
        for c in itens(p[1]):
            hx, nome = c.split(' ', 1)
            assert re.fullmatch(r'#[0-9A-Fa-f]{6}', hx), c
            cores.append([hx.upper(), nome.strip()])
        return {'t': 'paleta', 'titulo': p[0], 'cores': cores, 'texto': p[2] if len(p) > 2 else ''}
    if k == 'X':
        def col(c):
            nome, its = c.split(':', 1)
            return {'nome': nome.strip(), 'itens': itens(its)}
        return {'t': 'compara', 'titulo': p[0], 'a': col(p[1]), 'b': col(p[2])}
    if k == 'L':
        marcos = []
        for m in itens(p[1]):
            d, t = m.split(':', 1)
            marcos.append([d.strip(), t.strip()])
        return {'t': 'tempo', 'titulo': p[0], 'marcos': marcos}
    raise ValueError(l)

def rotulo(s):
    return s.get('titulo') or s.get('termo') or s.get('nome') or {'citacao': 'Citação', 'debate': 'Debate', 'resumo': 'Para lembrar'}.get(s['t'], '')

def pagina(nome): return 'https://commons.wikimedia.org/wiki/File:' + quote(nome.replace(' ', '_'))

def arquivo(nome, w): return 'https://commons.wikimedia.org/wiki/Special:FilePath/' + quote(nome.replace(' ', '_')) + '?width=' + str(w)

decks = []
for arq in sorted(glob.glob(os.path.join(AQUI, 'conteudo', '*.txt'))):
    for b in re.split(r'\n(?=# )', open(arq, encoding='utf-8').read().strip()):
        ls = [l for l in b.split('\n') if l.strip()]
        cab = [x.strip() for x in ls[0][2:].split('|')]
        assert len(cab) == 7, cab
        slug, titulo, sub, area, tema, estilo, img = cab
        assert estilo in ESTILOS, (slug, estilo)
        assert area in AREAS, (slug, area)
        slides = []
        for l in ls[1:]:
            try: slides.append(slide(l))
            except Exception as e: raise SystemExit(f'{slug}: {l[:70]} -> {e!r}')
        rot = [rotulo(s) for s in slides if s['t'] not in ('citacao', 'resumo', 'debate', 'atividade', 'galeria')][:5]
        abre = [{'t': 'roteiro', 'titulo': 'Nesta aula', 'itens': rot + ['Debate e mãos à obra']}]
        if img:  # aquecimento: leitura guiada da imagem da aula
            abre.append({'t': 'leitura', 'titulo': 'Primeiro olhar', 'itens': ['O que você vê? Liste tudo, sem opinar.', 'Como a imagem está organizada? Cores, formas, luz.', 'O que ela pode significar?', 'Que sensação ela provoca em você?'],
                         'n': 'Dê dois minutos de silêncio para a turma observar antes de abrir a conversa.'})
        slides = abre + slides
        slides.append({'t': 'saida', 'titulo': 'Bilhete de saída', 'itens': ['Uma coisa que aprendi hoje', 'Uma imagem ou som que ficou na memória', 'Uma pergunta que ainda tenho'],
                       'n': 'Peça respostas curtas num papel. Elas mostram o que a turma entendeu e ajudam a planejar a próxima aula.'})
        d = {'slug': slug, 'area': area, 'tema': tema, 'estilo': estilo, 'titulo': titulo, 'sub': sub, 'slides': slides}
        if img:
            d['img'] = arquivo(img, 1280)
            d['cred'] = pagina(img)
        decks.append(d)

IMGS = sorted({d['img'] for d in decks if d.get('img')} | {o[0] for d in decks for x in d['slides'] if x['t'] == 'galeria' for o in x['obras']} | {x['img'] for d in decks for x in d['slides'] if x.get('img')})
open(os.path.join(AQUI, 'imagens.txt'), 'w').write('\n'.join(IMGS) + '\n')
MAPA = os.path.join(AQUI, 'site', 'imagens', 'mapa.json')
if os.path.exists(MAPA):  # usa as cópias locais baixadas por baixa_imagens.py
    loc = json.load(open(MAPA))
    for d in decks:
        if d.get('img') in loc: d['img'] = loc[d['img']]
        for x in d['slides']:
            if x.get('img') in loc: x['img'] = loc[x['img']]
            for o in x.get('obras', []):
                if o[0] in loc: o[0] = loc[o[0]]
assert len(decks) == 200, len(decks)
assert len({d['slug'] for d in decks}) == 200
tot = [len(d['slides']) + 1 for d in decks]
from collections import Counter
print('apresentações:', len(decks), '| slides por apresentação:', min(tot), '-', max(tot), '| total:', sum(tot))
print('por área:', dict(Counter(d['area'] for d in decks)))
print('por estilo:', dict(Counter(d['estilo'] for d in decks)))
print('imagens diferentes:', len(IMGS))
print('com imagem:', sum(1 for d in decks if d.get('img')), '| galerias:', sum(1 for d in decks for x in d['slides'] if x['t'] == 'galeria'))
curtas = [d['slug'] for d in decks if len(d['slides']) + 1 < 10]
if curtas: print('MENOS DE 10:', curtas)
os.makedirs(os.path.join(AQUI, 'site'), exist_ok=True)
open(os.path.join(AQUI, 'site', 'decks.js'), 'w', encoding='utf-8').write('window.DECKS=' + json.dumps(decks, ensure_ascii=False, separators=(',', ':')) + ';\n')
