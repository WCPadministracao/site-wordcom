# Página de links WordCom

Rota local: `/bio`. Página para visitantes do Instagram acessarem os cinco canais da agência.
Implementação em `src/app/bio/page.tsx`, estilos isolados em `bio.module.css`, e o fundo é
gerado por `scripts/gera-fundo-bio.py`.

## A marca é o fundo

O dono pediu que a logo ocupasse o fundo inteiro e entregou um banner 16:9 (1672x941).
O banner **não serve cru**, por duas razões medidas:

- o pior pixel dele tem luminância 1,0 — é o próprio wordmark branco. Texto `#f6f4f8`
  em cima dele daria 1,05:1;
- num celular, `background-size: cover` escala pela altura e corta na horizontal. O
  wordmark ocupa 65% da largura da arte, então ele sai cortado ao meio. Nenhuma
  `background-position` resolve: a palavra é larga demais.

Por isso o fundo é um **retrato gerado a partir do banner**: a marca inteira no alto,
ocupando 80% da largura, e a mesma noite estrelada descendo pela **página inteira**. Só os
últimos 200px do arquivo morrem na cor base, caso alguma viewport seja mais alta que o
desenho; as bordas laterais fazem o mesmo na horizontal, então o arquivo serve em qualquer
largura sem mostrar emenda. Em telas largas ele vira um palco de 540px centrado.

### Dois defeitos que o céu aberto revelou

Enquanto tudo abaixo do lockup era esmagado até preto chapado, dois problemas ficavam
escondidos. Ao abrir o céu, apareceram:

1. **A faixa que se repete clonava letras.** Ela era cortada dos últimos 300px do banner,
   que ainda contêm o pé do wordmark e o descritor — pedaços de letra viajavam página
   abaixo. Agora é cortada abaixo da base do lockup: céu puro, mediana 0,0064 e p95 0,0513.
2. **A nebulosa repetia como padrão.** O mesmo bloom roxo voltava a cada período da faixa
   espelhada. Além de feio, é mentira: a luz vem da marca, no topo, e tem de se apagar
   conforme desce. O brilho difuso agora decai com a profundidade e as estrelas ficam — a
   separação é feita antes do teto, onde a nebulosa (0,01–0,05) e as estrelas (0,1–0,73)
   ainda se distinguem.

### O teto de luminância

Sobre o céu correm só dois elementos: o rodapé (12px) e o fio dos cartões. O texto dos
cartões não entra na conta, porque o preenchimento deles é opaco e tapa o céu — esse é o
segundo trabalho que o preenchimento faz.

O teto é **0,060**, e não 0,080 que seria o limite teórico do rodapé, porque a compressão
WebP **levanta** pixels: a 0,080 o arquivo salvo media 0,0931 no pior pixel e o rodapé caía
para 4,25:1. Quem manda é o número medido depois de salvar.

Como o p95 do céu é 0,0513, mesmo 0,060 só corta o núcleo das estrelas mais fortes.

Medido na página montada, que é melhor que o pior caso do arquivo porque o decaimento
escurece justamente essas faixas:

| Elemento | Pior pixel atrás | Contraste | Piso |
| --- | --- | --- | --- |
| Assinatura e títulos `#f6f4f8` | 0,0725 | 7,83:1 | 3:1 |
| Rodapé `#c9c2d6` | 0,0125 | 9,73:1 | 4,5:1 |
| Fio dos cartões `#9d97a9` | 0,0306 | 4,61:1 | 3:1 |

| Papel | Valor |
| --- | --- |
| Base | `#0a0710` |
| Texto | `#f6f4f8` |
| Apoio fora dos cartões | `#c9c2d6` (lavanda, nunca cinza) |
| Tinta sobre superfície clara | `#140f1c` |
| Fundo | `/marca/bio-fundo.webp`, 1080x4600, 82 KB |
| Master da marca | `scripts/fonte/wordcom-banner.webp`, 55 KB, fora de `public/` |
| Largura do conteúdo | `416px` |

