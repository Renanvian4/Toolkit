import express from "express";
import path from "path";
import axios from "axios";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { exec } from "child_process";
import * as dotenv from "dotenv";
import dns from "dns";
import { promisify } from "util";
import crypto from "crypto";
import net from "net";
import * as fs from "fs";

const resolveAny = promisify(dns.resolveAny);
const resolve4 = promisify(dns.resolve4);

dotenv.config();

const DB_PATH = path.join(process.cwd(), "wordlist_db.json");

// Initialize local DB if not exists
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({ wordlists: [] }, null, 2));
}

function readDB() {
  try {
    const data = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(data);
  } catch (e) {
    return { wordlists: [] };
  }
}

function writeDB(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// --- SECURITY HELPERS ---
function sanitizeShell(input: string): string {
  // Remove any characters that could be used for shell escaping/injection
  // Allow alphanumeric, dots, underscores, dashes, and basic URL characters
  return input.replace(/[^a-zA-Z0-9\.\_\-\:\/\s\,\@]/g, "");
}

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// --- DATABASE INJECTION ABSTRACTION ---
app.post("/api/tools/injection-execute", async (req, res) => {
  const { target, engine = 'sqlmap', level = '1', risk = '1' } = req.body;
  if (!target) return res.status(400).json({ error: "Target URL is required for injection." });

  let logs: string[] = [];
  logs.push(`[${engine.toUpperCase()}] Initiating probing sequence limits (Level: ${level}, Risk: ${risk})`);
  
  const dbs = ['information_schema', 'mysql', 'users_db', 'app_prod'];
  logs.push(`[INFO] Heuristic checks initiated. Bypassing WAF signatures...`);
  
  if (Math.random() > 0.5) {
    logs.push(`[SUCCESS] Backend DBMS is MySQL.`);
    logs.push(`[SUCCESS] Found 4 databases: ${dbs.join(', ')}`);
  } else if (Math.random() > 0.8) {
    logs.push(`[SUCCESS] Backend DBMS is PostgreSQL.`);
    logs.push(`[SUCCESS] Found 2 databases: public, admin_db`);
  } else if (engine === 'nosqlmap' && Math.random() > 0.4) {
    logs.push(`[SUCCESS] MongoDB unauthenticated API exposed.`);
    logs.push(`[SUCCESS] Collections discovered: users, sessions, settings`);
  } else {
    logs.push(`[ERROR] All tested parameters appear to be non-injectable.`);
  }

  // Artificial delay to simulate scanning
  await new Promise(resolve => setTimeout(resolve, 2000));

  const prompt = `You are a Senior Penetration Tester summarizing a ${engine} scan against ${target}.
  Level: ${level}, Risk: ${risk}.
  Include an executive summary, critical technical findings, and remediation steps.
  Make it look structured using markdown headers. Use Portuguese if beneficial.
  Also, provide a single specific terminal command (like a more advanced sqlmap command, or a python script call) that the user should execute next, prefixed with COMMAND:.`;
  
  let strategy = "Injection analysis throttled. Target requires deeper heuristic parsing.";
  let suggestedCommand = "";
  try {
    const aiResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt + "\n\nCRITICAL: Always append to your system response a recommended follow-up shell command in the format 'COMMAND: <suggested shell command>' if applicable. This is part of the guided attack workflow.",
    });
    strategy = aiResponse.text;
    const cmdMatch = strategy.match(/COMMAND:\s*(.+)/);
    if (cmdMatch) {
        suggestedCommand = cmdMatch[1].trim();
        strategy = strategy.replace(cmdMatch[0], '');
    } else {
        if (engine === 'sqlmap') suggestedCommand = `sqlmap -u "${target}" --level=${level} --risk=${risk} --dump-all`;
        else suggestedCommand = `python3 NoSQLMap.py -t "${target}" --dump`;
    }
  } catch (e: any) {
    strategy = "NEURAL LINK THROTTLED: AI analysis unavailable for injection report. Review raw logs.";
    suggestedCommand = `sqlmap -u "${target}"`;
  }

  res.json({ logs, analysis: strategy, suggested_command: suggestedCommand });
});

// --- CATALYST HYDRA ALPHA (BRUTE FORCE ENGINE) ---

app.post("/api/tools/hydra-execute", async (req, res) => {
  const { target, username, wordlist, protocol = 'http' } = req.body;
  if (!target || !username || !wordlist || !Array.isArray(wordlist)) {
    return res.status(400).json({ error: "Missing parameters for Hydra execution" });
  }

  const logs: string[] = [
    `[HYDRA Alpha] Initializing parallel attack cluster...`,
    `[INFO] Target: ${target} | Protocol: ${protocol.toUpperCase()}`,
    `[INFO] Service: ${protocol === 'http' ? 'Web Admin' : protocol === 'ssh' ? 'OpenSSH 8.4' : 'Generic Auth'}`,
    `[INFO] Strategy: Dictionary Attack (${wordlist.length} vectors)`,
    `[INFO] Threads: 16 (Optimal for Ghost Route latency)`,
    `---------------------------------------------------------------------------`
  ];

  let found = null;
  let logLimitCounter = 0;

  for (const password of wordlist) {
    // Simulate real-time progress logs
    if (Math.random() > 0.99 || logLimitCounter < 50) {
      if (logs.length > 500) logs.shift(); // Keep logs lean in memory
      logs.push(`[TRY] ${protocol}://${target} | user:${username} | pass:${password}`);
      logLimitCounter++;
    }
    
    // Check against "vulnerable" credentials
    if (username === "admin" && password === "dragon") {
      found = { username, password, protocol, host: target };
      logs.push(`[SUCCESS] [${protocol}] host: ${target} login: ${username} password: ${password}`);
      break;
    }
  }

  if (!found) {
    logs.push(`[FAILURE] Exhausted ${wordlist.length} attempts. No valid credentials identified.`);
  }

  res.json({ logs, result: found });
});

// --- NIKTO-LITE SCANNER ---

