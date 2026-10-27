"""Gera o fundo da página /bio a partir do banner da marca.

    python scripts/gera-fundo-bio.py

Entrada:  scripts/fonte/wordcom-banner.webp   (master 16:9 da marca)
Saída:    public/marca/bio-fundo.webp         (retrato, ~23 KB)

POR QUE NÃO USAR O BANNER DIRETO

O banner é 16:9. Num celular, `background-size: cover` escala pela altura e
corta na horizontal — e o wordmark ocupa 65% da largura da arte, então ele
é cortado ao meio. Nenhuma posição de fundo resolve: a palavra é larga demais.

Medido, o pior pixel do banner tem luminância 1,0 (é o próprio wordmark
branco). Texto #f6f4f8 em cima dele daria 1,05:1.

O QUE ESTE SCRIPT FAZ

Monta um retrato onde a marca aparece inteira no alto, ocupando LARGURA_MARCA
da largura, e a mesma noite estrelada desce — pela faixa espelhada, sem
costura — pela página inteira.

A FAIXA QUE SE REPETE

Ela é cortada ABAIXO da base do lockup. A primeira versão cortava os últimos
300px do banner, que ainda contêm o pé do wordmark e o descritor: o resultado
clonava pedaços de letra página abaixo. Não aparecia porque, na época, tudo
abaixo do lockup era esmagado até preto chapado. Ao abrir o céu, apareceria.

Medida, a faixa limpa tem mediana 0,0064 e p95 0,0513 de luminância — é céu
de verdade, escuro, com estrelas pontuais.

O TETO

Não é um ajuste de gosto. Sobre o céu correm dois elementos: o texto do rodapé
(12px) e o fio dos cartões. O teto que o rodapé #c9c2d6 aguenta é 0,080, onde ele
mede 4,68:1. TETO está em 0,060 porque a compressão WebP LEVANTA pixels: com
o teto em 0,080 o arquivo salvo media 0,0931 no pior pixel e o rodapé caía
para 4,25:1 — reprovava. O teto é aplicado antes de salvar; quem manda é o
número medido DEPOIS, e é esse que o relatório imprime.

Como o p95 do céu é 0,0513, mesmo 0,060 só corta o núcleo das estrelas mais
fortes: a nebulosa e quase todo o campo passam intactos. Subir para 0,120
derrubaria o rodapé para 3,58:1.

O fio dos cartões precisa acompanhar. O script imprime, ao final, a
luminância mínima que ele exige para manter 3:1 sobre este céu — se esse
número subir, o fio no bio.module.css tem de subir junto.

A rampa termina ANTES de o conteúdo começar: com FIM_DA_RAMPA = 150 o teto
chega a 0,080 em y=705, e o conteúdo começa em 0,700*1080 = 756. Com a rampa
longa que havia antes, a assinatura caía em cima de céu ainda a 0,41 de
luminância e media 2,07:1 — reprovava.

A ALTURA

4600px cobrem a página inteira: a 390px de largura o fundo é desenhado com
390*4600/1080 = 1661px de altura, e a página mede ~1333px. Os últimos 200px
morrem na cor base, então, se alguma viewport for mais alta ainda, o encontro
com o `background-color` não mostra degrau. As bordas laterais morrem na cor
base pela mesma razão, na horizontal.
"""

import os
import sys

import numpy as np
from PIL import Image

FONTE = "scripts/fonte/wordcom-banner.webp"
SAIDA = "public/marca/bio-fundo.webp"

BASE = np.array([10, 7, 16], dtype=float)  # #0a0710, o mesmo do CSS
LARGURA = 1080
ALTURA = 4600         # cobre a página inteira; ver "A ALTURA" abaixo
LARGURA_MARCA = 0.80  # fração da largura ocupada pelo lockup
TETO = 0.060          # luminância máxima do céu; ver "O TETO" abaixo
FIM_DA_RAMPA = 150    # px abaixo do lockup em que o teto termina de descer
INICIO_CONTEUDO = 0.700  # fração da largura em que o conteúdo começa (espelha o CSS)

# bbox do lockup dentro do master: do topo do octopus à base do descritor,
# e da primeira à última letra do wordmark
LOCKUP = (270, 190, 1375, 710)


def lin(c):
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def luminancia(a):
    return (
        0.2126 * lin(a[..., 0] / 255)
        + 0.7152 * lin(a[..., 1] / 255)
        + 0.0722 * lin(a[..., 2] / 255)
    )