A rampa do teto termina **antes** de o conteúdo começar: ela chega a 0,060 em `y=705` e o
conteúdo começa em `0,700 × 1080 = 756`. Com a rampa longa que havia antes, a assinatura
caía sobre céu ainda a 0,41 de luminância e media 2,07:1 — reprovava. O script falha se
essa ordem se inverter.

## Os cartões

O comportamento veio da referência enviada pelo dono (`edu.koko.ag/links`): blocos de cor
chapada, canto reto, seta à direita, e o hover que escurece o bloco e o levanta. O tamanho
também: 120px, sem ícone, com título grande e um parágrafo. Cartão de 70px com ícone à
esquerda é item de Linktree vestido de cor, e foi o que o dono chamou de feio.

**A cor saiu a pedido dele.** Houve duas tentativas coloridas, e as duas falharam:

1. escurecer cada tom da marca até o texto passar no contraste — virou lama (`#a7366f`,
   `#a32a93`, magentas sem convicção);
2. usar o gradiente em valor cheio, resolvendo contraste pela tinta — ficou tecnicamente
   correto e carnavalesco para uma agência.

Sem cor, o único eixo que sobra é a luminância, e aí a conta muda de forma.

### Por que os blocos são de contorno, e não escuros

O reflexo seria dar aos blocos uma superfície escura discreta. Medido, não funciona sobre
este fundo:

| Superfície | Contra o fundo `#0a0710` |
| --- | --- |
| `#14101c` | 1,07:1 |
| `#1b1624` | 1,13:1 |
| `#262030` | 1,27:1 |

Nenhum aparece, e um fio a 16% de papel só chega a 1,8:1 — abaixo do piso de 3:1 para
elemento não-textual. É o mesmo motivo que já havia derrubado o cartão preto na versão
colorida: na referência o bloco preto funciona porque o fundo dela é papel.

Então quem define o bloco é o **fio**, calculado contra o céu e não contra preto: `#9d97a9`
é o tom mínimo que dá 3:1 sobre o pior pixel do fundo. Ele tinge de lavanda, não de cinza
neutro — é o matiz da marca que sobra quando a cor sai.

Na versão em que o fundo terminava em preto chapado esse mínimo era `#605b69`. Ao abrir o
céu, o fio teve de subir junto: é o mesmo cálculo com outro fundo.

| Bloco | Fundo | Hover | Fio | Título | No hover | Apoio |
| --- | --- | --- | --- | --- | --- | --- |
| Contorno (4×) | `#15111d` | `#26212e` | `#9d97a9` → `#b7b2c0` | 17,01:1 | 14,09:1 | 5,36:1 |
| Sólido (o site) | `#f4f2f6` | `#e4e2e6` | — | 16,93:1 | 14,64:1 | 5,27:1 |

O destaque do site é o único bloco sólido: o peso dele vem da inversão. A cor da marca
sobrevive em dois lugares só — a própria logo, no fundo, e o fio do rodapé. Numa página de
agência isso basta.

A copy das descrições foi medida, não só escrita: todas fecham em duas linhas a 390px, e os
cinco cartões saem com 120px exatos.

### O vidro

O dono mandou um componente de *liquid glass* (shadcn + Tailwind) para substituir os
botões. Ele **não roda neste projeto como veio**, e isso foi verificado antes de escrever
qualquer linha:

- o Tailwind está no `postcss.config.mjs` mas **nenhum arquivo o importa** — classe
  utilitária não gera CSS, e o componente sairia sem estilo nenhum. A mesma armadilha já
  está documentada em comentário no `tubelight-navbar.tsx`;
- `src/lib/utils.ts` existe, mas contém os **dados das cartas de projeto**, não o helper
  `cn` do shadcn. O `import { cn } from "@/lib/utils"` quebra na compilação;
- faltam `@radix-ui/react-slot`, `class-variance-authority`, `clsx` e `tailwind-merge`.