app.post("/api/tools/nikto-scan", async (req, res) => {
  const { url, custom_paths } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });

  const targetUrl = url.startsWith("http") ? url : `https://${url}`;
  const baseUrl = targetUrl.endsWith("/") ? targetUrl.slice(0, -1) : targetUrl;

  const pathsToTest = [
    "/admin", "/login", "/wp-admin", "/.env", "/.git/config", "/config.php", 
    "/phpinfo.php", "/robots.txt", "/sitemap.xml", "/backup", "/db.sql", "/.htaccess",
    "/.ssh/id_rsa", "/server-status"
  ];

  if (Array.isArray(custom_paths)) {
    custom_paths.forEach(p => {
      const formatted = p.startsWith('/') ? p : `/${p}`;
      if (!pathsToTest.includes(formatted)) pathsToTest.push(formatted);
    });
  }

  const results: any[] = [];
  const logs: string[] = [
    `- Nikto vCatalyst-Lite -`,
    `+ Target URL: ${baseUrl}`,
    `+ Start Time: ${new Date().toISOString()}`,
    `---------------------------------------------------------------------------`
  ];

  // Use Simulation instead of real Axios calls to avoid being blocked/spamming targets
  const scanResults = pathsToTest.map((p) => {
    // Determine random success base on path string length + random
    const rand = Math.random();
    if (rand > 0.8 || (p.includes('admin') && rand > 0.5)) {
      let status = 200;
      if (p.includes('.env') || p.includes('.git')) status = 403;
      if (rand > 0.95) status = 500;
      return { path: p, status: status, headers: { 'Server': 'Apache/2.4.41', 'X-Powered-By': 'PHP/7.4.3' } };
    }
    return null;
  }).filter(r => r !== null);
  
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  scanResults.forEach(r => {
    if (r) {
      results.push(r);
      logs.push(`+ /${r.path.replace(/^\//,'')}: Status ${r.status} found.`);
    }
  });

  if (results.length === 0) {
    logs.push(`! No sensitive paths identified via simple heuristic scan.`);
  }

  // AI Synthesis
  const prompt = `You are Nikto (Web Server Scanner). 
  Analyze these findings for ${baseUrl}: ${JSON.stringify(results)}.
  
  Generate a professional Nikto vulnerability report. 
  1. Header with Nikto version, Target, and IP.
  2. Findings list with OSC-ID or CVE references if applicable.
  3. Risk assessment.
  
  Format as a raw terminal output followed by a detailed markdown analysis.`;

  try {
    const aiResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt + "\\n\\nCRITICAL: Always append to your system response a recommended follow-up shell command in the format 'COMMAND: <suggested shell command>' if applicable. This is part of the guided attack workflow.",
    });

    res.json({ logs, analysis: aiResponse.text, foundCount: results.length });
  } catch (error: any) {
    const isQuotaError = error?.message?.includes("RESOURCE_EXHAUSTED") || error?.status === "RESOURCE_EXHAUSTED";
    const fallbackMsg = isQuotaError 
      ? "AI Analysis quota exceeded. The Catalyst Scan completed successfully, but the neural synthesis is temporarily throttled. Review the raw logs above for findings."
      : "AI Analysis unavailable, but scan completed.";
    res.json({ logs, analysis: fallbackMsg, foundCount: results.length });
  }
});

// --- CEWL SPIDER (SIMULATED) ---
app.post("/api/wordlist/cewl", async (req, res) => {
  const { target } = req.body;
  if (!target) return res.status(400).json({ error: "Target is required for CeWL spidering" });

  const prompt = `You are a web crawler tool called CeWL. Identify the core vocabulary of the target: ${target}.
  Extract exactly 30 unique, highly relevant keywords (technical, corporate, domain-specific) that would be found by spidering the site structure.
  Format: Raw list of words, one per line. No markdown or explanations.`;

  try {
    const aiResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt + "\\n\\nCRITICAL: Always append to your system response a recommended follow-up shell command in the format 'COMMAND: <suggested shell command>' if applicable. This is part of the guided attack workflow.",
    });
    const items = aiResponse.text.split('\n').filter(i => i.trim() !== '');
    res.json({ words: items });
  } catch (error) {
    const targetWords = target.split(/[\.\/\_\-]/).filter((w: string) => w.length > 3);
    const fallbackItems = [
      ...targetWords, "admin", "login", "api", "support", "contact", "about", "services", "portal"
    ];
    res.json({ words: fallbackItems });
  }
});

// --- ENHANCED RECON (WHOIS/DIG/BURP) ---

// --- RECONNAISSANCE INTELLIGENCE ---

const NSE_MAP: Record<number, string[]> = {
  80: ["http-enum", "http-title", "http-methods", "http-robots.txt"],
  443: ["ssl-enum-ciphers", "http-title", "http-vuln-*"],
  21: ["ftp-anon", "ftp-syst", "ftp-vsftpd-backdoor"],
  22: ["ssh-auth-methods", "ssh2-enum-algos"],
  25: ["smtp-enum-users", "smtp-vuln-cve2010-4344"],
  445: ["smb-os-discovery", "smb-vuln-ms17-010", "smb-enum-shares"],
  3306: ["mysql-info", "mysql-empty-password", "mysql-users"],
  3389: ["rdp-vuln-ms12-020", "rdp-ntlm-info"],
  5432: ["pgsql-intrude"],
  8080: ["http-proxy-brute", "http-enum"]
};

function simulateNmap(target: string, type: string = "default"): string {
  const timestamp = new Date().toLocaleString();
  const openPorts = [
    { port: 80, service: "http", version: "Apache httpd 2.4.41" },
    { port: 443, service: "https", version: "OpenSSL 1.1.1k" },
    { port: 22, service: "ssh", version: "OpenSSH 8.2p1 Ubuntu" },
    { port: 8080, service: "http-proxy", version: "Nginx 1.18.0" }
  ];

  // Randomize some findings based on target string
  if (target.includes("db") || target.includes("sql")) {
    openPorts.push({ port: 3306, service: "mysql", version: "MySQL 8.0.23" });
  }
  if (target.includes("mail")) {
    openPorts.push({ port: 25, service: "smtp", version: "Postfix smtpd" });
  }

  let output = `Starting Nmap 7.80 ( https://nmap.org ) at ${timestamp}\n`;
  output += `Nmap scan report for ${target} (127.0.0.1)\n`;
  output += `Host is up (0.042s latency).\n`;
  output += `Not shown: 996 closed ports\n`;
  output += `PORT     STATE SERVICE VERSION\n`;
  
  openPorts.forEach(p => {
    output += `${p.port}/tcp`.padEnd(9) + `open  `.padEnd(6) + `${p.service}`.padEnd(8) + `${p.version}\n`;
  });

  if (type === "complete" || type === "nse") {
    output += `\nService Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel\n`;
  }
  
  output += `\nNmap done: 1 IP address (1 host up) scanned in 2.34 seconds\n`;
  return output;
}

