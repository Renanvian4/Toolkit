import itertools
import random
from collections import defaultdict, Counter
import sys
import re

# =========================
# CONFIGURAÇÕES E DATASETS
# =========================
DATASETS = {
    "pt": [
        "exemplo", "equipe", "sistema", "acesso", "mestre", "sucesso", "admin", "servidor", "usuario",
        "rede", "segura", "chave", "nuvem", "docker", "infra", "desenv", "teste", "producao", "reserva",
        "banco", "dados", "portal", "interno", "apoio", "suporte", "gerente", "diretor",
        "empresa", "corporativo", "vendas", "ti", "rh", "financeiro", "comercial", "operacional",
        "mestra", "senha", "secreto", "privado", "diretoria", "projeto", "cliente", "venda", "gestor",
        "tecnico", "ajuda", "fiscal", "juridico", "contabil", "marketing", "logistica",
        "seguranca", "conexao", "monitoramento", "relatorio", "administrador", "sistemas"
    ],
    "en": ["example", "alpha", "beta", "system", "network", "access", "root", "admin", "guest", "power"]
}

LANG = sys.argv[1] if len(sys.argv) > 1 else 'pt'
TARGET = sys.argv[2] if len(sys.argv) > 2 else ''
SEEDS = sys.argv[3].split(',') if len(sys.argv) > 3 else []

# Dataset Base
base_words = list(DATASETS.get(LANG, DATASETS['pt']))
if SEEDS:
    base_words.extend([s.strip().lower() for s in SEEDS if len(s.strip()) > 1])

# Extração de Keywords do Target
if TARGET:
    parts = re.split(r'[\./\_-]', TARGET.replace('http://', '').replace('https://', '').replace('www.', ''))
    base_words.extend([p.lower() for p in parts if len(p) > 2])

base_words = list(set(base_words))

# =========================
# MARKOV ORDER 3
# =========================
ORDER = 3
markov_chain = defaultdict(list)
for word in base_words:
    pword = ("^" * ORDER) + word + "$"
    for i in range(len(pword) - ORDER):
        markov_chain[pword[i:i+ORDER]].append(pword[i+ORDER])

def generate_markov():
    key = "^" * ORDER
    res = ""
    for _ in range(15):
        opts = markov_chain[key]
        if not opts: break
        char = random.choice(opts)
        if char == "$": break
        res += char
        key = key[1:] + char
    return res

# =========================
# REGRAS NANO (MUTAÇÃO)
# =========================
NUMS = ["123", "2024", "2025", "2026", "777", "1", "01", "007", "321"]
SYMS = ["!", "@", "#", "$", "*", "_", ""]

def pt_leet(word):
    # Basic PT-BR Leet-Speak
    subs = {'a': '4', 'e': '3', 'i': '1', 'o': '0', 's': '5', 't': '7'}
    res = list(word)
    for i, char in enumerate(res):
        if char.lower() in subs:
            res[i] = subs[char.lower()]
    return "".join(res)

def mutate(word):
    m = {word, word.upper(), word.capitalize()}
    
    # Variações Contextuais PT
    if LANG == 'pt':
        m.add(word + "mestre")
        m.add("admin" + word)
        m.add(pt_leet(word))
        m.add(word.replace("a", "@").replace("o", "0"))
    
    # Combinations with numbers and symbols (Expanding complexity)
    for n in NUMS:
        m.add(word + n)
        m.add(word + "!" + n)
        m.add(word + "@" + n)
        m.add(n + word)
        if len(word) > 4:
            m.add(word[:1].upper() + word[1:] + n)
            m.add(word.capitalize() + "!" + n)
            m.add(word.lower() + "_" + n)
            
    for s in SYMS:
        if s: 
            m.add(word + s)
            m.add(s + word)
            for n in ["1", "123", "2025"]:
                m.add(word + s + n)
                m.add(n + s + word)
            
    return m

# =========================
# EXECUÇÃO HÍBRIDA
# =========================
def main():
    final_output = set()

    # 1. Sementes Markovianas (Aprendizado Estrutural)
    for _ in range(1500):
        m_word = generate_markov()
        if len(m_word) > 3:
            final_output.update(mutate(m_word))

    # 2. Combinações Nano (Lógica Prince)
    # Expand combination range to all base words to be "unlimited" and target-focused
    for a, b in itertools.product(base_words, repeat=2):
        final_output.add(a + b)
        final_output.add(a + "." + b)
        if len(final_output) > 200000: break # Safety break for memory, but much larger than before
    
    # 3. Refinamento de Ranking
    freq = Counter("".join(list(final_output)))
    ranked = sorted(final_output, key=lambda x: len(x), reverse=True) # Sort by length to avoid heavy lambda execution

    count = 0
    for w in ranked:
        if 4 <= len(w) <= 20: 
            print(w)
            count += 1
            if count >= 500000: break

if __name__ == "__main__":
    main()