Então o **visual** foi portado para o idioma do projeto — CSS Module, como o navbar —
mantendo os links, as descrições e a estrutura. Nada foi instalado.

**A distorção líquida é Chromium.** Medido no navegador:
`CSS.supports('-webkit-backdrop-filter','url("#x")')` devolve `false`, e é o prefixo que o
Safari e o iOS usam — o navegador interno do Instagram no iPhone não a renderiza. Por isso
ela está isolada num `@supports` e a regra base usa `blur(16px) saturate(150%)`, que roda
em todo lugar.

Comparei os dois lado a lado no navegador: **sobre um céu estrelado a distorção quase não
aparece.** O visual não depende dela — é bônus de quem tem, não o que o sustenta.

#### A opacidade é medida, não escolhida

Com preenchimento translúcido o céu passa **através** do cartão, e o contraste do texto
deixa de ser fixo. O pior pixel do céu sob os cartões é `rgb(120,60,131)`.

| Alfa do vidro escuro | Título | Apoio |
| --- | --- | --- |
| 0,45 | 11,77:1 | 3,71:1 — reprova |
| 0,55 | 13,10:1 | 4,13:1 — reprova |
| 0,65 | 14,45:1 | 4,55:1 — no limite |
| **0,70** | **~15:1** | **~4,8:1** |

No destaque, com tinta escura em cima, o mínimo é 0,88; está em 0,92.

#### O aro de luz entra na conta

O brilho interno do aro clareia o miolo — que é onde o texto corre — e **reduz** o
contraste. A 0,05 de branco ele derrubava o apoio de 4,76 para 4,16:1, reprovando. Ficou em
0,04, e o apoio subiu de `#8d8798` para `#988ca3`: o tom mais tingido que ainda dá 4,68:1
sobre o pior pixel composto, e 5,87:1 sobre o céu típico.

| Composto no pior caso | Título | Apoio |
| --- | --- | --- |
| Escuro `#33203b` | 13,59:1 | 4,68:1 |
| Claro, com o aro a 30% | 16,12:1 (tinta) | 5,75:1 |

#### A cor entra pelo aro e pelo halo

O dono pediu "pegada de cor minimalista, roxo e laranja". Preencher o bloco de cor já havia
falhado duas vezes — e, com vidro, falha por um motivo novo: o miolo é onde o texto corre, e
restavam só **0,18 de folga** no contraste do apoio. Qualquer tinta que clareie o miolo come
essa folga.

Por isso a tinta do **preenchimento** respeita o orçamento de luminância do neutro
(`#0a0710`, L = 0,00254) e fica quase preta — tinge o material sem pesar. A cor que se vê
vem do **aro e do halo**, que não ficam atrás de texto nenhum e podem ser cor cheia.

| Tinta | Cor | Composto no pior caso | Título | Apoio |
| --- | --- | --- | --- | --- |
| Neutro | `#0a0710` | `#33203b` | 13,59:1 | 4,74:1 |
| Roxo | `#120023` | `#391b47` | 13,49:1 | 4,71:1 |
| Laranja | `#0e0700` | `#362030` | 13,65:1 | 4,76:1 |

O apoio é um só para os três, achado sobre o **pior** dos compostos: `#9b8ca8`.

A luz de cima do aro fica branca nos dois tons — é ela que lê como vidro. A cor entra na
borda de baixo, como se o bloco apanhasse o reflexo da marca.

**A atribuição tem significado:** roxo nos canais (Instagram, TikTok, portfólio), laranja no
contato. Duas cores com uma função cada, não cinco cores decorativas — foi a versão de cinco
que o dono chamou de feia. O destaque do site segue claro e neutro: o peso dele vem da
inversão.

#### O que mudou de decisão

O canto deixou de ser reto. A 0 de raio o brilho de borda vira um "L" nos cantos e denuncia
que é `box-shadow`, não material — o vidro pede 18px. Isso contraria o canto reto que veio
da referência da Koko; é troca consciente, pedida pelo dono.

