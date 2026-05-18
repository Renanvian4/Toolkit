import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, Search, ChevronRight, Terminal, Info, Zap, Shield, Hash, Globe, MousePointer2, Cloud, Camera, Fingerprint, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';

interface CommandDetail {
  id: string;
  name: string;
  category: string;
  command: string;
  description: string;
  lines: { code: string; explanation: string }[];
}

const COMMAND_DATABASE: CommandDetail[] = [
  {
    id: 'nmap-discovery',
    name: 'Nmap: Descoberta Completa',
    category: 'Reconhecimento',
    command: 'nmap -sS -sV -p- -T4 10.0.0.1',
    description: 'Um comando agressivo de escaneamento para identificar serviços e versões em todas as portas.',
    lines: [
      { code: 'nmap', explanation: 'Chama o utilitário Network Mapper.' },
      { code: '-sS', explanation: 'Realiza um "SYN Scan" silencioso (não completa a conexão TCP).' },
      { code: '-sV', explanation: 'Interroga as portas abertas para determinar a versão do serviço.' },
      { code: '-p-', explanation: 'Escaneia todas as 65535 portas disponíveis.' },
      { code: '-T4', explanation: 'Ajusta o tempo para um perfil agressivo (rápido).' },
      { code: '10.0.0.1', explanation: 'O endereço IP do alvo a ser analisado.' }
    ]
  },
  {
    id: 'ffuf-directory',
    name: 'FFUF: Fuzzing de Diretórios',
    category: 'Fuzzing',
    command: 'ffuf -u https://alvo.com/FUZZ -w wordlist.txt -mc 200',
    description: 'Busca por diretórios ocultos no servidor web usando uma lista de palavras.',
    lines: [
      { code: 'ffuf', explanation: 'Executável do Fast Fuzz.' },
      { code: '-u https://alvo.com/FUZZ', explanation: 'URL alvo onde "FUZZ" será substituído pela lista.' },
      { code: '-w wordlist.txt', explanation: 'Caminho para o arquivo de lista de palavras (wordlist).' },
      { code: '-mc 200', explanation: 'Filtra apenas resultados com código de status HTTP 200 (OK).' }
    ]
  },
  {
    id: 'hashcat-md5',
    name: 'Hashcat: Quebra de MD5',
    category: 'Criptografia',
    command: 'hashcat -m 0 -a 0 hashes.txt wl.txt',
    description: 'Tenta quebrar hashes MD5 usando um ataque de dicionário.',
    lines: [
      { code: 'hashcat', explanation: 'O processador de hashes de alta performance.' },
      { code: '-m 0', explanation: 'Define o modo de hash como 0 (MD5).' },
      { code: '-a 0', explanation: 'Define o modo de ataque como 0 (Dicionário).' },
      { code: 'hashes.txt', explanation: 'Arquivo contendo os hashes capturados.' },
      { code: 'wl.txt', explanation: 'Arquivo de wordlist para testar contra o hash.' }
    ]
  },
  {
    id: 'amass-sub',
    name: 'Amass: Enumeração Ativa',
    category: 'OSINT',
    command: 'amass enum -active -d target.com',
    description: 'Encontra subdomínios através de enumeração ativa e fontes públicas.',
    lines: [
      { code: 'amass enum', explanation: 'Inicia o módulo de enumeração.' },
      { code: '-active', explanation: 'Habilita métodos ativos de descoberta.' },
      { code: '-d target.com', explanation: 'O domínio principal para pesquisar subdomínios.' }
    ]
  },
  {
    id: 'openvas-cli',
    name: 'OpenVAS: Auditoria OSP',
    category: 'Vulnerabilidade',
    command: 'omp -u admin -w pass -g -T 987-123',
    description: 'Inicia uma tarefa de escaneamento via linha de comando.',
    lines: [
      { code: 'omp', explanation: 'Protocolo de Gerenciamento do OpenVAS.' },
      { code: '-u admin', explanation: 'Nome de usuário para autenticação no servidor.' },
      { code: '-w pass', explanation: 'Senha do usuário administrador.' },
      { code: '-g', explanation: 'Comando para iniciar a geração de um relatório.' },
      { code: '-T', explanation: 'ID da tarefa de escaneamento configurada.' }
    ]
  },
  {
    id: 'ghost-mask',
    name: 'Ghost Route: Ip Masking',
    category: 'Anonimato',
    command: 'ghost-route --rotate 60 --aes-256',
    description: 'Configura o túnel de anonimato para rotacionar identidades.',
    lines: [
      { code: 'ghost-route', explanation: 'Script Catalyst para proxy/VPN masking.' },
      { code: '--rotate 60', explanation: 'Define rotação automática de IP a cada 60 segundos.' },
      { code: '--aes-256', explanation: 'Força criptografia de nível militar no túnel de saída.' }
    ]
  },
  {
    id: 'hydra-alpha',
    name: 'Hydra Alpha: Intrusion Engine',
    category: 'Vulnerabilidade',
    command: 'hydra -l admin -P wordlist.txt -s 22 ssh://10.0.0.5',
    description: 'Versão avançada do Hydra para ataques de força bruta multi-protocolo.',
    lines: [
      { code: 'hydra', explanation: 'O motor principal de quebra de autenticação paralela.' },
      { code: '-l admin', explanation: 'Define o nome de usuário alvo como "admin".' },
      { code: '-P wordlist.txt', explanation: 'Caminho para o arquivo contendo a lista de senhas candidatas.' },
      { code: '-s 22', explanation: 'Especifica a porta não padrão (ou padrão) do serviço.' },
      { code: 'ssh://10.0.0.5', explanation: 'Define o protocolo (SSH) e o endereço IP do alvo.' }
    ]
  },
  {
    id: 'py-wordlist',
    name: 'Python: Gerador Personalizado',
    category: 'Fuzzing',
    command: 'python3 generator.py --input personal.txt --merge common.txt --output final.txt',
    description: 'Script Python para mesclar wordlists pessoais com listas globais e remover duplicatas.',
    lines: [
      { code: 'python3', explanation: 'Interpretador Python versão 3.' },
      { code: 'generator.py', explanation: 'O script de automação para manipulação de listas.' },
      { code: '--input', explanation: 'Define o arquivo de entrada da sua wordlist pessoal.' },
      { code: '--merge', explanation: 'Especifica a lista global para anexar e cruzar dados.' },
      { code: '--output', explanation: 'O nome do arquivo final otimizado que será gerado.' }
    ]
  },
  {
    id: 'cloud-sieve',
    name: 'Cloud: Sieve Inspector',
    category: 'Cloud',
    command: 'cloud-sieve --bucket target-assets --provider aws --scan-depth critical',
    description: 'Ferramenta avançada para identificar permissões inseguras e vazamento de dados em storages de nuvem.',
    lines: [
      { code: 'cloud-sieve', explanation: 'Inicia o motor de auditoria de infraestrutura cloud.' },
      { code: '--bucket', explanation: 'Define o nome ou padrão do bucket a ser analisado.' },
      { code: '--provider', explanation: 'Especifica o provedor de nuvem (AWS, GCP, Azure).' },
      { code: '--scan-depth', explanation: 'Ajusta a profundidade da análise heurística.' }
    ]
  },
  {
    id: 'meta-exif',
    name: 'ExifTool: Forense Digital',
    category: 'Forense',
    command: 'exiftool -all= -tagsFromFile @ -gps:all target.jpg',
    description: 'Analisa e manipula metadados em arquivos para extrair informações de autoria e localização.',
    lines: [
      { code: 'exiftool', explanation: 'Utilitário líder em leitura e escrita de metadados.' },
      { code: '-all=', explanation: 'Comando para limpar todos os metadados (higienização).' },
      { code: '-tagsFromFile @', explanation: 'Preserva tags específicas durante a manipulação.' },
      { code: '-gps:all', explanation: 'Foca na extração ou remoção de coordenadas globais.' }
    ]
  },
  {
    id: 'breach-search',
    name: 'Breach: OSINT Correlator',
    category: 'Vazamento',
    command: 'breach-core --query "user@target.com" --deep-web --json',
    description: 'Cruza dados de vazamentos históricos para identificar credenciais comprometidas.',
    lines: [
      { code: 'breach-core', explanation: 'Motor de busca em bases de dados de vazamentos (Breach Data).' },
      { code: '--query', explanation: 'O identificador alvo (email ou nome de usuário).' },
      { code: '--deep-web', explanation: 'Inclui fontes não indexadas de fóruns especializados.' },
      { code: '--json', explanation: 'Exporta os resultados formatados para integração via API.' }
    ]
  },
  {
    id: 'social-eng',
    name: 'SocialEng: Payload Architect',
    category: 'Social Eng',
    command: 'social-gen --target "HR Manager" --context "Merger" --mode beck',
    description: 'IA especializada em criar vetores de phishing e pretextos para engenharia social.',
    lines: [
      { code: 'social-gen', explanation: 'Gerador de vetores comportamentais por IA.' },
      { code: '--target', explanation: 'Define o perfil psicológico do alvo.' },
      { code: '--context', explanation: 'O gancho situacional para o pretexto.' },
      { code: '--mode', explanation: 'Define o tipo de ataque (BEC, Smishing, Vishing).' }
    ]
  },
  {
    id: 'swift-proto',
    name: 'Swift: Proto Analyzer',
    category: 'Network',
    command: 'swift-scan --target 10.0.0.1/24 --aggressive --l2-probe',
    description: 'Analisador de protocolos de ultra-velocidade com foco em análise de pacotes de baixo nível e entropia.',
    lines: [
      { code: 'swift-scan', explanation: 'Aciona o motor Swift de descoberta de protocolos.' },
      { code: '--aggressive', explanation: 'Ignora delays de rede para máxima velocidade de varredura.' },
      { code: '--l2-probe', explanation: 'Realiza varredura diretamente na camada de enlace (Ethernet).' },
      { code: '--entropy', explanation: 'Calcula a aleatoriedade dos banners para detectar honeypots.' }
    ]
  }
];

