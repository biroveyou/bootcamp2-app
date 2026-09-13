# Buscador de Personagens SWAPI

## Autor
Daniel Macêdo Passos — Matrícula 22611324

## Descrição
Aplicação que permite buscar personagens do universo Star Wars pelo nome e visualizar seus dados principais. Útil para quem quer ver na prática um fluxo simples de consumo de API pública com JavaScript puro.

## API utilizada
- SWAPI - The Star Wars API: https://swapi.dev/documentation
- Endpoints consumidos:
  - `GET /api/people/` — lista paginada de personagens (usada para montar o índice de nomes)
  - `GET /api/people/{id}/` — detalhes de um personagem específico

## Funcionalidades
- Buscar um personagem pelo nome (ou início do nome) digitado na barra de busca
- Visualizar altura, massa, ano de nascimento, gênero, cor de cabelo, cor dos olhos e quantidade de filmes do personagem encontrado
- Feedback de status durante o carregamento da lista e da busca
- Mensagem de erro caso o personagem não seja encontrado ou a API falhe

## Como executar localmente
1. Clone: `git clone https://github.com/biroveyou/bootcamp2-app`
2. Abra o arquivo `index.html` no navegador

## Links
- **Aplicação no ar (GitHub Pages):** https://biroveyou.github.io/bootcamp2-app/
- **Repositório:** https://github.com/biroveyou/bootcamp2-app
