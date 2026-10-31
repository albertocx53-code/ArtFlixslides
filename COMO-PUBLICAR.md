# ArtFlix Slides — como publicar

Plataforma com **200 aulas de Arte** (10 a 13 slides cada, 2.221 slides no total), em **13 estilos artísticos**:
Galeria, Barroco, Impressionista, Expressionista, Cubista, Surrealista, Pop Art, Bauhaus, Cordel, Raízes, Ateliê, Palco e Música.

## O que o professor pode fazer
- **Apresentar** em tela cheia (setas do teclado, toque no celular, `G` mostra todos os slides, `N` mostra a nota do professor).
- **Editar** qualquer aula: textos, ordem dos slides, estilo artístico, imagens (link ou enviada do computador).
- **Criar** aulas novas do zero ou duplicando uma pronta.
- **Baixar em PowerPoint** (editável, com as cores e formas do estilo) ou **salvar em PDF** (botão PDF → "Salvar como PDF").
- As edições ficam salvas no navegador. No rodapé há "Baixar backup" e "Importar backup" para levar para outro computador.

## Publicar (site estático, sem servidor)
A pasta `site/` é o site inteiro: `index.html`, `app.css`, `app.js`, `decks.js`.

**Netlify (mais fácil):** entre em app.netlify.com → "Add new site" → "Deploy manually" → arraste a pasta `site`.
**Vercel / GitHub Pages:** suba a pasta `site` num repositório e publique como site estático (sem build).

Depois cole o link na entrega da Wiven.

## Alterar o conteúdo
Os textos estão em `conteudo/*.txt` (formato explicado no topo de `parse.py`). Depois de editar, rode:

    python3 parse.py

Isso gera de novo `site/decks.js`.

## Imagens
As capas usam obras do Wikimedia Commons (domínio público ou licença livre), com link de autor e licença em cada aula e na página "Créditos das imagens". Confira as imagens depois de publicar: se alguma não carregar, a moldura fica vazia e você pode trocar no editor.