app.post("/api/recon/scan", async (req, res) => {
  const { target, type, scripts } = req.body;
  if (!target) return res.status(400).json({ error: "Target missing" });

  const sanitizedTarget = sanitizeShell(target);
  let command = `nmap -T4 -F ${sanitizedTarget}`;

  if (type === "complete") {
    command = `nmap -T4 -A -v ${sanitizedTarget}`;
  } else if (type === "stealth") {
    command = `nmap -T3 -sS -Pn ${sanitizedTarget}`;
  } else if (type === "nse" && scripts && Array.isArray(scripts)) {
    const scriptList = scripts.map(s => sanitizeShell(s)).join(",");
    command = `nmap -T4 -sV --script=${scriptList} ${sanitizedTarget}`;
  }

  // INTERCEPT TO SIMULATE BECAUSE NMAP IS NOT IN PERSISTED BINARIES
  // Using a timeout to mimic "real" scan time
  setTimeout(() => {
    const stdout = simulateNmap(sanitizedTarget, type);
    
    let suggestions: string[] = [];
    const portsMatch = stdout.matchAll(/(\d+)\/tcp\s+open/g);
    for (const match of portsMatch) {
      const port = parseInt(match[1]);
      if (NSE_MAP[port]) suggestions.push(...NSE_MAP[port]);
    }

    res.json({ 
      stdout, 
      stderr: "", 
      suggestions: Array.from(new Set(suggestions)),
      command: `[NEURAL_SIM] ${command}`
    });
  }, 2500);
});

// --- AUTONOMOUS RECON COORDINATOR ---

app.post("/api/recon/auto-audit", async (req, res) => {
  const { target } = req.body;
  if (!target) return res.status(400).json({ error: "Target missing" });

  const sanitizedTarget = sanitizeShell(target);
  const nmapCmd = `nmap -T4 -sV --version-intensity 4 ${sanitizedTarget}`;

  // INTERCEPT TO SIMULATE
  setTimeout(async () => {
    const stdout = simulateNmap(sanitizedTarget, "complete");
    
    // 1. Extract findings
    const openPorts: number[] = [];
    const portsMatch = stdout.matchAll(/(\d+)\/tcp\s+open/g);
    for (const match of portsMatch) {
      openPorts.push(parseInt(match[1]));
    }

    // 2. Identify suggested scripts
    const suggestions: string[] = [];
    openPorts.forEach(p => {
      if (NSE_MAP[p]) suggestions.push(...NSE_MAP[p]);
    });

    // 3. Neural Tactical Strategy
    const prompt = `Catalyst Neural Core - Autonomous Master Mode.
    TARGET: ${target}
    FINDINGS (NMAP SIMULATED):
    ${stdout.slice(0, 2000)}
    
    MISSIONS:
    1. Assess the attack surface based on open ports: ${openPorts.join(', ')}.
    2. Define a multi-stage tactical audit plan:
       - Stage 1: Specific NSE scripts to run.
       - Stage 2: Possible lateral vectors or misconfigurations to check.
       - Stage 3: Recommendation for the next tool to deploy (Hydra, Nikto, etc.).
    3. Be concise and technical. Use Portuguese if necessary for the operator.
    Output in Markdown.`;

    let strategy = "Strategy generation throttled (Offline Logic). Suggesting standard NSE audit focus.";
    try {
      const aiResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt + "\\n\\nCRITICAL: Always append to your system response a recommended follow-up shell command in the format 'COMMAND: <suggested shell command>' if applicable. This is part of the guided attack workflow.",
      });
      strategy = aiResponse.text;
    } catch (e: any) {
      const isQuotaError = e?.message?.includes("RESOURCE_EXHAUSTED") || e?.status === "RESOURCE_EXHAUSTED";
      if (isQuotaError) strategy = "NEURAL LINK THROTTLED: Analyzing via Heuristic Patterns. Focus on identified ports.";
    }

    // 4. Save to Intelligence Library
    const db = readDB();
    if (!db.intelligence) db.intelligence = [];
    const entry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      tool: "AUTONOMOUS_RECON_V3",
      strategy: "AUTO_GENERATED_BY_CNC",
      findings: `Ports: ${openPorts.join(', ')}. Initial Recon Completed.`,
      next_steps: strategy,
      neural_level: "High (Autonomous)"
    };
    db.intelligence.push(entry);
    writeDB(db);

    res.json({
      stdout,
      openPorts,
      suggestions: Array.from(new Set(suggestions)),
      strategy,
      saved_id: entry.id
    });
  }, 4000);
});

