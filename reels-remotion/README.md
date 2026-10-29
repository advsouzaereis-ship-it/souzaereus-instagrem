# Reels Souza & Reis (Remotion)

Vídeos curtos 9:16 (1080x1920, 30 fps) para Instagram Reels e TikTok do @souzaereis.adv, gerados em código a partir dos posts do feed.

## Estrutura

- `src/engine.tsx`: motor reutilizável. Temas (cores, fontes, ritmo, fundo) e tipos de cena.
- `src/reels.tsx`: um objeto `ReelDef` por vídeo (tema + cenas + chamada final).
- `src/Root.tsx`: registra cada vídeo como uma composição.
- `src/ReelAnac.tsx`: primeiro Reel (28/10/2026), feito antes do motor; serve de referência.
- `audio/synth.py`: trilhas instrumentais originais sintetizadas em Python (numpy/scipy). Sem direito autoral de terceiros.
- `legendas-out2026.md`: legendas usadas em outubro de 2026.

## Tipos de cena (`engine.tsx`)

| tipo | uso |
|---|---|
| `hero` | título grande + faixa colorida + linha de apoio com palavra em destaque |
| `count` | número que sobe até o valor (prazos: 30 dias, 7 dias) |
| `list` | lista com checks animados (o que guardar, o que pesa) |
| `strike` | palavra riscada na tela (desfazer um mito) |
| `dots` | quadrados numerados que se preenchem (contagem de dias) |
| `flash` | palavras trocando em sequência com flash |

Cada cena tem `kicker` (rótulo em caixa alta) e `dur` (quadros; 30 = 1 segundo).

## Temas já usados (não repetir em sequência)

| tema | cores | fonte | ritmo | fundo | usado em |
|---|---|---|---|---|---|
| ANAC (ReelAnac) | azul-marinho e dourado | Lora + Inter | variado | círculos | 28/10 |
| PISTA | grafite e âmbar | Poppins | `snappy` | faixas de pista | 29/10 veículo |
| PAPEL | bege, azul e terracota | Lora + Inter | `smooth` | folha pautada | 30/10 dano moral |
| VITRINE | preto, dourado e coral | Poppins | `kinetic` | brilhos | 31/10 Black Friday |

Trilhas: acústica pop (ANAC, gerada no vidIQ), `veiculo` chillhop 85 BPM, `dano` piano e cordas 95 BPM, `arrependimento` funk 118 BPM.

## Regras de layout

- Área segura: nada acima de y=230, abaixo de y=1440 ou nos 230 px da direita.
- Faixa colorida no terço inferior da área segura; legenda queimada no vídeo.
- Encerramento fixo: chamada (salvar/compartilhar), @souzaereis.adv e "Conteúdo informativo. Cada caso exige análise individual."
- Conteúdo dentro do Provimento CFOAB 205/2021 (ver skill instagram-souza-reis).

## Como gerar um Reel novo

```bash
npm ci
# 1. criar o ReelDef em src/reels.tsx e registrar em src/Root.tsx
# 2. conferir quadros soltos
npx remotion still src/index.ts NomeDaComposicao out/f.png --frame=120
# 3. renderizar
npx remotion render src/index.ts NomeDaComposicao out/NOME.mp4 --codec=h264 --crf=20
# 4. trilha (adicionar nova função em audio/synth.py para variar o estilo)
python3 audio/synth.py veiculo audio/trilha.wav
# 5. juntar áudio com fade e volume de fundo
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 out/NOME.mp4)
ffmpeg -i out/NOME.mp4 -i audio/trilha.wav -filter_complex \
  "[1:a]atrim=0:$D,asetpts=PTS-STARTPTS,afade=t=out:st=$(echo "$D-2"|bc):d=2,loudnorm=I=-18:TP=-2:LRA=11[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest final/NOME.mp4
```

6. Copiar o MP4 para a pasta do post (`AAAA-MM-DD-tema/reel.mp4`), fazer push e usar o link `raw.githubusercontent.com` no Metricool (Instagram REEL + TikTok, publicação automática, capa em 3000 ms).

Em ambiente sem Chrome do sistema, passar `--browser-executable=<caminho do chromium>`.
Renderizar um vídeo por vez em máquinas com 2 núcleos.
