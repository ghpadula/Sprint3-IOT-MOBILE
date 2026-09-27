# Ford Conecta — *Prever para reter*

App mobile (Android/iOS) desenvolvido para a **Sprint 3 de Mobile Development & IoT** da FIAP em parceria com a Ford.
Evolução do app **Ford Care+** (Sprint 2), agora integrado à proposta completa do **Ford Conecta**: machine learning, cockpit da concessionária e app do cliente numa só plataforma.

| | |
|---|---|
| 💻 **Repositório** | [github.com/ghpadula/Sprint3-IOT-MOBILE](https://github.com/ghpadula/Sprint3-IOT-MOBILE) |
| 📦 **APK (Android)** | **[Baixar a versão mais recente](https://github.com/ghpadula/Sprint3-IOT-MOBILE/releases/latest)** (GitHub Releases) |
| 🎬 **Vídeo de demonstração** | [YouTube (não listado)](https://youtu.be/COLE_O_LINK_AQUI) |
| 🔑 **Acesso de demonstração** | Cliente `cliente@fordconecta.com` · Concessionária `consultor@fordconecta.com` · senha `ford2026` (também há atalhos na tela de login) |

---

## Integrantes

| Nome | RM |
|---|---|
| 
| Gabriel Henrique Padula | 554907 |
| 

---

## O desafio Ford escolhido

**Desafio 02 — Impulsionando o VIN Share na América do Sul com Soluções Inteligentes.**

*VIN Share* é a porcentagem de veículos Ford que fazem manutenção na rede oficial. Depois que a garantia acaba, boa parte dos proprietários deixa a rede, e a concessionária normalmente só percebe quando o cliente já foi embora.

**Nossa solução:** o Ford Conecta **antecipa a evasão**. Um modelo de ML estima a probabilidade de cada cliente sair da rede. O **cockpit** mostra à concessionária quem priorizar e por quê, e o **app do cliente** entrega alertas do veículo conectado (IoT), ofertas personalizadas e agendamento em poucos toques. Cada ação do cliente volta para o modelo, fechando o ciclo:

```
 PREVER ──────────▶ AGIR ──────────────▶ ENGAJAR ─────────────▶ APRENDER
 modelo de ML       cockpit mostra        app entrega alerta     agendamento, oferta
 estima o risco     prioridade + ação     IoT + oferta + agenda  vista/recusada viram
     ▲                                                           features do modelo
     └───────────────────────── retroalimentação ◀──────────────────────┘
```

> **Exemplo real no app:** o cliente de demonstração começa com **40 % de risco (médio)**. Depois que ele agenda a revisão pela oferta de fim de garantia, o cockpit recalcula **na hora** e o risco cai para **10 % (baixo)**. Os prints 25a e 25 mostram o antes e o depois.

---

## Funcionalidades

### App do cliente
- **Onboarding** em 3 passos e **login** com validação de campos, erro da API e sessão persistente.
- **Início:** saúde do veículo (0–100), status da conexão, alertas IoT, próxima revisão com barra de progresso, próximo serviço, ofertas e status da garantia.
- **Meu veículo (IoT):** telemetria em tempo real (hodômetro, vida útil do óleo, bateria, combustível, temperatura, ignição, pressão dos 4 pneus, códigos de falha OBD-II) vinda de um **simulador** ou de um **broker MQTT** real. Inclui histórico da bateria, atualização manual da quilometragem e injeção de falha para demonstração.
- **Alertas → ação:** cada alerta (óleo, bateria, pneu, DTC, temperatura) gera notificação e leva direto ao agendamento do serviço correspondente.
- **Ofertas personalizadas** geradas a partir da garantia, da quilometragem, da telemetria e do risco estimado, sempre com a explicação *"Por que estou vendo isto?"*. O cliente pode aceitar ou dispensar a oferta.
- **Agendamento em 4 passos:** serviço → concessionária → dia/horário (disponibilidade consultada na API) → confirmação com desconto aplicado. Termina numa tela de sucesso e dá **+180 pontos**.
- **Agenda:** próximos e histórico, detalhe do agendamento, ligar, abrir rota no mapa e cancelar (com estorno de pontos e remoção do lembrete).
- **Notificações:** central in-app, **notificações locais** do Android (confirmação, alerta do veículo, oferta nova) e **lembrete agendado 24 h antes** do serviço. Tocar na notificação abre a tela certa.
- **Pontos Ford:** níveis Blue → Blue Pro → Blue Elite e resgate de benefícios com código.
- **Rede oficial:** concessionárias e busca de endereço por CEP na **API pública ViaCEP**.
- **Perfil e privacidade (LGPD):** consentimentos granulares (telemetria, ofertas personalizadas, push), direito de acesso ("Ver meus dados") e exclusão dos dados locais.

### Cockpit da concessionária (mesmo app, perfil "concessionária")
- **Painel:** VIN Share e tendência de 6 meses com meta, clientes em alto risco, leads em aberto, conversão, distribuição da carteira por risco e prioridades do dia.
- **Clientes:** lista ordenada por probabilidade de evasão, com busca e filtro por faixa de risco.
- **Detalhe do cliente:** gauge de risco, **próxima melhor ação**, **explicabilidade** ("Por que esse risco?", com a contribuição de cada variável), dados do veículo e linha do tempo de interações.
- **Enviar oferta** por App (chega **em tempo real** no app do cliente), WhatsApp ou ligação, e **registrar contato**.
- **Leads:** funil enviado → visualizado → agendado → perdido, atualizado pelas ações do cliente no app.

### "Algo a mais"
1. **IoT de verdade:** assinatura MQTT via WebSocket seguro (`wss`), com validação do payload. O repositório inclui **simulador Node**, **broker local** e **firmware ESP32** (compatível com Wokwi) que publicam no mesmo tópico.
2. **ML embarcado e explicável:** regressão logística rodando no aparelho, com a contribuição de cada variável exibida para o consultor.
3. **Ciclo fechado demonstrável:** o que o cliente faz no app muda o risco no cockpit em tempo real.
4. **CI/CD:** GitHub Actions faz typecheck, lint, auditoria de dependências e bundle a cada push, e **gera o APK automaticamente** ao criar uma tag.

---

## Demonstração visual (todas as telas)

> Prints capturados do build atual, em viewport de celular (390 × 844).

### Acesso
| Onboarding | Onboarding (2/3) | Login | Validação dos campos | Erro da API |
|---|---|---|---|---|
| <img src="docs/screenshots/01-onboarding.jpg" width="170"> | <img src="docs/screenshots/01b-onboarding-2.jpg" width="170"> | <img src="docs/screenshots/02-login.jpg" width="170"> | <img src="docs/screenshots/03-login-validacao.jpg" width="170"> | <img src="docs/screenshots/03b-login-erro-api.jpg" width="170"> |

### Início e veículo conectado (IoT)
| Início | Início (rolagem) | Meu veículo | Pneus e alertas | Fonte MQTT (broker real) |
|---|---|---|---|---|
| <img src="docs/screenshots/04-inicio.jpg" width="170"> | <img src="docs/screenshots/04b-inicio-scroll.jpg" width="170"> | <img src="docs/screenshots/05-veiculo.jpg" width="170"> | <img src="docs/screenshots/05b-veiculo-pneus.jpg" width="170"> | <img src="docs/screenshots/30-veiculo-mqtt.jpg" width="170"> |

### Ofertas e agendamento (fluxo principal)
| Ofertas | Detalhe da oferta | 1. Serviço | 2. Concessionária | 3. Dia e horário |
|---|---|---|---|---|
| <img src="docs/screenshots/06-ofertas.jpg" width="170"> | <img src="docs/screenshots/07-oferta-detalhe.jpg" width="170"> | <img src="docs/screenshots/08-agendar-1-servico.jpg" width="170"> | <img src="docs/screenshots/09-agendar-2-concessionaria.jpg" width="170"> | <img src="docs/screenshots/10-agendar-3-horario.jpg" width="170"> |

| 4. Confirmação | Sucesso | Agenda | Detalhe do agendamento | Confirmação de cancelamento |
|---|---|---|---|---|
| <img src="docs/screenshots/11-agendar-4-confirmacao.jpg" width="170"> | <img src="docs/screenshots/12-agendar-sucesso.jpg" width="170"> | <img src="docs/screenshots/13-agenda.jpg" width="170"> | <img src="docs/screenshots/14-agendamento-detalhe.jpg" width="170"> | <img src="docs/screenshots/14b-dialogo-cancelar.jpg" width="170"> |

### Relacionamento, rede e perfil
| Pontos Ford | Notificações | Revisões e serviços | Rede + ViaCEP | Perfil |
|---|---|---|---|---|
| <img src="docs/screenshots/15-pontos.jpg" width="170"> | <img src="docs/screenshots/16-notificacoes.jpg" width="170"> | <img src="docs/screenshots/17-servicos.jpg" width="170"> | <img src="docs/screenshots/18-rede.jpg" width="170"> | <img src="docs/screenshots/19-perfil.jpg" width="170"> |

| Privacidade (LGPD) | Estado vazio | Estado de erro | Oferta enviada pela concessionária |
|---|---|---|---|
| <img src="docs/screenshots/19b-perfil-lgpd.jpg" width="170"> | <img src="docs/screenshots/04c-agenda-vazia.jpg" width="170"> | <img src="docs/screenshots/20-estado-erro.jpg" width="170"> | <img src="docs/screenshots/29-cliente-recebe-oferta.jpg" width="170"> |

### Cockpit da concessionária
| Painel | Painel (carteira) | Clientes | Cliente em alto risco | Explicabilidade |
|---|---|---|---|---|
| <img src="docs/screenshots/22-cockpit-painel.jpg" width="170"> | <img src="docs/screenshots/22b-cockpit-painel-scroll.jpg" width="170"> | <img src="docs/screenshots/23-cockpit-clientes.jpg" width="170"> | <img src="docs/screenshots/24-cockpit-cliente-alto.jpg" width="170"> | <img src="docs/screenshots/24b-cockpit-explicabilidade.jpg" width="170"> |

| Cliente do app **antes** (40 %) | **Depois** de agendar (10 %) | Enviar oferta | Linha do tempo | Leads | Conta |
|---|---|---|---|---|---|
| <img src="docs/screenshots/25a-cockpit-gabriel-antes.jpg" width="150"> | <img src="docs/screenshots/25-cockpit-cliente-app.jpg" width="150"> | <img src="docs/screenshots/26-cockpit-enviar-oferta.jpg" width="150"> | <img src="docs/screenshots/26b-cockpit-timeline.jpg" width="150"> | <img src="docs/screenshots/27-cockpit-leads.jpg" width="150"> | <img src="docs/screenshots/28-cockpit-conta.jpg" width="150"> |

---

## Identidade visual (Design System)

Todo valor visual sai de **`constants/theme.ts`**. Nenhuma tela declara cor, fonte ou espaçamento "solto".

| Token | Valores |
|---|---|
| **Cores de marca** | `brand #0B2F6B` (azul Ford escuro) · `primary #2D7FF9` (ações) · `background #F5F7FB` · `surface #FFFFFF` |
| **Semânticas** | `success #138A55` · `warning #B7780A` · `danger #C93636` (as mesmas cores representam risco baixo/médio/alto no cockpit) |
| **Tipografia** | Inter (400/500/600/700): `display 28` · `title 22` · `heading 17` · `body 15` · `label 14` · `caption 13` · `metric 30` |
| **Espaçamento** | escala de 4 pt: `4 · 8 · 12 · 16 · 20 · 24 · 32 · 48` |
| **Raios** | `8 · 12 · 16 · 24 · pill` |
| **Toque mínimo** | 48 dp em todos os botões (acessibilidade) |

**Componentes reutilizáveis (`components/ui`)**: `Text`, `Button` (primary/secondary/ghost/danger/onBrand, com loading), `Card`, `Badge`, `Input` (label, ícone, erro, mostrar senha), `Chip`/`ChipGroup`, `Segmented`, `SwitchRow`, `ProgressBar`, `ListRow`, `KeyValue`, `Screen`, `ScreenHeader`, `SectionHeader`, `IconButton` (com badge), `Dialog`, `Toast`, gráficos SVG (`ScoreRing`, `RiskGauge`, `BarChart`, `TrendLine`, `ContributionBars`).

**Estados de interação padronizados:**

| Estado | Componente | Onde aparece |
|---|---|---|
| Carregando | `LoadingList` / `Skeleton` animado, `Button loading` | serviços, rede, horários, clientes, login |
| Erro | `ErrorState` com "Tentar novamente", erros inline no `Input` | qualquer chamada de API (ative *Perfil › Simular falha de rede*) |
| Vazio | `EmptyState` com ação sugerida | agenda, ofertas, leads, notificações, busca de clientes |
| Sucesso | `Toast`, tela de sucesso do agendamento, feedback háptico | agendamento, resgate, envio de oferta |

---

## Arquitetura

```
┌────────────────────────── App React Native (Expo SDK 54) ──────────────────────────┐
│  app/ (Expo Router: rotas protegidas por perfil)                                    │
│   ├─ (cliente)/ ─ tabs: Início · Veículo · Ofertas · Agenda · Perfil + telas stack │
│   └─ (cockpit)/ ─ tabs: Painel · Clientes · Leads · Conta + detalhe do cliente      │
│                                                                                     │
│  store/  AuthContext (sessão) · AppContext (dados + eventos) · TelemetryContext     │
│  ml/     churnModel.ts ─ regressão logística + explicabilidade (inferência local)   │
│  services/ api (REST mock) · session (SecureStore) · notifications · telemetry · cep│
│  components/ui ─ Design System                                                      │
└──────────┬──────────────────────────┬──────────────────────────┬────────────────────┘
           │ WebSocket (wss) MQTT     │ HTTPS                    │ Keystore/Keychain
   ┌───────▼────────┐        ┌────────▼────────┐        ┌────────▼────────┐
   │ Broker MQTT    │        │ ViaCEP (real)   │        │ expo-secure-store│
   │ HiveMQ / local │        │ API Ford Conecta│        │ sessão/token     │
   └───────▲────────┘        │ (contrato mock) │        └──────────────────┘
           │ MQTT/TLS 8883   └─────────────────┘
   ┌───────┴────────┐
   │ ESP32 / simul. │  fordconecta/<VIN>/telemetry
   └────────────────┘
```

### Estrutura de pastas

```txt
app/                  Rotas (Expo Router)
  (cliente)/(tabs)/   inicio, veiculo, beneficios, agenda, perfil
  (cliente)/          agendar (wizard), agendamento/[id], oferta/[id], notificacoes, servicos, rede
  (cockpit)/(tabs)/   painel, clientes, leads, conta
  (cockpit)/          cliente/[id]
components/ui/        Design System (componentes base)
components/           Componentes de domínio (OfferCard, AppointmentCard, AlertItem, RiskBadge…)
constants/            theme.ts (tokens) e navigation.ts
store/                Contextos globais e hooks (useAsync, usePortfolio, useClientOffers…)
ml/                   Modelo de risco de evasão
services/             API, sessão segura, notificações, telemetria (simulador/MQTT), ViaCEP
utils/                Regras de manutenção, motor de ofertas, formatação, haptics
data/                 Seed de dados (veículo, serviços, concessionárias, carteira de clientes)
iot/                  Simulador MQTT (Node), broker local e firmware ESP32
docs/screenshots/     Prints do README
.github/workflows/    CI (qualidade) e build automático do APK
```

---

## IoT: veículo conectado

- **Tópico:** `fordconecta/<VIN>/telemetry` (ex.: `fordconecta/8AFBR23L1RJ000024/telemetry`)
- **Payload (JSON):**

```json
{
  "vin": "8AFBR23L1RJ000024",
  "odometerKm": 38201.4,
  "oilLifePct": 17.9,
  "batteryV": 14.12,
  "fuelPct": 63.4,
  "engineTempC": 89.2,
  "tirePsi": [35.1, 34.5, 30.8, 35.2],
  "dtc": ["P0301"],
  "ignitionOn": true
}
```

- O app **valida e limita** cada campo recebido (faixas físicas plausíveis, DTC no padrão OBD-II `[PBCU]XXXX`), porque dado de dispositivo nunca é confiável.
- **Regras → alertas:** óleo ≤ 20 % (atenção) / ≤ 10 % (crítico), bateria < 12,3 V / < 12,0 V, pneu 5 PSI abaixo do ideal, motor > 105 °C, qualquer DTC.

**Testar com dados reais via MQTT:**

```bash
cd iot/simulator && npm install
node publisher.js                      # publica no broker público HiveMQ (TLS 8883)
# no app: Veículo › Fonte dos dados › MQTT (IoT) › Conectar (wss://broker.hivemq.com:8884/mqtt)
# teclas no simulador: [f] injeta falha P0301 · [c] limpa · [q] sai
```

Sem internet? Suba um broker local: `npm run broker` (TCP 1883 + WebSocket 8888), rode `BROKER=mqtt://localhost:1883 node publisher.js` e, no app, conecte em `ws://<IP-do-computador>:8888`.

> ⚠️ O broker local sem TLS (`ws://`) só funciona no **Expo Go** ou em build de desenvolvimento. No **APK** (build de release), o Android bloqueia conexões sem criptografia. Use o broker padrão com `wss://broker.hivemq.com:8884/mqtt`.

**Hardware:** `iot/esp32/ford_conecta_telemetry/ford_conecta_telemetry.ino` é o firmware ESP32 (PubSubClient + ArduinoJson, MQTT sobre TLS) que lê potenciômetros e botões simulando combustível, bateria, temperatura, pneu, ignição e falha. Pode ser executado no [Wokwi](https://wokwi.com).

---

## Modelo de Machine Learning (risco de evasão)

- **Tipo:** classificação binária (o cliente sai ou não da rede), com **regressão logística**.
- **10 variáveis:** idade do veículo, meses desde a última revisão, meses de garantia restantes, visitas à rede em 24 meses, distância da concessionária, último NPS, rodagem anual, engajamento com o app, agendamento ativo e taxa de resposta a ofertas.
- **Faixas:** baixo < 35 % ≤ médio < 60 % ≤ alto.
- **Inferência no aparelho** (`ml/churnModel.ts`): padronização z-score, pesos, sigmoide e **contribuição de cada variável** (explicabilidade exibida no cockpit, alinhada ao art. 20 da LGPD).
- **Retroalimentação:** agendar, ver, aceitar ou recusar ofertas gera eventos que alteram as variáveis do cliente e alimentam o próximo treino.
- Os pesos atuais são **valores de referência** para a demonstração do app, reunidos num único objeto `MODEL`. O modelo final da disciplina de IA (regressão logística multinomial que classifica o cliente em 4 perfis no momento da venda: Fiel, Econômico, Esquecido e Abandono) será integrado na Sprint 4, com o risco de evasão vindo da probabilidade do perfil "Abandono".

---

## Segurança e LGPD

- Sessão guardada com **`expo-secure-store`** (Android Keystore / iOS Keychain), com expiração de 8 h.
- **Rotas protegidas por perfil:** cliente não acessa o cockpit e vice-versa (guards nos layouts).
- **Consentimento granular:** sem consentimento de telemetria nada é coletado; sem consentimento de ofertas o modelo não personaliza nada.
- Direito de **acesso** ("Ver meus dados") e de **eliminação** ("Apagar dados deste aparelho").
- **Transparência:** toda oferta explica por que foi exibida, e todo risco no cockpit mostra os fatores.
- Canal IoT com **TLS** (`wss://` no app, `mqtts://`/8883 no simulador e no ESP32) e validação do payload.
- **CI** com typecheck, lint com zero avisos e `npm audit` a cada push.

---

## Decisões técnicas

| Decisão | Por quê |
|---|---|
| **Expo SDK 54 + Expo Router** | Mantivemos a base da Sprint 2. O roteamento por arquivos permite *route groups* separando cliente e cockpit com guards, e o CNG gera o projeto Android nativo para o APK sem manter a pasta `android/`. |
| **Um app, dois perfis** | É o diferencial "dois públicos numa só plataforma" do pitch: o que o cliente faz aparece para o consultor no mesmo instante. |
| **Context API + AsyncStorage** | O estado é pequeno e o ciclo é local. Três contextos com responsabilidades separadas evitam re-renderizar o app inteiro a cada leitura de telemetria (a cada 2 s). |
| **Camada `services/api` com contrato estável** | As telas não sabem se o dado vem do mock ou de um backend. Trocar pela API REST da disciplina de SOA é mudar só esse arquivo. |
| **Paho MQTT sobre WebSocket** | Biblioteca JS pura: funciona no Expo sem módulo nativo e é compatível com qualquer broker (HiveMQ, Mosquitto, AWS IoT). |
| **Simulador como fonte padrão** | Garante que o app funcione offline e em qualquer demonstração. O MQTT real é opcional. |
| **Modelo linear embarcado** | Inferência instantânea, offline e explicável. O treino pesado fica no notebook de ML. |
| **Design system próprio, sem UI kit** | Controle total da identidade, APK menor e consistência garantida por tokens. |
| **`Dialog` próprio em vez de `Alert.alert`** | Visual consistente com o restante do app. |
| **GitHub Actions para o APK** | Build reprodutível sem depender de conta Expo, com APK publicado automaticamente no Releases. |

### Correções em relação à Sprint 2
- 🐞 **O app não abria a partir do repositório:** o `.gitignore` ignorava a pasta `context/`, e o `AppContext` nunca foi versionado. O estado global agora fica em `store/` e está no Git.
- 🐞 O botão **"Resgatar benefício"** não fazia nada. Agora debita os pontos, gera código e registra o resgate.
- 🐞 A **data do agendamento era digitada à mão** ("18/06/2026 09:30"), sem validação. Agora o usuário escolhe dia e horário disponíveis.
- 🐞 O `Alert.alert` de confirmação não aparecia na web. Foi substituído pelo `Dialog` do design system.
- 🎨 Estilos duplicados em cada tela (cores e `fontWeight` "soltos") foram substituídos pelo design system.

---

## Como rodar

Pré-requisitos: Node.js ≥ 20.19.4 (versão fixada em `.nvmrc`).

```bash
npm install
npx expo start          # abre o QR Code: leia com o Expo Go (Android/iOS)
npm run typecheck       # TypeScript
npm run lint            # ESLint (zero avisos)
```

> No Expo Go, as notificações do sistema têm limitações no Android. No **APK** elas funcionam por completo.

## Como gerar o APK

**Opção 1 (recomendada): GitHub Actions, sem conta Expo**
1. Crie uma tag: `git tag v1.0.0 && git push origin v1.0.0`
2. O workflow **Android APK** compila e anexa `ford-conecta-v1.0.0.apk` ao **GitHub Release**. Esse é o link usado no topo deste README.
3. Também dá para rodar manualmente em *Actions › Android APK › Run workflow* (o APK sai nos artefatos).

**Opção 2: Expo EAS Build**
```bash
npx eas-cli@latest login
npx eas-cli@latest build -p android --profile preview    # gera .apk (perfil "preview" do eas.json)
```

**Opção 3: local (com Android Studio/SDK instalado)**
```bash
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease
# APK em android/app/build/outputs/apk/release/app-release.apk
```

---

## Próximos passos
- Substituir o mock pela **API REST do Ford Conecta** (SOA) com JWT real e refresh token.
- **Push remoto** (FCM) disparado pelo cockpit web, em vez de notificação local.
- Integrar o modelo multinomial de perfis da disciplina de IA (servido pela API) no lugar dos pesos de referência.
- Treino periódico do modelo com os eventos de retroalimentação (MLOps) e monitoramento de *drift*.
- Leitura OBD-II real via **ELM327 Bluetooth** no ESP32.
- Geolocalização para ordenar concessionárias pela distância real.
- Testes automatizados de UI (Maestro/Detox) no pipeline.