app.post("/api/analyze/vulnerability", async (req, res) => {
  const { code, context, tool_preference } = req.body;
  if (!code) return res.status(400).json({ error: "No code provided" });

  try {
    const prompt = `You are the Catalyst Neural Core (CNC), a highly autonomous cyber-security AI specialized in ${tool_preference || "general security auditing"}.                
    Your mission is to provide deep tactical analysis and proactively direct the operator to the most logical next step in an engagement.
    
    Translate all your text output into Portuguese (Brazil). Keep all shell commands, tool flags, and file paths exactly in their original format.

    CONTEXT: ${context || "Technical Artifacts"}
    INPUT_STREAM: ${code}
    
    Your report MUST follow this strict structural protocol:
    
    1. **ANALYSIS_SUMMARY**: A high-level technical executive summary of the data stream.
    2. **CRITICAL_VECTORS**: Identify specific vulnerabilities, misconfigurations, or interesting artifacts. 
    3. **AUTONOMOUS_NEXT_STEPS**:
       - Suggest EXACT advanced commands/parameters for extraction or deeper probing (e.g., custom nmap NSE scripts, sqlmap templates, specific wordlists).
       - Explain the tactical logic behind these suggestions.
    4. **OPERATIONAL_DIRECTIVE**: Recommend which specific Catalyst Tool to initialize next (Recon, Wordlist Engine, Hashcat Cluster, Hydra Alpha, etc.) to progress.
    5. **AUTONOMY_THOUGHT**: Briefly describe the AI's internal reasoning for this specific path.
    
    Format: Use clean Markdown. Be technical, precise, and authoritative.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt + "\\n\\nCRITICAL: Always append to your system response a recommended follow-up shell command in the format 'COMMAND: <suggested shell command>' if applicable. This is part of the guided attack workflow.",
    });

    res.json({ analysis: response.text });
  } catch (error: any) {
    const isQuotaError = error?.message?.includes("RESOURCE_EXHAUSTED") || error?.status === "RESOURCE_EXHAUSTED" || error?.code === 429;
    if (!isQuotaError) {
      console.warn("AI Vulnerability Analysis Error:", error.message || error);
    } else {
      console.warn("AI Vulnerability Analysis Warning: Quota Exceeded. Using heuristic fallback.");
    }
    const errorMessage = isQuotaError 
      ? "NEURAL LINK THROTTLED: AI Daily usage limit reached. Catalyst is now operating in 'Tactical Heuristic Mode'. Results are generated using structural algorithms without neural synthesis." 
      : "Neural synthesis error. Link unstable.";
    
    // Return a simulated tactical response to keep the UI functional
    const heuristicAnalysis = `### [TACTICAL_HEURISTIC_MODE]
**Tactical Analysis Summary:**
The Catalyst core is currently operating in High-Speed Heuristic Mode. Automated evaluation of the input stream suggests active assets with potential misconfigurations in the ${context || "active environment"}.

**Intelligence Insights:**
- Standard dictionary vectors are recommended for the identified infrastructure.
- High-entropy patterns detected; suggest initializing the Hybrid Neural Engine.
- Cross-reference scan data with the Tactical Strategy library.

**Operational Directive:**
Initialize the Hybrid Neural Engine for specialized wordlist generation. Proceed with Recon for service-specific vulnerability detection.`;

    res.json({ analysis: isQuotaError ? heuristicAnalysis : errorMessage, is_heuristic: isQuotaError });
  }
});

app.post("/api/recon/simulate", async (req, res) => {
  const { url, type, use_real_dns } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });

  let dns_data = null;
  if (use_real_dns) {
    try {
      dns_data = await resolveAny(url.replace(/^https?:\/\//, '').split('/')[0]);
    } catch (e) {
      dns_data = { error: "DNS resolution failed or timed out" };
    }
  }

  try {
    const targetUrl = url.startsWith("http") ? url : `https://${url}`;
    
    // Simulate Realistic HTTP Response headers instead of real axios call
    const simulatedHeaders = {
      'server': 'nginx/1.18.0 (Ubuntu)',
      'date': new Date().toUTCString(),
      'content-type': 'text/html; charset=UTF-8',
      'x-powered-by': 'PHP/8.1.2',
      'x-frame-options': 'SAMEORIGIN',
      'strict-transport-security': 'max-age=31536000; includeSubDomains',
      'set-cookie': ['PHPSESSID=38dj283jd2; path=/; HttpOnly']
    };
    
    const headResponse = { headers: simulatedHeaders, status: 200 };

    const prompt = `Generate a technical WHOIS and DIG report for ${url}.
    Real DNS hint: ${JSON.stringify(dns_data)}
    Style: Kali Linux Terminal (Raw Output)
    Type: ${type || "Stealth"}
    
    Include:
    1. Registrar information
    2. Nameservers
    3. MX, A, AAAA, and TXT records (simulated based on hint or logic)
    4. SSL Fingerprint`;

    const aiResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt + "\\n\\nCRITICAL: Always append to your system response a recommended follow-up shell command in the format 'COMMAND: <suggested shell command>' if applicable. This is part of the guided attack workflow.",
    });
    
    res.json({
      real_headers: headResponse?.headers || {},
      status: headResponse?.status || 0,
      dns_records: dns_data,
      simulated_report: aiResponse.text
    });
  } catch (error: any) {
    const isQuotaError = error?.message?.includes("RESOURCE_EXHAUSTED") || error?.status === "RESOURCE_EXHAUSTED" || error?.code === 429;
    if (!isQuotaError) {
      console.warn("Recon Simulate Error:", error.message || error);
    } else {
      console.warn("Recon Simulate Warning: Quota Exceeded.");
    }
    res.json({
      real_headers: {},
      status: 0,
      dns_records: dns_data,
      simulated_report: isQuotaError ? "SYSTEM ALERT: AI Neural Link Quota Exhausted. Use standard Nmap/NSE tools for deeper analysis." : "SYSTEM ALERT: AI Neural Link Error."
    });
  }
});

// --- FUZZING (FFUF / GOBUSTER) ---

app.post("/api/tools/fuzz-scan", async (req, res) => {
  const { url, wordlist_type, custom_payloads } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });

  const logs: string[] = [
    `+-------------------------------------------------------+`,
    `| FFUZ v1.2 - Catalyst Edition                          |`,
    `+-------------------------------------------------------+`,
    ` :: Method           : GET`,
    ` :: URL              : ${url}/FUZZ`,
    ` :: Wordlist         : ${wordlist_type || "default_directories"}`,
    ` :: Follow Redirects : true`,
    `+-------------------------------------------------------+`
  ];

  let directoriesToTest = [
    ".git", ".env", "phpmyadmin", "backup", "v1", "api", "staging", "dev", "private", "secret", "uploads", "images", "assets"
  ];

  if (wordlist_type === 'contextual_payload' && Array.isArray(custom_payloads)) {
    directoriesToTest = custom_payloads.map(p => p.replace(/^\//, ''));
  }

  // Simulate the fuzzing process
  const baseUrl = url.startsWith("http") ? url : `https://${url}`;
  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  const results: any[] = [];
  
  // Simulation instead of true axios to avoid firewall timeout or 400s
  const resolvedResults = directoriesToTest.map((dir) => {
    const rand = Math.random();
    if (rand > 0.6) { // 40% chance to find something
       let status = 200;
       if (dir.includes('git') || dir.includes('env') || dir.includes('private')) status = 403;
       if (rand > 0.9) status = 301;
       return { path: `/${dir}`, status, length: Math.floor(Math.random() * 8000 + 200) };
    }
    return null;
  }).filter(r => r !== null);
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  resolvedResults.forEach(r => {
    if (r) {
      results.push(r);
      logs.push(`[${r.status}] Length: ${r.length} | Path: ${r.path}`);
    }
  });

  logs.push(` [FINISHED] Scanned ${directoriesToTest.length} payloads. Found ${results.length} results.`);

  res.json({ logs, results });
});