export default function CommandLibrary() {
  const [selected, setSelected] = useState<CommandDetail | null>(null);
  const [search, setSearch] = useState('');

  const filtered = COMMAND_DATABASE.filter(cmd => 
    cmd.name.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-2 text-accent-blue mb-1">
          <Book className="w-4 h-4" />
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Documentação Técnica</span>
        </div>
        <h2 className="text-2xl font-black text-text-main uppercase tracking-tighter">Biblioteca de Comandos Catalyst</h2>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
             <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-dim" />
             <input 
              type="text"
              placeholder="Buscar comando..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface border border-border-main rounded-lg pl-10 pr-4 py-2 text-sm focus:border-accent-blue outline-none transition-all"
             />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
            {filtered.map((cmd) => (
              <button
                key={cmd.id}
                onClick={() => setSelected(cmd)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-all group",
                  selected?.id === cmd.id 
                    ? "bg-accent-blue/10 border-accent-blue/40 text-white" 
                    : "bg-surface border-border-main hover:border-white/20 text-text-dim"
                )}
              >
                <div className="text-[9px] font-bold uppercase tracking-widest opacity-50 mb-1">{cmd.category}</div>
                <div className="text-xs font-black group-hover:translate-x-1 transition-transform flex items-center justify-between">
                  {cmd.name}
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Command Detail View */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="panel space-y-6"
              >
                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                      <div className="text-xs font-bold text-accent-blue uppercase tracking-[0.2em]">{selected.category}</div>
                      <h3 className="text-2xl font-black text-white">{selected.name}</h3>
                   </div>
                   <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                      {selected.category === 'Reconhecimento' && <Globe className="w-6 h-6 text-accent-blue" />}
                      {selected.category === 'Fuzzing' && <Zap className="w-6 h-6 text-yellow-400" />}
                      {selected.category === 'Criptografia' && <Hash className="w-6 h-6 text-accent-green" />}
                      {selected.category === 'Vulnerabilidade' && <Shield className="w-6 h-6 text-accent-red" />}
                      {selected.category === 'Anonimato' && <Shield className="w-6 h-6 text-accent-blue" />}
                      {selected.category === 'OSINT' && <Globe className="w-6 h-6 text-purple-400" />}
                      {selected.category === 'Cloud' && <Cloud className="w-6 h-6 text-accent-blue" />}
                      {selected.category === 'Forense' && <Camera className="w-6 h-6 text-accent-red" />}
                      {selected.category === 'Vazamento' && <Fingerprint className="w-6 h-6 text-accent-green" />}
                      {selected.category === 'Social Eng' && <MessageSquare className="w-6 h-6 text-accent-yellow" />}
                   </div>
                </div>

                <p className="text-sm text-text-dim leading-relaxed">{selected.description}</p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase text-white flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-accent-green" />
                      Sintaxe do Comando
                    </h4>
                    <button 
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('send-to-shell', { detail: selected.command }));
                      }}
                      className="bg-accent-blue/10 border border-accent-blue/30 text-accent-blue px-3 py-1 rounded text-[9px] font-black uppercase hover:bg-accent-blue hover:text-white transition-all flex items-center gap-1.5"
                    >
                      <Zap className="w-3 h-3" />
                      Export to Shell
                    </button>
                  </div>
                  <div className="p-4 bg-black rounded-lg border border-border-main font-mono text-sm text-accent-green whitespace-pre-wrap break-all">
                    {selected.command}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-white flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-accent-blue" />
                    Análise de Parâmetros (Linha por Linha)
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {selected.lines.map((line, idx) => (
                      <div key={idx} className="flex flex-col md:flex-row md:items-center gap-3 p-3 bg-surface border border-border-main rounded-lg group hover:bg-white/5 transition-all">
                        <div className="min-w-[120px] font-mono text-xs text-white font-bold bg-white/5 px-2 py-1 rounded border border-white/10 text-center">
                          {line.code}
                        </div>
                        <div className="flex-1 text-xs text-text-dim leading-relaxed group-hover:text-text-main transition-colors italic">
                          — {line.explanation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="panel h-full flex flex-col items-center justify-center text-center p-12 space-y-6 bg-surface/30 border-dashed border-border-main">
                 <div className="relative">
                    <div className="absolute inset-0 bg-accent-blue/20 blur-3xl rounded-full" />
                    <Book className="w-20 h-20 text-accent-blue relative z-10 opacity-40 animate-pulse" />
                 </div>
                 <div className="space-y-2 max-w-md">
                    <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Catalyst_Nexus Learning Hub</h3>
                    <p className="text-sm text-text-dim">Selecione uma ferramenta na lista lateral para obter uma explicação detalhada da anatomia dos comandos e sua execução no ambiente Kali.</p>
                 </div>
                 <div className="flex items-center gap-2 text-accent-blue/60 text-[10px] font-bold uppercase tracking-widest border border-accent-blue/30 px-4 py-2 rounded-full">
                    <MousePointer2 className="w-3 h-3" />
                    Aguardando Seleção de Operador
                 </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
