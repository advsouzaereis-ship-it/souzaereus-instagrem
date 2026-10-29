"""Trilhas originais para os Reels do @souzaereis.adv, sintetizadas em código.

uso: python3 synth.py veiculo|dano|arrependimento saida.wav
"""
import sys
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile

SR = 44100
rng = np.random.default_rng(7)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def t_(d):
    return np.arange(int(d * SR)) / SR


def env(n, a=0.005, d=0.1, s=0.7, r=0.1, hold=None):
    """ADSR em amostras; hold = tempo antes do release."""
    tot = n
    a_n, d_n, r_n = int(a * SR), int(d * SR), int(r * SR)
    e = np.full(tot, s, dtype=float)
    a_n = max(1, min(a_n, tot))
    e[:a_n] = np.linspace(0, 1, a_n)
    d_end = min(tot, a_n + d_n)
    if d_end > a_n:
        e[a_n:d_end] = np.linspace(1, s, d_end - a_n)
    if r_n > 0 and r_n < tot:
        e[-r_n:] *= np.linspace(1, 0, r_n)
    return e


def lp(x, fc, order=2):
    sos = butter(order, min(fc, SR / 2 - 100) / (SR / 2), 'low', output='sos')
    return sosfilt(sos, x)


def hp(x, fc, order=2):
    sos = butter(order, fc / (SR / 2), 'high', output='sos')
    return sosfilt(sos, x)


def bp(x, lo, hi, order=2):
    sos = butter(order, [lo / (SR / 2), hi / (SR / 2)], 'band', output='sos')
    return sosfilt(sos, x)


# ---------- instrumentos ----------
def rhodes(f, d):
    t = t_(d)
    e = np.exp(-t * 2.2)
    idx = 1.6 * np.exp(-t * 6)
    x = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * t))
    x += 0.12 * np.sin(2 * np.pi * f * 14 * t) * np.exp(-t * 30)
    x *= e * (1 + 0.15 * np.sin(2 * np.pi * 4.5 * t))
    x *= env(len(t), a=0.004, d=0.01, s=1, r=0.08)
    return x


def piano(f, d, bright=1.0):
    t = t_(d)
    x = np.zeros_like(t)
    for n in range(1, 9):
        fn = f * n * np.sqrt(1 + 0.0004 * n * n)
        if fn > SR / 2.2:
            break
        x += (1 / n ** 1.3) * np.sin(2 * np.pi * fn * t) * np.exp(-t * (1.4 + n * 0.9 / bright))
    x += 0.05 * lp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 60)
    return x * env(len(t), a=0.002, d=0.01, s=1, r=0.12)


def pad(f, d, cutoff=1800):
    t = t_(d)
    x = np.zeros_like(t)
    for det in (-0.08, 0.0, 0.07):
        ph = (f * 2 ** (det / 12)) * t
        x += 2 * (ph - np.floor(ph + 0.5))
    x = lp(x / 3, cutoff, 2)
    return x * env(len(t), a=min(0.8, d / 3), d=0.2, s=0.85, r=min(0.8, d / 3))


def marimba(f, d=0.6):
    t = t_(d)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 7) + 0.25 * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t * 22)
    return x * env(len(t), a=0.001, d=0.01, s=1, r=0.05)


def sub(f, d):
    t = t_(d)
    x = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t)
    return x * env(len(t), a=0.008, d=0.1, s=0.8, r=0.06)


def slap(f, d):
    t = t_(d)
    x = np.zeros_like(t)
    for n in range(1, 12):
        x += (1 / n) * np.sin(2 * np.pi * f * n * t) * np.exp(-t * (5 + n * 4))
    x += 0.4 * np.sin(2 * np.pi * f * t) * np.exp(-t * 3)
    return np.tanh(1.4 * x) * env(len(t), a=0.002, d=0.02, s=1, r=0.04)


def pluck(f, d, damp=0.5):
    """Karplus-Strong."""
    n = int(d * SR)
    p = max(2, int(SR / f))
    buf = rng.uniform(-1, 1, p)
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = damp * (buf[i % p] + buf[(i + 1) % p])
    return out * env(n, a=0.001, d=0.01, s=1, r=0.03)


def saw_stab(freqs, d, cutoff=2500):
    t = t_(d)
    x = np.zeros_like(t)
    for f in freqs:
        for det in (-0.1, 0.1):
            ph = f * 2 ** (det / 12) * t
            x += 2 * (ph - np.floor(ph + 0.5))
    x = lp(x / (2 * len(freqs)), cutoff)
    return x * env(len(t), a=0.003, d=0.12, s=0.25, r=0.06)