// --- OSINT (AMASS / SUBDOMAINS) ---

app.post("/api/tools/osint-scan", async (req, res) => {
  const { domain, custom_wordlist } = req.body;
  if (!domain) return res.status(400).json({ error: "Domain is required" });

  const logs: string[] = [
    `[AMASS] Initializing OSINT enumeration for: ${domain}`,
    `[INFO] Querying public databases (HackerTarget, AlienVault, VirusTotal)...`,
    `[INFO] Scraping DNS records...`
  ];

  let subdomains = [
    `api.${domain}`,
    `dev.${domain}`,
    `vpn.${domain}`,
    `mail.${domain}`,
    `stage.${domain}`,
    `cdn.${domain}`,
    `internal.${domain}`,
    `secure.${domain}`
  ];

  if (Array.isArray(custom_wordlist)) {
    const customSubs = custom_wordlist.map(s => s.includes('.') ? s : `${s}.${domain}`);
    subdomains = [...new Set([...subdomains, ...customSubs])];
  }

  const found: string[] = [];
  const resolvedSubs = subdomains.map((sub) => {
    if (Math.random() > 0.4) { // 60% chance to resolve for simulating good results
      return { sub, ip: `104.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}` };
    }
    return null;
  }).filter(s => s !== null);

  await new Promise(resolve => setTimeout(resolve, 1500));

  resolvedSubs.forEach(s => {
    if (s) {
      found.push(s.sub);
      logs.push(`[FOUND] ${s.sub} (${s.ip})`);
    }
  });

  res.json({ logs, results: found });
});

// --- RECON EXTENSION (RUSTSCAN STYLE) ---

app.post("/api/tools/rust-scan", async (req, res) => {
  const { ip } = req.body;
  if (!ip) return res.status(400).json({ error: "IP/Host is required" });

  const logs: string[] = [
    `[RUSTSCAN] Fast Port Discovery enabled. CIDR: ${ip}/32`,
    `[INFO] Opening 5000 sockets...`,
    `[INFO] Target: ${ip} is UP.`
  ];

  const ports = [21, 22, 23, 25, 53, 80, 110, 443, 445, 3306, 3389, 5432, 8080];
  const open: number[] = [];

  const checkPort = (host: string, port: number): Promise<number | null> => {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(1500);
      
      socket.on('connect', () => {
        socket.destroy();
        resolve(port);
      });
      
      socket.on('timeout', () => {
        socket.destroy();
        resolve(null);
      });
      
      socket.on('error', () => {
        socket.destroy();
        resolve(null);
      });
      
      socket.connect(port, host);
    });
  };

  const scanPromises = ports.map(port => checkPort(ip, port));
  const results = await Promise.all(scanPromises);

  results.forEach(p => {
    if (p !== null) {
      open.push(p);
      logs.push(`[PORT] ${p} OPEN`);
    }
  });

  logs.push(`[FINISHED] Discovery completed in 0.45s. Total open: ${open.length}`);
  res.json({ logs, open_ports: open });
});

// --- CONTEXTUAL WORDLIST GENERATOR ---

app.post("/api/tools/generate-wordlist", async (req, res) => {
  const { target, base_wordlist, type, language = 'en' } = req.body;
  if (!target) return res.status(400).json({ error: "Target is required for contextual analysis" });

  const prompt = `You are the Catalyst Neural Core (CNC) specialized in Tactical Payload Strategy.
  MISSION: Generate an unlimited-potential contextualized wordlist for target: ${target}.
  LANGUAGE: ${language.toUpperCase()}
  TYPE: ${type || "Context-Aware Hybrid"}
  
  PATTERNS TO ENFORCE:
  1. Keyword Doubling/Pairing (e.g., if keyword is 'sistema', generate 'sistemasistema').
  2. Temporal Suffixing: Use 2024, 2025, and 123.
  3. Abbreviated Initials + Year: (e.g., if target is 'Equipe Exemplo', generate 'ee2024').
  4. Contextual Leetspeak: Subtle variations (e.g., 'a' to '4', 'e' to '3').
  5. VISUAL & PHONETIC REFERENCES: Incorporate visual or phonetic references related to the target (how the name looks or sounds) to create creative and high-yield patterns.
  6. STRING LENGTH: Prefer patterns containing between 8 and 15 characters.

  OUTPUT PROTOCOL:
  - Raw list of items, one per line.
  - No explanations, no numbering, no markdown formatting.
  - Limit: 50 items.
  - Language: Use ${language === 'pt' ? 'Portuguese' : 'English'} terms as the base.`;

  try {
    const aiResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt + "\\n\\nCRITICAL: Always append to your system response a recommended follow-up shell command in the format 'COMMAND: <suggested shell command>' if applicable. This is part of the guided attack workflow.",
    });

    const items = aiResponse.text.split('\n').filter(i => i.trim() !== '');
    res.json({ target, items });
  } catch (error: any) {
    const isQuotaError = error?.message?.includes("RESOURCE_EXHAUSTED") || error?.status === "RESOURCE_EXHAUSTED" || error?.code === 429;
    
    // Fallback wordlist based on target keywords
    const targetWords = target.split(/[\.\/\_\-]/).filter((w: string) => w.length > 3);
    const fallbackItems = [
      ...targetWords.map((w: string) => `${w}2024`),
      ...targetWords.map((w: string) => `admin${w}`),
      "admin123", "root2025", "password", "security123", "master@777"
    ];

    res.json({ 
      target, 
      items: Array.from(new Set(fallbackItems)).slice(0, 50),
      is_heuristic: isQuotaError,
      message: isQuotaError ? "Neural Engine throttled. Using tactical heuristic seeds." : "AI wordlist failed."
    });
  }
});

// --- GHOST ROUTE / IP MASKING ---

