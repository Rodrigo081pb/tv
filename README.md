# SmartRemote

Aplicativo mobile em React Native com Expo para controlar Smart TVs na mesma rede Wi-Fi local. O app busca dispositivos automaticamente, conecta pelo protocolo correspondente e exibe uma interface escura inspirada em um controle remoto físico.

## Funcionalidades

- Permissao de rede/localizacao para descobrir o IP do celular.
- Varredura automatica da sub-rede local de `.1` a `.254`.
- Probes para Samsung, LG webOS, Roku, Philips e Sony BRAVIA.
- Controladores separados por fabricante com factory unificada.
- Reconexao/heartbeat em segundo plano.
- Controle visual sem toast, snackbar ou alerta apos comandos.
- Feedback apenas por escala do botao e haptico leve.

## Como Rodar

```bash
npm install
npm start
```

Depois, abra no Expo Go ou em um emulador com:

```bash
npm run android
npm run ios
```

O celular e a TV precisam estar na mesma rede Wi-Fi. O app nao depende de internet para controlar a TV, apenas da rede local.

### Comandos Uteis

```bash
npm run start:clear
npm run lan
npm run lan:clear
npm run tunnel
npm run web
```

- Use `npm run start:clear` quando o Metro avisar que houve mudanca no `babel.config.js` ou pedir cache limpo.
- Use `npm run lan` ou `npm run lan:clear` para abrir pelo Expo Go usando a rede Wi-Fi local, sem ngrok.
- Use `npm run tunnel` se o QR Code aparecer como `127.0.0.1` ou se o celular nao conseguir abrir o app pela rede local.
- Em redes corporativas, o tunnel pode falhar com timeout do ngrok. Nesse caso, prefira `npm run lan:clear` e garanta que celular e computador estejam no mesmo Wi-Fi.
- Use `npm run web` para testar no navegador. O projeto inclui `react-native-web`, `react-dom` e `@expo/metro-runtime` no `package.json`; rode `npm install` depois de atualizar dependencias.

### Android SDK / adb

O comando `npm run android` tenta abrir um emulador ou dispositivo Android via `adb`. Se aparecer erro de Android SDK, ha duas opcoes:

1. Abrir pelo Expo Go no celular escaneando o QR Code do `npm start` ou `npm run tunnel`.
2. Instalar o Android Studio, instalar o Android SDK e configurar `ANDROID_HOME` apontando para a pasta do SDK, alem de adicionar `platform-tools` ao `PATH`.

## Estrutura

```text
src/
  components/
  context/
  hooks/
  navigation/
  screens/
  services/
```

## Observacoes de Plataforma

- No iOS, a permissao de rede local e acionada pelo proprio sistema quando o app tenta acessar dispositivos da LAN.
- Em TVs Samsung e LG, o primeiro pareamento pode exigir confirmacao na tela da TV.
- Alguns fabricantes/modelos mudam portas, endpoints ou comandos; nesses casos, as falhas de comando sao registradas apenas no console, sem feedback visual para o usuario.