E "glass/blur decorativo" está na lista de defaults a recusar do `CLAUDE.md`. O pedido do
dono reconquista, como o próprio craft-floor prevê. Fica o registro.

**Custo:** são cinco elementos com `backdrop-filter` simultâneos, que é trabalho de GPU a
cada quadro. Não foi medido em aparelho real — vale conferir a rolagem num celular de
entrada antes de publicar.

### Movimento

Verificado no computado, não só no CSS:

| | Valor |
| --- | --- |
| Entrada | 250 ms `cubic-bezier(0.23, 1, 0.32, 1)` |
| Saída | 160 ms, na regra base — saída mais rápida que entrada |
| Hover no bloco | `translateY(-2px)` e a cor escurecida |
| Hover na seta | `translateX(4px)` |
| Toque | `:active` volta a `translateY(0)` com a cor escurecida |

Só `transform` e `background-color` animam. `prefers-reduced-motion` desliga transição e
transform. O hover fica atrás de `@media (hover: hover) and (pointer: fine)` — abaixo de
768px o painel do navegador emula toque, então o teste de hover tem de rodar em largura de
desktop, ou o resultado é falso-negativo.

### A assinatura

"A última palavra em comunicação." é o `h1` **visível** da página, não mais um parágrafo
decorativo. A logo está no fundo, em imagem, então quem carrega a hierarquia é a frase.
Ela subiu de 27 para 40px no máximo do clamp, a pedido do dono — e porque, com a marca logo
acima, 27px ficava sendo legenda de imagem. O nome da marca entra como texto só para leitor
de tela, no começo do `h1`.

### O que não veio da referência

A referência põe um kicker em caixa alta acima de cada título (`CURSO · NO KAMPUS`). Isso é
ban absoluto no piso de craft deste projeto — o título carrega o próprio peso. Ficaram
título e descrição.

## Tipografia

**Tudo na fonte padrão do site, a Montserrat.** Assinatura, títulos e descrições.

A página passou por uma ida e volta aqui, e o registro fica porque ela custou ajuste nos
dois sentidos.

A referência enviada pelo dono (`edu.koko.ag`) usa três fontes, identificadas no computado
do site dela e não pela imagem: **Fraunces** nos títulos (peso 500, −0,3px em 20px),
**Archivo** no corpo e **JetBrains Mono** no kicker. Eu havia recusado a serifa, argumentando
que ela brigaria com o wordmark geométrico logo acima; o dono pediu a fonte explicitamente e
a decisão foi dele. Depois, o supervisor dele pediu que todas as escritas voltassem para a
fonte padrão do site, e é onde estamos.

**A lição que vale guardar:** os valores de tracking e entrelinha **não** são
intercambiáveis entre as duas.

| | Com a serifa | Com a geométrica |
| --- | --- | --- |
| Assinatura | −0,022em / 1,12 | **−0,038em / 1,08** |
| Título | peso 500 / −0,015em | **peso 650 / −0,028em** |

Herdar os valores da serifa deixaria a Montserrat leve e larga; o contrário deixaria a
Fraunces colada. Quem trocar a fonte de novo precisa trocar os quatro números junto.

Nada é carregado nesta página: a Montserrat já vem do `layout.tsx`, na variável
`--font-wordcom`. O `next/font` saiu do `page.tsx` junto com a Fraunces.

## Ordem e destinos

Site (destaque), Instagram, TikTok, portfólio no YouTube, WhatsApp — a ordem pedida pelo
dono. Todos abrem em nova aba, com indicação para leitor de tela e foco visível. A mensagem
pré-preenchida do WhatsApp foi preservada.

A logo vive na camada de fundo, então o `h1` da página é texto para leitor de tela e a
frase de assinatura é `aria-hidden` — ela repete o que o `h1` já diz.