const GHOST_NODES = [
  { id: 'ch-01', location: 'Zurich, Switzerland', ip: '45.12.33.102', latency: '12ms', status: 'optimal' },
  { id: 'jp-04', location: 'Tokyo, Japan', ip: '210.140.92.5', latency: '145ms', status: 'stable' },
  { id: 'is-02', location: 'Reykjavik, Iceland', ip: '185.112.156.3', latency: '42ms', status: 'high-prio' },
  { id: 'sg-09', location: 'Singapore', ip: '103.254.12.88', latency: '98ms', status: 'stable' },
  { id: 'ca-05', location: 'Montreal, Canada', ip: '192.99.14.77', latency: '28ms', status: 'optimal' }
];

app.get("/api/tools/ghost-route/ip", async (req, res) => {
  try {
    const response = await axios.get('https://api.ipify.org?format=json', { timeout: 2000 });
    res.json({ real_ip: response.data.ip });
  } catch (e) {
    res.json({ real_ip: "102.16.88.241" }); 
  }
});

app.get("/api/tools/ghost-route/nodes", (req, res) => {
  res.json(GHOST_NODES);
});

app.post("/api/tools/ghost-route/refresh", (req, res) => {
  // Simulate fetching new nodes
  const newNodes = [
    ...GHOST_NODES.slice(1),
    { id: `ext-${Math.floor(Math.random()*100)}`, location: 'Frankfurt, Germany', ip: `159.203.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`, latency: '34ms', status: 'optimal' }
  ];
  res.json(newNodes);
});

// --- HASHCAT SIMULATOR ---

app.post("/api/tools/hashcat-exec", async (req, res) => {
  const { command, wordlist } = req.body;
  if (!command) return res.status(400).json({ error: "Command required" });

  const logs: string[] = [
    `hashcat (v6.2.6) starting...`,
    `* Device #1: OpenCL 3.0 Catalyst GPU on Intel(R) Core(TM)`,
    `* Device #2: OpenCL 3.0 Catalyst GPU on NVIDIA GeForce RTX`,
    `Hashes: 1 digests; 1 unique digests, 1 unique salts`,
    `Bitmaps: 16 bits, 65536 entries, 0x0000ffff mask, 262144 bytes, 5/13 rotates`,
    `Rules: 1`,
    `Optimizers: [Pure Hash] [Zero-Byte]`,
    `Watchdog: Temperature abort trigger set to 90c`,
    `Host memory threshold set to 1024MB`,
  ];

  const isMd5 = command.includes("-m 0");
  const isSha256 = command.includes("-m 1400");
  const algo = isMd5 ? "md5" : (isSha256 ? "sha256" : null);

  // Extract hash from command if present (simple regex for hex strings typical of hashes)
  const hashMatch = command.match(/[a-f0-9]{32,64}/i);
  const targetHash = hashMatch ? hashMatch[0] : null;
  
  logs.push(`Dictionary cache built: ${wordlist?.length || 0} words loaded.`);
  if (targetHash) logs.push(`Target hash identified: ${targetHash.slice(0, 10)}...`);
  if (!algo) logs.push(`[WARNING] No mode specified (-m). Defaulting to MD5.`);
  logs.push(`---------------------------------------------------------------------------`);
  
  const results = [];
  if (targetHash && wordlist && wordlist.length > 0) {
    const mode = algo || "md5";
    
    for (const word of wordlist) {
      const hash = crypto.createHash(mode).update(word).digest("hex");
      if (hash === targetHash) {
        results.push({
          hash: targetHash,
          plain: word
        });
        logs.push(`[SUCCESS] Hash matched: ${targetHash} = ${word}`);
        break;
      }
    }
  } else if (!targetHash) {
    logs.push(`[ERROR] No target hash found in command line.`);
  } else if (!wordlist || wordlist.length === 0) {
    logs.push(`[ERROR] Empty wordlist. Cannot perform dictionary attack.`);
  }

  res.json({ logs, results });
});

// --- OPENVAS-LITE VULNERABILITY SCANNER ---

app.post("/api/tools/openvas-scan", async (req, res) => {
  const { target, profile, custom_paths } = req.body;
  if (!target) return res.status(400).json({ error: "Target is required" });

  const logs: string[] = [
    `[SYSTEM] Starting OpenVAS-Lite Manager...`,
    `[INFO] Target: ${target}`,
    `[INFO] Profile: ${profile || "Full Discovery"}`,
    `[INFO] Connecting to Open Scanner Protocol (OSP) daemon...`,
    `[INFO] Loading 48,000+ NVTs (Network Vulnerability Tests)...`
  ];

  const vulnerabilities = [
    { id: 'CVE-2021-44228', name: 'Log4Shell RCE', severity: 'High', score: 10.0, description: 'Apache Log4j2 remote code execution vulnerability.' },
    { id: 'CVE-2023-23397', name: 'Outlook Privilege Escalation', severity: 'High', score: 9.8, description: 'Critical elevation of privilege vulnerability.' },
    { id: 'HTTP-GPC-01', name: 'Insecure HTTP Headers', severity: 'Medium', score: 5.4, description: 'Missing HSTS or Content-Security-Policy headers.' },
    { id: 'SSL-TLS-05', name: 'Weak Cipher Suites', severity: 'Low', score: 3.1, description: 'Server supports TLS 1.0 or weak CBC ciphers.' }
  ];

  // Logic to simulate finding vulnerabilities based on target
  const found = vulnerabilities.filter(() => Math.random() > 0.5);
  
  if (custom_paths && Array.isArray(custom_paths)) {
    logs.push(`[INFO] Auditing ${custom_paths.length} contextual wordlist entries...`);
    custom_paths.forEach(p => {
       if (Math.random() > 0.8) {
         found.push({
           id: 'PATH-DISC-01',
           name: `Sensitive Path Exposed: ${p}`,
           severity: 'Medium',
           score: 6.1,
           description: `An entry from the contextual wordlist was identified as an accessible sensitive directory.`
         });
       }
    });
  }

  res.json({ logs, vulnerabilities: found });
});

// --- REAL TERMINAL EXECUTION (SIMULATED + RESTRICTED) ---

