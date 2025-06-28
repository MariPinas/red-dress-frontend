# Loja React - Notificação de Estoque

Este é o frontend da aplicação de loja, desenvolvido com React + Vite. A aplicação exibe um produto (vestido vermelho), permite a compra do item (caso tenha estoque) e permite que o usuário se inscreva para ser notificado por e-mail quando o item voltar ao estoque. O frontend também se comunica com o backend via WebSocket e REST para receber notificações em tempo real quando o produto retorna ao estoque.

## Funcionalidades

- Exibição da quantidade atual em estoque
- Compra de produtos
- Inscrição para receber notificações por e-mail
- Notificação em tempo real via WebSocket quando o item volta ao estoque

## Tecnologias

- React
- TypeScript
- Vite
- CSS inline
- WebSocket

## Como rodar

1. Instale as dependências:
   ```bash
   npm install
   
2.Inicie o servidor de desenvolvimento:
```bash
  npm run dev
```
3.Acesse:
```bash
  http://localhost:5173
```
Obs: O backend deve estar rodando com HTTPS e WebSocket no https://localhost:3040.







