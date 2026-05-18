import sys
import re
import random
import itertools
from collections import defaultdict
import threading

# =========================
# DATASET (VOCABULÁRIO BRASILEIRO)
# =========================
PT_VOCAB = [
    "senha", "acesso", "admin", "usuario", "mestre", "sistema", "rede", "seguranca", "fiscal",
    "contabil", "juridico", "vendas", "comercial", "operacional", "tecnico", "suporte", "gerente",
    "diretoria", "projeto", "cliente", "externo", "interno", "privado", "secreto", "protegido",
    "servidor", "banco", "dados", "infra", "desenv", "teste", "producao", "reserva", "apoio",
    "empresa", "corporativo", "vitoria", "sucesso", "liberdade", "brasil", "setembro", "janeiro",
    "segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo", "ferias", "trabalho",
    "equipe", "nuvem", "gestor", "logistica", "marketing", "conexao"
]

NUMBERS = ["1", "12", "123", "1234", "12345", "123456", "2023", "2024", "2025", "2026", "777", "01", "007", "11", "99"]
SYMBOLS = ["!", "@", "#", "$", "*", "_", "-", ".", "!!", "@@"]

def extract_target_keywords(target):
    keywords = []
    if target:
        clean_target = re.sub(r'https?://', '', target)
        clean_target = re.sub(r'www\.', '', clean_target)
        parts = re.split(r'[\./\_-]', clean_target)
        for p in parts:
            if len(p) > 2:
                keywords.append(p.lower())
    return keywords

def nano_mutations(word):
    out = set()
    out.add(word)
    out.add(word.capitalize())
    out.add(word.upper())
    
    # Adicionar números e caracteres especiais
    for n in NUMBERS:
        out.add(word + n)
        out.add(word + "@" + n)
    
    for s in SYMBOLS:
        out.add(word + s)
        for n in NUMBERS:
            out.add(word + s + n)
            out.add(word + n + s)
    
    # Leet Speak
    lmap = {'a':'4','e':'3','i':'1','o':'0','s':'5','t':'7'}
    leet = "".join(lmap.get(c.lower(), c) for c in word)
    out.add(leet)
    
    return out

def run_nano_engine(base_words):
    generated = set()
    # Combinações de até 2 palavras (para manter tamanho "humano")
    sample_a = base_words[:30]
    sample_b = base_words[:30]
    for a, b in itertools.product(sample_a, sample_b):
        if a != b:
            if len(a) + len(b) <= 15:
                generated.add(a + b)
                generated.add(a + "_" + b)
                generated.add(a.capitalize() + b.capitalize())
            
    # Aplica mutações
    expanded = set(base_words)
    expanded.update(generated)
    
    final_nano = set()
    count = 0
    for w in expanded:
        for mut in nano_mutations(w):
            if 6 <= len(mut) <= 15: # Filtrar por faixa mais "humana"
                final_nano.add(mut)
        count += 1
        if count > 15000:
            break
    return final_nano

def run_markov_engine(base_words):
    ORDER = 3
    markov = defaultdict(list)
    
    # Reforçar a base com palavras portuguesas e os alvos
    training = base_words
    
    for word in training:
        if len(word) < ORDER: continue
        w_pad = ("^" * ORDER) + word + "$"
        for i in range(len(w_pad) - ORDER):
            key = w_pad[i:i+ORDER]
            next_char = w_pad[i+ORDER]
            markov[key].append(next_char)

    def generate_markov(max_len=12):
        key = "^" * ORDER
        result = ""
        while len(result) < max_len:
            next_options = markov.get(key)
            if not next_options:
                break
            next_char = random.choice(next_options)
            if next_char == "$":
                break
            result += next_char
            key = key[1:] + next_char
        return result

    raw_markov = set()
    for _ in range(15000):
        w = generate_markov()
        if len(w) >= 4:
            raw_markov.add(w)

    final_markov = set()
    count = 0
    for w in raw_markov:
        if count > 10000: break
        for mut in nano_mutations(w):
            if 6 <= len(mut) <= 15:
                final_markov.add(mut)
        count += 1
    return final_markov
    
def main():
    # sys.argv[1] é a linguagem, sys.argv[2] o target, sys.argv[3] seeds
    lang = sys.argv[1] if len(sys.argv) > 1 else 'pt'
    target = sys.argv[2] if len(sys.argv) > 2 else ''
    extra_seeds = sys.argv[3].split(',') if len(sys.argv) > 3 else []
    
    base_words = list(PT_VOCAB)
    base_words.extend(extract_target_keywords(target))
    base_words.extend([s.strip().lower() for s in extra_seeds if len(s.strip()) > 2])
    base_words = list(set(base_words))
    
    nano_thread_result = []
    markov_thread_result = []
    
    def nano_task():
        nano_thread_result.append(run_nano_engine(base_words))
        
    def markov_task():
        markov_thread_result.append(run_markov_engine(base_words))
        
    t1 = threading.Thread(target=nano_task)
    t2 = threading.Thread(target=markov_task)
    
    t1.start()
    t2.start()
    t1.join()
    t2.join()
    
    final_set = nano_thread_result[0].union(markov_thread_result[0])
    
    count = 0
    for w in final_set:
        print(w)
        count += 1
        if count >= 300000:
            break

if __name__ == "__main__":
    main()