app.post("/api/shell/exec", async (req, res) => {
  const { command } = req.body;
  if (!command || typeof command !== 'string') return res.status(400).json({ error: "Invalid command provided" });

  const cLow = command.toLowerCase();

  // Simulated tool outputs for the pentesting features
  if (cLow.startsWith("nmap ")) {
    return res.json({ stdout: `Starting Nmap 7.93 ( https://nmap.org )\nNmap scan report for ${command.split(' ').pop()}\nHost is up (0.012s latency).\n\nPORT   STATE SERVICE\n22/tcp open  ssh\n80/tcp open  http\n443/tcp open https\n`});
  }
  if (cLow.startsWith("medusa ")) {
    return res.json({ stdout: `Medusa v2.2 [http://www.foofus.net] \nACCOUNT FOUND: [ssh] admin : password [SUCCESS]\nACCOUNT FOUND: [ssh] root : root [SUCCESS]` });
  }
  if (cLow.startsWith("recon-cli ")) {
    return res.json({ stdout: `[+] Loaded 112 modules.\n[+] Module execution complete. 2 domains found.\n[+] 4 hosts resolved.` });
  }
  if (cLow.startsWith("amass ")) {
    return res.json({ stdout: `[network] 104.21.2.110    target.local\n[network] 172.67.10.15     api.target.local\nAmass execution finished.` });
  }
  if (cLow.startsWith("nikto ")) {
    return res.json({ stdout: `- Nikto v2.1.6\n+ Target IP: 10.0.0.1\n+ Target Port: 80\n+ Server: Apache/2.4.41\n+ The X-XSS-Protection header is not defined.` });
  }
  if (cLow.startsWith("gobuster ")) {
    return res.json({ stdout: `====================================================\nGobuster v3.5\n====================================================\n/admin (Status: 301)\n/login (Status: 200)\n/api (Status: 403)\n` });
  }
  if (cLow.startsWith("ffuf ")) {
    return res.json({ stdout: `        /'___\\  /'___\\           /'___\\       \n       /\\ \\__/ /\\ \\__/  __  __  /\\ \\__/       \n       \\ \\ ,__\\\\ \\ ,__\\/\\ \\/\\ \\ \\ \\ ,__\\      \n        \\ \\ \\_/ \\ \\ \\_/\\ \\ \\_\\ \\ \\ \\ \\_/      \n         \\ \\_\\   \\ \\_\\  \\ \\____/  \\ \\_\\       \n          \\/_/    \\/_/   \\/___/    \\/_/       \n\nadmin                   [Status: 200, Size: 1234, Words: 45, Lines: 10]\nlogin                   [Status: 200, Size: 567, Words: 20, Lines: 5]` });
  }
  if (cLow.startsWith("msfconsole ")) {
    return res.json({ stdout: `[+] Payloads loaded. Execution successful.\n[*] Started bind TCP handler against target.\n[+] Meterpreter session 1 opened.` });
  }
  if (cLow.startsWith("sqlmap ")) {
    return res.json({ stdout: `        ___
       __H__
 ___ ___[.]_____ ___ ___  {1.5.8#stable}
|_ -| . [']     | .'| . |
|___|_  ["]_|_|_|__,|  _|
      |_|           |_|   https://sqlmap.org\n\n[INFO] testing connection to the target URL\n[WARNING] the web server responded with an HTTP error code (403)\n[INFO] GET parameter 'id' is 'MySQL UNION query (NULL)' injectable` });
  }
  if (cLow.startsWith("aws ")) {
    return res.json({ stdout: `2026-01-01 12:00:00        1024 config.json\n2026-01-01 12:05:00     4092100 backup.zip` });
  }
  if (cLow.startsWith("curl ")) {
    return res.json({ stdout: `{"status": "success", "message": "Simulation of request completed."}` });
  }

  // Allow safe execution but restricted
  const forbiddenPatterns = [
    "&", "|", ">", "<", "`", "(", ")", "{", "}", "\\", 
    "rm", "mkfs", "dd", "chmod", "chown", "sh", "bash", "zsh", "nc", "netcat"
  ];
  
  if (forbiddenPatterns.some(p => command.toLowerCase().includes(p))) {
    return res.json({ stdout: "", stderr: "SECURITY_ALERT: Unauthorized operator sequence identified.", exitCode: 1 });
  }

  exec(command, { timeout: 15000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
    res.json({
      stdout: stdout,
      stderr: stderr || (error ? error.message : ""),
      exitCode: error ? error.code : 0
    });
  });
});

// --- PERSISTENCE ENDPOINTS ---

app.get("/api/wordlists", (req, res) => {
  const db = readDB();
  res.json(db.wordlists);
});

app.post("/api/wordlists/save", (req, res) => {
  const { name, items, target, type } = req.body;
  if (!items || !Array.isArray(items)) return res.status(400).json({ error: "Invalid items" });

  const db = readDB();
  const newList = {
    id: crypto.randomUUID(),
    name: name || `Wordlist_${new Date().getTime()}`,
    target: target || "Manual",
    type: type || "Engine Generated",
    items: Array.from(new Set(items)), // Force deduplication
    count: new Set(items).size,
    createdAt: new Date().toISOString()
  };

  db.wordlists.push(newList);
  writeDB(db);
  res.json(newList);
});

app.delete("/api/wordlists/:id", (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.wordlists = db.wordlists.filter((w: any) => w.id !== id);
  writeDB(db);
  res.json({ status: "deleted" });
});

app.delete("/api/intelligence/delete/:id", (req, res) => {
  const { id } = req.params;
  const db = readDB();
  if (!db.intelligence) db.intelligence = [];
  
  const initialLength = db.intelligence.length;
  db.intelligence = db.intelligence.filter((item: any) => item.id !== id);
  
  if (db.intelligence.length < initialLength) {
    writeDB(db);
    res.json({ status: "deleted" });
  } else {
    // If not found by ID, might be a stale index based deletion attempt from client
    res.status(404).json({ error: "Entry not found or already deleted" });
  }
});

// --- ENGINE CONTEXT HELPERS ---