def whistle(f, d):
    t = t_(d)
    vib = 1 + 0.008 * np.sin(2 * np.pi * 5.5 * t) * np.clip(t * 4, 0, 1)
    ph = np.cumsum(f * vib) / SR
    x = np.sin(2 * np.pi * ph) + 0.06 * lp(rng.standard_normal(len(t)), 6000)
    return x * env(len(t), a=0.03, d=0.05, s=0.85, r=0.08)


def kick(d=0.45, punch=1.0):
    t = t_(d)
    fr = 45 + 90 * np.exp(-t * 28)
    ph = np.cumsum(fr) / SR
    x = np.sin(2 * np.pi * ph) * np.exp(-t * 7) * punch
    x[: int(0.003 * SR)] += 0.4 * rng.uniform(-1, 1, int(0.003 * SR))
    return np.tanh(1.5 * x)


def snare(d=0.25, tone=185):
    t = t_(d)
    n = bp(rng.standard_normal(len(t)), 1500, 8000) * np.exp(-t * 18)
    b = np.sin(2 * np.pi * tone * t) * np.exp(-t * 25)
    return 0.8 * n + 0.6 * b


def hat(d=0.06, open_=False):
    t = t_(0.3 if open_ else d)
    return hp(rng.standard_normal(len(t)), 7000) * np.exp(-t * (9 if open_ else 70))


def clap():
    t = t_(0.25)
    x = np.zeros_like(t)
    for k, off in enumerate((0, 0.011, 0.022)):
        i = int(off * SR)
        seg = np.exp(-t[: len(t) - i] * (90 if k < 2 else 16))
        x[i:] += seg
    return bp(rng.standard_normal(len(t)), 900, 5000) * x


def shaker():
    t = t_(0.08)
    e = np.sin(np.pi * np.clip(t / 0.08, 0, 1)) ** 2
    return hp(rng.standard_normal(len(t)), 5000) * e


def tom(f=110):
    t = t_(0.4)
    fr = f * (1 + 0.4 * np.exp(-t * 20))
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 9)


