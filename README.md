# NetProbe

Sistema web de monitoramento contínuo e diagnóstico ativo de roteadores MikroTik. Conecte via IP, visualize dados em tempo real e execute ferramentas de diagnóstico diretamente da interface.

## Demonstração

> Frontend hospedado na **Vercel** · Backend hospedado no **Render**

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Angular 17 (standalone components) |
| Estilo | TailwindCSS 3 — tema escuro |
| Gráficos | Chart.js + ng2-charts |
| HTTP | Angular HttpClient |
| Backend | Spring Boot 3.2 + Java 21 |
| Protocolo | RouterOS API (porta 8728) · REST API (porta 80) |

---

## Funcionalidades

### Dashboard de monitoramento
- Polling automático a cada **60 segundos** com countdown visual
- Forçar atualização manual a qualquer momento
- Timestamp da última coleta

### Dados coletados em tempo real
- **Visão Geral** — CPU %, RAM, disco, uptime, versão do RouterOS; gráficos de linha com histórico da sessão
- **Interfaces** — nome, tipo, status up/down, MAC, MTU, RX/TX bytes, erros
- **Rotas** — tabela com filtro por tipo (static, dynamic, ospf, bgp…)
- **ARP** — IP, MAC, interface, status
- **DHCP** — hostname, IP, MAC, status (bound/waiting/expired), expiração
- **Logs** — últimas 50 entradas com filtro por tópico

### Diagnóstico ativo
| Ferramenta | Descrição |
|---|---|
| Ping | Executa `/tool ping` no MikroTik; exibe pacotes enviados/recebidos/perdidos e RTT médio |
| Traceroute | Executa `/tool traceroute`; tabela de saltos com IP, hostname e latência |
| Bandwidth Test | Executa `/tool bandwidth-test`; requer bandwidth-server habilitado no destino |

### Detecção automática de API
O backend tenta primeiro a **REST API** (RouterOS v7+) na porta 80. Se falhar, cai automaticamente para a **RouterOS API proprietária** na porta 8728 (v6 e anteriores).

---

## Estrutura do projeto

```
src/app
├── components
│   ├── connection-form      ← formulário IP / usuário / senha
│   ├── dashboard            ← container, abas, header, polling
│   ├── system-resources     ← cards + gráficos CPU e RAM
│   ├── interfaces-table
│   ├── routes-table         ← filtrável por tipo
│   ├── arp-table
│   ├── dhcp-table
│   ├── logs-viewer          ← filtrável por tópico
│   └── diagnostic-panel     ← ping, traceroute, bandwidth test
├── services
│   └── mikrotik.service.ts  ← HttpClient + polling + histórico
└── models
    └── netprobe.models.ts   ← interfaces TypeScript
```

---

## Desenvolvimento local

### Pré-requisitos
- Node.js 18+
- Angular CLI 17: `npm install -g @angular/cli@17`

### Instalação

```bash
git clone https://github.com/sagradev/NetProbe.git
cd NetProbe
npm install
```

### Rodar em desenvolvimento

```bash
ng serve
```

Acesse `http://localhost:4200`. O backend deve estar rodando em `http://localhost:8080`.

### Build de produção

```bash
ng build --configuration production
```

Os artefatos ficam em `dist/netprobe-front/`.

---

## Environments

| Arquivo | URL do backend |
|---|---|
| `src/environments/environment.ts` | `http://localhost:8080/api` |
| `src/environments/environment.prod.ts` | `https://netprobe-backend.onrender.com/api` |

O `angular.json` faz o `fileReplacement` automaticamente no build de produção.

---

## Deploy

### Frontend — Vercel
1. Importe o repositório no [vercel.com](https://vercel.com)
2. Framework preset: **Angular**
3. Build command: `ng build --configuration production`
4. Output directory: `dist/netprobe-front/browser`

### Backend — Render
1. Crie um **Web Service** apontando para o repositório do backend
2. Use o `Dockerfile` na raiz do backend
3. Copie a URL gerada e atualize `environment.prod.ts`

> O plano gratuito do Render tem **cold start de até 1 minuto** após inatividade. O frontend já usa timeout de 60s na primeira requisição.

---

## Variáveis de CORS (backend)

No `application.properties` do backend, adicione as origens permitidas:

```properties
netprobe.cors.allowed-origins=http://localhost:4200,https://netprobe.vercel.app
```

---

## Licença

MIT