O espaçamento inferior reserva lugar para o aviso de cookies compartilhado do site. O
rodapé assina "Agência de publicidade e marketing 360º" — o descritor que aparece no banner
da marca, em texto e não embutido em imagem.

## O navbar não entra aqui

O `layout.tsx` monta o `NavbarWordcom` no site inteiro, e ele pousava em cima da logo — que
nesta página é o fundo em tamanho real — além de oferecer uma navegação que disputa atenção
com os cinco links. Numa página de link na bio isso não pode acontecer.

A rota foi excluída em `src/components/navbar-wordcom.tsx`, pela constante `ROTAS_SEM_BARRA`.
A decisão mora no invólucro e não no `tubelight-navbar.tsx`, que é o componente genérico da
barra e não deve conhecer rotas deste site.

Conferido nas três rotas depois da mudança: `/bio` sem a barra, `/` com os cinco itens,
`/documentos-institucionais` com a barra.

## Resolução: medido em tela de celular

Atualização de 27/10/2026: a regra `@media (max-height: 760px)` foi removida.
Ela fazia a assinatura e os cartões mudarem de tamanho quando a altura disponível
cruzava 760px, inclusive durante mudanças das barras do navegador mobile. Agora,
fonte, padding e altura dos cartões permanecem estáveis quando só a altura muda;
o ajuste responsivo continua dependendo da largura. As medições abaixo registram
o comportamento anterior, não uma regra a ser reintroduzida.

O gargalo desta página é **altura**, não largura. O bloco do topo é dimensionado pela
largura (0,700 do palco, que é onde o céu vira cor chapada), então numa tela baixa ele come
metade da viewport e os links somem abaixo da dobra.

O caso real do público é o **navegador interno do Instagram**, que come uma barra em cima e
outra embaixo — sobram cerca de 700px num iPhone 14 e 540px num SE.

Medido antes e depois da regra `@media (max-height: 760px)`, com o aviso de cookies fora:

| Tela | Cartões acima da dobra | Rolagem |
| --- | --- | --- |
| 320×568 | 1 → **2** | 531 → **413** |
| 375×540 — SE no Instagram | 1 → 1 | 558 → **437** |
| 375×667 — SE | 2 → **3** | 431 → **310** |
| 390×700 — iPhone 14 no Instagram | 2 → **3** | 411 → **290** |
| 390×844 | 3 | 267 → 263 |
| 430×932 | 4 | 223 → 220 |

Em todas: `scrollWidth - clientWidth` em 0, nenhum texto cortado, apoio em 14px, blocos de
106 a 124px — muito acima do alvo de toque de 44px.

Uma alternativa foi testada e **descartada**: amarrar o palco à altura com
`min(100vw, 64vh)`. Rendeu 20px e estreitou o céu, que deixava de cobrir a largura da tela.
O que rende é apertar o ritmo vertical, que não mexe na geometria do fundo nem no contraste.

O caso 375×540 segue com um cartão acima da dobra. É o piso: espremer mais exigiria reduzir
a marca no fundo, que é justamente o que o dono pediu para ser grande.

## Validação

TypeScript: `npx tsc --noEmit` passou. Medido em 390x844 (iPhone 14/15): os cinco cartões
com 120px exatos, página com 1333px — 251px de rolagem, com três cartões acima da dobra.
`scrollWidth - clientWidth` em 0. Hover conferido no valor computado em largura de desktop:
fundo `#7d00ff → #6e01e0`, bloco em `translateY(-2px)`, seta em `translateX(4px)`.

Nada publicado: depende do deploy do projeto. Em produção o link do perfil aponta para
`wordcom.com.br/bio`.

## Regenerar o fundo

```bash
python scripts/gera-fundo-bio.py
```

Lê `scripts/fonte/wordcom-banner.webp` e escreve `public/marca/bio-fundo.webp`. Ao final
imprime a partir de que fração da largura o conteúdo é seguro; se esse número subir acima
de `0,700`, o `padding-top` do `.page` precisa acompanhar.