def main():
    src = Image.open(FONTE).convert("RGB")
    escala = (LARGURA_MARCA * LARGURA) / (LOCKUP[2] - LOCKUP[0])
    bw, bh = int(src.width * escala), int(src.height * escala)
    banner = src.resize((bw, bh), Image.LANCZOS)
    base_lockup = int(LOCKUP[3] * escala)

    inicio, fim = base_lockup + 24, base_lockup + FIM_DA_RAMPA
    altura = ALTURA

    tela = Image.new("RGB", (LARGURA, altura), tuple(BASE.astype(int)))
    tela.paste(banner, ((LARGURA - bw) // 2, 0))

    # a noite continua abaixo do banner: a faixa, espelhada a cada repetição,
    # não deixa costura visível. Cortada ABAIXO do lockup, senão o pé do
    # wordmark viaja clonado página abaixo.
    faixa = banner.crop((0, base_lockup + 8, bw, bh))
    faixa_h = faixa.height
    y, espelha = bh, True
    while y < altura:
        peca = faixa.transpose(Image.FLIP_TOP_BOTTOM) if espelha else faixa
        tela.paste(peca, ((LARGURA - bw) // 2, y))
        y += faixa_h
        espelha = not espelha

    a = np.asarray(tela).astype(float)
    yy = np.arange(altura)[:, None]
    rampa = np.clip((yy - inicio) / (fim - inicio), 0, 1)

    # A NEBULOSA DECAI COM A PROFUNDIDADE, AS ESTRELAS FICAM
    #
    # A faixa espelhada repete a nebulosa roxa, e isso lê como padrão: o mesmo
    # bloom volta a cada período. Além de feio, é mentira — a luz vem da marca,
    # no topo, e deveria se apagar conforme desce.
    #
    # O brilho DIFUSO é escurecido progressivamente; as estrelas, não. A
    # separação é feita aqui, ANTES do teto: depois dele nada passa de TETO e
    # estrela e nebulosa ficariam indistinguíveis. Cru, a nebulosa vive entre
    # 0,01 e 0,05 e as estrelas entre 0,1 e 0,73, então o limiar separa bem.
    L_cru = luminancia(a)
    estrela = np.clip((L_cru - 0.08) / 0.12, 0, 1)
    profundidade = np.clip((yy - fim) / (0.70 * altura - fim), 0, 1)
    escuro = 1.0 - 0.65 * profundidade
    a *= (escuro + (1.0 - escuro) * estrela)[..., None]

    # teto de luminância que desce: 1,0 no lockup (intacto) até TETO no céu
    teto = 1.0 + (TETO - 1.0) * rampa
    L = luminancia(a)
    k = np.where(
        L > teto,
        np.power(np.clip(teto, 1e-6, None) / np.clip(L, 1e-6, None), 1 / 2.4),
        1.0,
    )
    a *= k[..., None]

    # só o rodapé do arquivo morre na cor base, para o caso de a viewport ser
    # mais alta que o desenho
    cauda = np.clip((yy - (altura - 200)) / 200, 0, 1)
    a = a * (1 - cauda)[..., None] + BASE * cauda[..., None]

    # vinheta lateral pela mesma razão, na horizontal
    xx = np.arange(LARGURA)[None, :]
    borda = np.clip(np.minimum(xx, LARGURA - 1 - xx) / (0.07 * LARGURA), 0, 1) ** 0.6
    a = a * borda[..., None] + BASE * (1 - borda)[..., None]

    saida = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    saida.save(SAIDA, quality=90, method=6)

    # relatório: medido na faixa em que o conteúdo de fato corre
    b = np.asarray(saida).astype(float)
    Lb = luminancia(b)
    texto = luminancia(np.array([[[246, 244, 248]]], dtype=float))[0, 0]
    rodape = luminancia(np.array([[[201, 194, 214]]], dtype=float))[0, 0]

    print("%s  %dx%d  %d KB" % (SAIDA, LARGURA, altura, os.path.getsize(SAIDA) // 1024))
    print("lockup y %d..%d   teto chega a %.3f em y=%d" % (
        int(LOCKUP[1] * escala), base_lockup, TETO, fim))

    y0 = int(INICIO_CONTEUDO * LARGURA)
    if fim > y0:
        print("ERRO: a rampa termina em %d, depois do início do conteúdo (%d)" % (fim, y0))
        return 1

    pior = Lb[y0 : altura - 220].max()
    print("céu sob o conteúdo (y %d..%d): pior pixel %.4f" % (y0, altura - 220, pior))
    print("  assinatura/título #f6f4f8 ... %.2f:1" % ((texto + 0.05) / (pior + 0.05)))
    print("  rodapé #c9c2d6 ............. %.2f:1  %s" % (
        (rodape + 0.05) / (pior + 0.05),
        "OK" if (rodape + 0.05) / (pior + 0.05) >= 4.5 else "REPROVA"))
    print("  fio dos cartões precisa de luminância >= %.3f para 3:1" % (
        3 * (pior + 0.05) - 0.05))
    return 0


if __name__ == "__main__":
    sys.exit(main())
