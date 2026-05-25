# ?? TV Control System - Sistema de Controle em Tempo Real

Sistema interativo de controle de TV que simula uma arquitetura event-driven com comunicação em tempo real entre dispositivos.

## ?? Sobre o Projeto

Este projeto demonstra uma aplicação React moderna que simula:
- **TV Screen**: Interface de visualização com player de música e animações
- **Controle Remoto**: Interface completa de controle
- **Event Bus**: Sistema de comunicação entre componentes
- **Log em Tempo Real**: Monitoramento de todos os eventos

## ? Funcionalidades

### ?? TV Screen
- Visualização de faixas musicais com cores dinâmicas
- Animações de ondas sonoras que respondem ao estado de reprodução
- Indicador de status "AO VIVO" / "OFFLINE"
- Barra de progresso e informações da faixa
- Indicador de volume lateral
- Log de eventos em tempo real (últimas 3 ações)

### ?? Controle Remoto
- ?? Play/Pause
- ?? Faixa Anterior / ?? Próxima Faixa
- ?? Controle de Volume (+10, -10, Slider)
- ?? Mute/Unmute
- ?? Playlist completa com todas as faixas
- Indicador de conexão

### ?? Sistema de Log
- Monitoramento de todos os eventos
- Timestamps precisos
- Scroll automático
- Interface estilo terminal

### ?? Interface
- Design cyberpunk/futurista
- Cores dinâmicas baseadas na faixa atual
- 4 visualizações: Split, TV, Controle, Log
- Responsivo e animado

## ?? Como Executar

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm, yarn ou pnpm

### Instalação

1. **Instale as dependências:**
```bash
npm install
```

2. **Inicie o servidor de desenvolvimento:**
```bash
npm run dev
```

3. **Acesse no navegador:**
```
http://localhost:3000
```

## ?? Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão na pasta `dist/`

Para visualizar o build:
```bash
npm run preview
```

## ?? Playlist Inclusa

1. **Synthwave Drive** - Electronic (4:05)
2. **Ocean Depths** - Ambient (5:12)
3. **Neon Jungle** - Lo-fi (3:18)
4. **Midnight Protocol** - Cyberpunk (4:27)
5. **Solar Drift** - Chillout (4:49)

## ??? Arquitetura

### Event Bus Pattern
O sistema utiliza um Event Bus customizado para comunicação:
- Desacoplamento entre componentes
- Comunicação unidirecional de dados
- Simula comunicação entre dispositivos (TV ? Controle)

### Estrutura de Componentes
```
App (Estado Global)
??? TVScreen (Visualização)
??? Remote (Controle)
??? LogPanel (Monitoramento)
```

### Estado da Aplicação
```javascript
{
  on: boolean,      // Estado de reprodução
  idx: number,      // Índice da faixa atual
  prog: number,     // Progresso em segundos
  vol: number,      // Volume (0-100)
  muted: boolean    // Estado de mute
}
```

## ??? Tecnologias

- **React 18** - Biblioteca UI
- **Vite** - Build tool e dev server
- **JavaScript** - Linguagem
- **CSS-in-JS** - Estilização inline

## ?? Comandos de Controle

| Ação | Comando |
|------|---------|
| Play/Pause | TOGGLE |
| Próxima | NEXT |
| Anterior | PREV |
| Stop | STOP |
| Volume + | VU |
| Volume - | VD |
| Mute | MUTE |
| Setar Volume | VS:valor |
| Trocar Faixa | TR:índice |

## ?? Modos de Visualização

- **Split**: TV + Controle lado a lado
- **TV**: Tela cheia da TV
- **Controle**: Tela cheia do controle (mobile-friendly)
- **Log**: Visualização completa dos eventos

## ?? Possíveis Expansões

- [ ] Integração com API de streaming real
- [ ] WebSocket para múltiplos dispositivos
- [ ] Autenticação de usuários
- [ ] Histórico de reprodução
- [ ] Equalizer visual
- [ ] Temas customizáveis
- [ ] Suporte a playlists personalizadas

## ?? Licença

MIT - Sinta-se livre para usar e modificar!

---

**Desenvolvido com ?? usando React e Event-Driven Architecture**