# ---------- mixagem ----------
class Mix:
    def __init__(self, seconds, bpm):
        self.n = int(seconds * SR)
        self.beat = 60.0 / bpm
        self.buses = {}

    def add(self, bus, sig, beat_pos, gain=1.0, pan=0.0, swing=0.0):
        # swing: atrasa colcheias fracas
        frac = beat_pos % 1
        if swing and abs(frac - 0.5) < 1e-6:
            beat_pos += swing
        i = int(beat_pos * self.beat * SR)
        if i >= self.n:
            return
        if bus not in self.buses:
            self.buses[bus] = np.zeros((self.n, 2))
        seg = sig[: self.n - i] * gain
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        self.buses[bus][i : i + len(seg), 0] += seg * l * 1.414
        self.buses[bus][i : i + len(seg), 1] += seg * r * 1.414

    def render(self, levels, reverb_send, rev_time=1.8, master_lp=None):
        out = np.zeros((self.n, 2))
        send = np.zeros((self.n, 2))
        for name, b in self.buses.items():
            g = levels.get(name, 1.0)
            print(f'  {name:6s} rms={20*np.log10(np.sqrt(np.mean((b*g)**2))+1e-9):6.1f} dB', file=sys.stderr)
            out += b * g
            send += b * g * reverb_send.get(name, 0.0)
        # reverb: ruído com decaimento exponencial, um canal por lado
        ir_t = t_(rev_time)
        for c in range(2):
            ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 6.9 / rev_time)
            ir = lp(ir, 5000)
            ir /= np.sqrt(np.sum(ir ** 2))
            out[:, c] += fftconvolve(send[:, c], ir)[: self.n] * 0.9
        if master_lp:
            out = np.stack([lp(out[:, c], master_lp) for c in range(2)], axis=1)
        out = np.tanh(out / (np.max(np.abs(out)) + 1e-9) * 1.3)
        fade = int(1.8 * SR)
        out[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 1.5
        out[: int(0.02 * SR)] *= np.linspace(0, 1, int(0.02 * SR))[:, None]
        return out * 0.89


# ---------- faixas ----------
def veiculo():
    """Chillhop jazzístico, 85 BPM: piano elétrico, bateria com balanço, baixo redondo, chiado de vinil."""
    bpm, bars = 85, 8
    m = Mix(bars * 4 * 60 / bpm + 0.6, bpm)
    chords = [[50, 53, 57, 60, 64], [43, 59, 65, 64, 69], [48, 52, 55, 59, 62], [45, 57, 60, 64, 67]]
    roots = [38, 31, 36, 33]
    for bar in range(bars):
        c = chords[bar % 4]
        b0 = bar * 4
        # acordes: ataque no 1 e antecipação no "e" do 2
        for pos, dur in ((0, 1.4), (1.5, 2.3)):
            for k, n in enumerate(c[1:]):
                m.add('keys', rhodes(hz(n), dur * m.beat + 0.4), b0 + pos + k * 0.012, 0.22, pan=-0.3 + k * 0.2)
        # baixo
        if bar >= 1:
            r = roots[bar % 4]
            for pos, n, dur in ((0, r, 1.3), (1.75, r, 0.5), (2.5, r + 7, 0.9), (3.5, r + 12, 0.4)):
                m.add('bass', sub(hz(n + 12), dur * m.beat), b0 + pos, 0.55)
        # bateria
        if bar >= 1:
            for pos in (0, 1.75, 2.5):
                m.add('drums', kick(punch=0.9), b0 + pos, 0.9)
            for pos in (1, 3):
                m.add('drums', snare(tone=200), b0 + pos, 0.45, pan=0.05)
            for e in range(8):
                m.add('hats', hat(), b0 + e * 0.5, 0.18 if e % 2 else 0.28, pan=0.35, swing=0.09)
        # gancho de guitarra: frase pentatônica em compassos ímpares a partir do 3
        if bar >= 2 and bar % 2 == 0:
            phrase = [(0.5, 74), (1.0, 77), (1.5, 79), (2.25, 81), (3.0, 79)]
            for pos, n in phrase:
                m.add('gtr', pluck(hz(n), 0.9, 0.497), b0 + pos, 0.35, pan=0.4, swing=0.06)
    # vinil: chiado leve e estalos esparsos
    crack = lp(rng.standard_normal(m.n), 3500) * 0.012
    pops = np.zeros(m.n)
    idx = rng.integers(0, m.n, 140)
    pops[idx] = rng.uniform(0.05, 0.25, 140) * rng.choice([-1, 1], 140)
    pops = bp(pops, 1000, 9000)
    m.buses['vinyl'] = np.stack([crack + pops, crack * 0.9 + np.roll(pops, 37)], axis=1)
    return m.render(
        {'keys': 1.15, 'bass': 0.5, 'drums': 0.6, 'hats': 1.8, 'gtr': 4.0, 'vinyl': 3.0},
        {'keys': 0.35, 'gtr': 0.4, 'drums': 0.08, 'hats': 0.1},
        rev_time=1.6,
        master_lp=9000,
    )


def dano():
    """Cinematográfico sereno, 95 BPM: piano em arpejo, cordas, marimba e chocalho leve."""
    bpm, bars = 95, 10
    m = Mix(bars * 4 * 60 / bpm + 0.8, bpm)
    prog = [[48, 55, 60, 64], [47, 55, 62, 67], [45, 52, 60, 64], [41, 53, 57, 60]]
    for bar in range(bars):
        c = prog[bar % 4] if bar < 9 else [41, 48, 53, 57]  # final em Fá
        b0 = bar * 4
        last = bar == bars - 1
        # cordas
        for k, n in enumerate(c):
            m.add('pad', pad(hz(n + 12 if k else n), 4.2 * m.beat, 1500 + 300 * min(bar, 5)), b0, 0.16, pan=-0.4 + k * 0.27)
        # arpejo de piano em colcheias
        arp = [c[0] + 12, c[1] + 12, c[2] + 12, c[3] + 12, c[2] + 12, c[1] + 12, c[2] + 12, c[3] + 12]
        for e, n in enumerate(arp if not last else arp[:1]):
            m.add('piano', piano(hz(n), 1.6), b0 + e * 0.5, 0.3 if e % 2 == 0 else 0.22, pan=0.15)
        # melodia do piano a partir do compasso 5
        if 4 <= bar < 9:
            mel = {4: [(0, 76), (1.5, 74), (2, 72)], 5: [(0, 74), (1.5, 72), (2, 71), (3, 67)],
                   6: [(0, 72), (1, 76), (2, 79), (3.5, 77)], 7: [(0, 76), (2, 72)], 8: [(0, 79), (1.5, 77), (2, 76), (3, 74)]}[bar]
            for pos, n in mel:
                m.add('lead', piano(hz(n), 2.2, bright=1.6), b0 + pos, 0.42, pan=-0.1)
        # marimba em pulso
        if 2 <= bar < 9:
            for e in range(8):
                n = c[(e * 3) % 4] + 24
                m.add('mar', marimba(hz(n)), b0 + e * 0.5 + 0.25, 0.13, pan=0.45 if e % 2 else -0.45)
        # chocalho e tambores graves
        if 4 <= bar < 9:
            for s in range(16):
                m.add('perc', shaker(), b0 + s * 0.25, 0.035 if s % 2 else 0.02, pan=0.3)
        if 2 <= bar < 9:
            m.add('perc', tom(98), b0, 0.5)
            m.add('perc', tom(98), b0 + 2.5, 0.35)
        if last:
            m.add('perc', tom(82), b0, 0.5)
    return m.render(
        {'pad': 1.4, 'piano': 0.8, 'lead': 1.25, 'mar': 1.5, 'perc': 0.6},
        {'pad': 0.5, 'piano': 0.45, 'lead': 0.5, 'mar': 0.35, 'perc': 0.15},
        rev_time=2.6,
    )


def arrependimento():
    """Electro-pop funkeado, 118 BPM: baixo estalado, guitarra picotada, acordes de sintetizador, assobio."""
    bpm, bars = 118, 14
    m = Mix(bars * 4 * 60 / bpm, bpm)
    ch = {'E': [64, 67, 71, 74, 78], 'A': [61, 64, 67, 71, 66], 'C': [60, 64, 67, 71, 74], 'B': [63, 66, 69, 71, 75]}
    seq = ['E', 'A', 'E', 'A', 'E', 'A', 'C', 'B'] * 2
    roots = {'E': 28, 'A': 33, 'C': 36, 'B': 35}
    for bar in range(bars):
        k = seq[bar]
        c, r = ch[k], roots[k]
        b0 = bar * 4
        intro = bar < 2
        # bateria
        for q in range(4):
            if not intro or q in (0, 2):
                m.add('drums', kick(0.35, 1.0), b0 + q, 1.0)
            m.add('hats', hat(open_=True), b0 + q + 0.5, 0.16, pan=0.3)
            for s in (0.25, 0.75):
                m.add('hats', hat(0.04), b0 + q + s, 0.12, pan=-0.3)
        if not intro:
            for q in (1, 3):
                m.add('drums', clap(), b0 + q, 0.5)
        # baixo estalado e sincopado
        if not intro:
            pat = [(0, 0, 0.4), (0.75, 12, 0.2), (1.5, 0, 0.3), (2.0, 7, 0.25), (2.75, 12, 0.2), (3.25, 10, 0.2), (3.5, 12, 0.3)]
            for pos, iv, dur in pat:
                m.add('bass', slap(hz(r + 12 + iv), dur * m.beat + 0.05), b0 + pos, 0.5)
        # guitarra picotada nas semicolcheias fracas
        if bar >= 1:
            for pos in (0.25, 0.75, 1.75, 2.25, 2.75, 3.75):
                for j, n in enumerate(c[:3]):
                    m.add('gtr', pluck(hz(n), 0.12, 0.47), b0 + pos + j * 0.004, 0.14, pan=0.55)
        # acordes de sintetizador no "e" do 4 e no 1
        if bar >= 2:
            m.add('stab', saw_stab([hz(n) for n in c[:4]], 0.35), b0 + 3.5, 0.32, pan=-0.2)
            m.add('stab', saw_stab([hz(n) for n in c[:4]], 0.25, 3200), b0, 0.22, pan=0.2)
        # gancho em assobio a partir do compasso 5
        if 4 <= bar < 12 and bar % 2 == 0:
            for pos, n, dur in ((0.5, 83, 0.4), (1.0, 86, 0.4), (1.5, 83, 0.3), (2.0, 81, 0.6), (3.0, 79, 0.3), (3.5, 81, 0.6)):
                m.add('lead', whistle(hz(n), dur * m.beat + 0.1), b0 + pos, 0.2, pan=0.1)
        if 4 <= bar < 12 and bar % 2 == 1:
            for pos, n, dur in ((0.5, 78, 0.4), (1.0, 79, 0.4), (1.5, 81, 0.9), (3.0, 76, 0.8)):
                m.add('lead', whistle(hz(n), dur * m.beat + 0.1), b0 + pos, 0.2, pan=0.1)
    return m.render(
        {'drums': 0.45, 'hats': 1.1, 'bass': 0.7, 'gtr': 3.8, 'stab': 7.0, 'lead': 1.8},
        {'stab': 0.3, 'lead': 0.35, 'gtr': 0.2, 'drums': 0.05},
        rev_time=1.4,
    )


if __name__ == '__main__':
    name, out = sys.argv[1], sys.argv[2]
    audio = {'veiculo': veiculo, 'dano': dano, 'arrependimento': arrependimento}[name]()
    wavfile.write(out, SR, (audio * 32767).astype(np.int16))
    print(name, round(len(audio) / SR, 2), 's')