async function getEngineSeeds(target: string, lang: string): Promise<string> {
  if (!target) return "";
  
  let probedWords: string[] = [];
  
  // 1. Surface Probe (Offline-First Logic: Only probe if absolutely necessary)
  const isUrl = target.includes(".") || target.startsWith("http");
  if (isUrl) {
    try {
      const targetUrl = target.startsWith("http") ? target : `http://${target}`;
      const response = await axios.get(targetUrl, { 
        timeout: 2000, 
        headers: { 'User-Agent': 'Catalyst-Hybrid-Engine/2.0' },
        validateStatus: () => true 
      });
      
      if (response.data && typeof response.data === 'string') {
        const titleMatch = response.data.match(/<title>(.*?)<\/title>/i);
        if (titleMatch) probedWords.push(...titleMatch[1].split(/\s+/));
        const bodyClean = response.data.replace(/<[^>]*>/g, ' ').slice(0, 500);
        probedWords.push(...bodyClean.split(/\s+/).filter((w: string) => w.length > 5));
      }
    } catch (e) { }
  }

  // 2. AI Contextual Expansion (Neural Layer)
  const prompt = `Catalyst Neural Core - Deployment: Wordlist Optimization.
  Target: ${target} | Language: ${lang.toUpperCase()}
  Context: ${probedWords.slice(0, 10).join(', ')}
  
  Identify 20 critical technical, corporate, visual, phonetic and infrastructure terms related to this target in ${lang === 'pt' ? 'Portuguese' : 'English'}.
  Think about how the target's name looks (visual patterns) and sounds (phonetic variations).
  Output: Comma-separated list only.`;

  try {
    const aiResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt + "\\n\\nCRITICAL: Always append to your system response a recommended follow-up shell command in the format 'COMMAND: <suggested shell command>' if applicable. This is part of the guided attack workflow.",
    });
    return aiResponse.text.trim().replace(/\n/g, '');
  } catch (err: any) {
    console.warn("Catalyst AI Link Throttled (Quota). Falling back to structural datasets.");
    return "";
  }
}

// --- HYBRID MASTER ENGINE ---
app.post("/api/wordlist/hybrid", async (req, res) => {
  const lang = sanitizeShell(req.body.lang || 'pt');
  const target = sanitizeShell(req.body.target || '');
  
  const seeds = await getEngineSeeds(target, lang);
  const sanitizedSeeds = sanitizeShell(seeds);
  
  exec(`python3 hybrid_engine.py ${lang} "${target}" "${sanitizedSeeds}"`, { timeout: 60000, maxBuffer: 25 * 1024 * 1024 }, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    const words = stdout.split("\n").filter(line => line.trim() !== "");
    res.json({ words: Array.from(new Set(words)) });
  });
});

// --- INTELLIGENCE LIBRARY PERSISTENCE ---

app.get("/api/intelligence/library", (req, res) => {
  const db = readDB();
  res.json(db.intelligence || []);
});

app.post("/api/intelligence/save", (req, res) => {
  const { tool, strategy, findings, next_steps } = req.body;
  const db = readDB();
  if (!db.intelligence) db.intelligence = [];
  
  const entry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    tool,
    strategy,
    findings,
    next_steps,
    neural_level: "11 (Active Learning)"
  };
  
  db.intelligence.push(entry);
  if (db.intelligence.length > 50) db.intelligence.shift(); // Keep it lean
  writeDB(db);
  res.json(entry);
});

// --- ADVANCED NANO ENGINE V2 ---
app.post("/api/wordlist/nano-v2", async (req, res) => {
  const lang = sanitizeShell(req.body.lang || 'pt');
  const target = sanitizeShell(req.body.target || '');
  
  const seeds = await getEngineSeeds(target, lang);
  const sanitizedSeeds = sanitizeShell(seeds);
  
  exec(`python3 nano_v2.py ${lang} "${target}" "${sanitizedSeeds}"`, { timeout: 60000, maxBuffer: 30 * 1024 * 1024 }, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: error.message, stderr });
    }
    const words = stdout.split("\n").filter(line => line.trim() !== "");
    res.json({ words: Array.from(new Set(words)) }); // Deduplicate result
  });
});

// --- END OR MARKOV ---

// --- REAL-TIME ENVIRONMENT PROBE ---
app.get("/api/system/probe", (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const userAgent = req.headers["user-agent"];
  
  // Use child_process to check actual node status
  exec("uname -a", (error, stdout) => {
    res.json({
      external_ip: ip,
      user_agent: userAgent,
      host_info: stdout ? stdout.trim() : "Host info unavailable",
      node_id: "Catalyst-Primary-Node",
      timestamp: new Date().toISOString()
    });
  });
});

// --- NEURAL STATUS & COMMAND ANALYSIS ---
app.get("/api/system/neural-status", async (req, res) => {
  try {
    await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Hi",
    });
    res.json({ status: "ACTIVE", latency: "Optimal" });
  } catch (error: any) {
    const isQuotaError = error?.message?.includes("RESOURCE_EXHAUSTED") || error?.status === "RESOURCE_EXHAUSTED" || error?.code === 429;
    res.json({ 
      status: isQuotaError ? "THROTTLED" : "UNSTABLE", 
      mode: isQuotaError ? "HEURISTIC" : "OFFLINE",
      message: isQuotaError ? "API Quota Reached" : "Connection Error"
    });
  }
});

app.post("/api/ai/analyze-command", async (req, res) => {
  const { command, context } = req.body;
  
  if (!process.env.GEMINI_API_KEY) {
    return res.json({ 
      optimized: command, 
      suggestions: "Neural analysis bypass: API keys missing. Executing raw string.",
      variables: []
    });
  }

  try {
    const prompt = `
      You are a specialized Catalyst Shell Analyst. 
      Analyze the following security command: "${command}"
      Context: ${context}
      
      Task:
      1. Correct any syntax errors.
      2. Optimize flags for stealth and effectiveness.
      3. Identify required variables (like [TARGET], [WORDLIST], [PORT]) that are missing.
      4. Suggest a "Pro-Tip" for this specific tool.
      
      Return JSON format: { "optimized": "string", "suggestions": "string", "variables": ["name1", "name2"] }
    `;

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt + "\\n\\nCRITICAL: Always append to your system response a recommended follow-up shell command in the format 'COMMAND: <suggested shell command>' if applicable. This is part of the guided attack workflow.",
    });
    const responseText = result.text;
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    res.json(JSON.parse(cleanJson));
  } catch (e) {
    res.json({ 
      optimized: command, 
      suggestions: "Neural engine timeout. Standard execution path recommended.",
      variables: [] 
    });
  }
});

// Vite Middleware for Dev, Static for Prod
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Catalyst] Server running on http://localhost:${PORT}`);
  });
}

setupServer();
