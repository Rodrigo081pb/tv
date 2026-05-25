# ?? Controle Remoto Virtual para TV

Controle sua TV via Wi-Fi usando o navegador do seu celular ou computador. **Sem anúncios!** ??

## ?? Sobre o Projeto

Aplicação web que transforma seu dispositivo em um controle remoto universal para Smart TVs. Conecte-se à sua TV pela mesma rede Wi-Fi e controle tudo pelo navegador.

### ?? Por que usar?
- ? **Sem anúncios** - Diferente dos apps da Play Store
- ? **Gratuito e open-source**
- ? **Funciona no navegador** - Não precisa instalar app
- ? **Compatível com múltiplas marcas** - Samsung, LG, Sony, etc.
- ? **Interface moderna e responsiva**

## ? Funcionalidades

### ?? Controle Completo
- ? **Power** - Liga/Desliga a TV
- ?? **Navegação Direcional** - D-Pad (? ? ? ? OK)
- ?? **Volume** - Aumentar, Diminuir, Mute
- ?? **Canais** - Trocar canais (CH+ / CH-)
- ?? **Teclado Numérico** - Números 0-9
- ?? **Botões Especiais** - Home, Menu, Voltar, Source

### ?? Descoberta Automática
- Busca automática de TVs na rede
- Adicionar TV manualmente por IP
- Suporte para múltiplas marcas

### ?? TVs Suportadas
- **Samsung** (Tizen OS) - via Samsung TV Control API
- **LG** (webOS) - via webOS API
- **Sony, Philips, TCL, Hisense** - modo genérico
- **Android TV** - suporte básico

## ?? Como Usar

### 1?? Instalação

```bash
# Clone o repositório
git clone https://github.com/Rodrigo081pb/tv.git
cd tv

# Instale as dependências
npm install

# Inicie o servidor
npm start
```

### 2?? Acesso

**No Computador:**
```
http://localhost:3000
```

**No Celular (mesma rede Wi-Fi):**
```
http://[IP-DO-SEU-PC]:3000
```

?? **Como descobrir o IP do seu PC:**
- Windows: `ipconfig` no CMD
- Linux/Mac: `ifconfig` no Terminal
- Exemplo: `http://192.168.1.100:3000`

### 3?? Conectar na TV

1. **Certifique-se que a TV e o dispositivo estão na mesma rede Wi-Fi**
2. Abra a aplicação no navegador
3. Clique em **"Buscar TVs na Rede"**
4. Selecione sua TV na lista
5. Clique em **"Conectar"**

**Ou adicione manualmente:**
1. Digite o IP da sua TV
2. Selecione a marca
3. Clique em "Adicionar"

?? **Como descobrir o IP da TV:**
- Samsung: Configurações ? Rede ? Status da Rede
- LG: Configurações ? Rede ? Conexão Wi-Fi
- Sony: Configurações ? Rede ? Configurações de Rede

## ??? Arquitetura Técnica

```
???????????????????
?   Frontend      ?  ? Interface Web (HTML/CSS/JS)
?   (Navegador)   ?
???????????????????
         ? WebSocket
???????????????????
?   Backend       ?  ? Servidor Node.js + Express
?   (Node.js)     ?
???????????????????
         ? API/Protocolo
???????????????????
?   Smart TV      ?  ? Samsung/LG/Sony TV
???????????????????
```

### Tecnologias Utilizadas

**Backend:**
- Node.js + Express
- WebSocket (ws)
- SSDP (descoberta de dispositivos)
- samsung-tv-control (API Samsung)
- lgtv2 (API LG webOS)

**Frontend:**
- HTML5 / CSS3 / JavaScript Vanilla
- WebSocket Client
- Design Responsivo

## ?? Requisitos

- **Node.js** 16+ instalado
- **TV Smart** conectada na mesma rede Wi-Fi
- **Navegador moderno** (Chrome, Firefox, Safari, Edge)

## ?? Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| Power | Liga/Desliga a TV |
| Volume +/- | Ajusta o volume |
| Mute | Silencia/Ativa som |
| Canal +/- | Troca de canal |
| 0-9 | Números do controle |
| ???? | Navegação direcional |
| OK/Enter | Confirmar seleção |
| Home | Tela inicial |
| Menu | Menu da TV |
| Voltar | Voltar/Retornar |
| Source | Trocar fonte de entrada |

## ?? Configuração Avançada

### Porta do Servidor

Altere a porta editando `server.js`:

```javascript
const PORT = process.env.PORT || 3000;
```

Ou use variável de ambiente:
```bash
PORT=8080 npm start
```

### Adicionar Suporte a Outras TVs

Edite `server.js` e adicione o protocolo específico da marca no objeto `TV_BRANDS` e nas funções de comando.

## ?? Solução de Problemas

### TV não aparece na busca
- ? Verifique se a TV está ligada e conectada no Wi-Fi
- ? Confirme que está na mesma rede
- ? Tente adicionar manualmente pelo IP
- ? Algumas TVs precisam ativar "Controle Remoto via Rede" nas configurações

### Não consegue conectar
- ? Firewall pode estar bloqueando - libere as portas 3000, 8001, 8002
- ? Samsung: Aceite a permissão que aparece na tela da TV
- ? LG: Aceite a autorização no primeiro pareamento

### Comandos não funcionam
- ? Verifique se a TV está no modo correto
- ? Algumas funções podem não estar disponíveis em modo genérico
- ? Reinicie a conexão

## ?? Mobile-First

A interface foi desenvolvida pensando no uso mobile, com:
- Botões grandes e fáceis de pressionar
- Design responsivo
- Feedback tátil e visual
- Sem necessidade de zoom

## ?? Segurança

- Conexão local (não expõe dados para internet)
- Sem coleta de informações
- Código aberto e auditável
- Sem rastreamento ou anúncios

## ?? Deploy em Produção

Para uso permanente, você pode:

1. **Raspberry Pi** - Deixe rodando 24/7
2. **Servidor Local** - Use PM2 para manter rodando
3. **Docker** - Container isolado

```bash
# Com PM2
npm install -g pm2
pm2 start server.js --name "tv-remote"
pm2 save
pm2 startup
```

## ?? Contribuindo

Contribuições são bem-vindas! Sinta-se livre para:
- Reportar bugs
- Sugerir novos recursos
- Enviar pull requests
- Melhorar a documentação

## ?? Licença

MIT - Uso livre para projetos pessoais e comerciais

## ?? Créditos

Bibliotecas utilizadas:
- [samsung-tv-control](https://github.com/Toxblh/samsung-tv-control)
- [lgtv2](https://github.com/hobbyquaker/lgtv2)
- [node-ssdp](https://github.com/diversario/node-ssdp)

---

**Desenvolvido com ?? para quem está cansado de anúncios em apps de controle remoto!**

?? **Dica:** Adicione um atalho na tela inicial do celular para acesso rápido!
