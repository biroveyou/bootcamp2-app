# SWAPI Search

## Autor
Daniel Macêdo Passos — Matrícula 22611324

## Descrição
Uma aplicação básica que permite buscar personagens do universo Star Wars pelo nome e visualizar seus alguns de seus dados. É um bastante útil para testar na prática um fluxo simples de consumo de API pública com JavaScript puro.

## API utilizada
- SWAPI - The Star Wars API: https://swapi.dev/documentation
- Endpoints consumidos:
  - `GET /api/people/` — lista paginada de personagens (usada na construção do índice de nomes)
  - `GET /api/people/{id}/` — detalhes do personagem específico achado

## Funcionalidades
- Buscar um personagem pelo nome (ou início do nome) digitado na barra de busca
- Visualizar 
  - altura (`person.height`)
  - massa (`person.mass`)
  - ano de nascimento (`person.birth_year`)
  - gênero (`person.gender`)
  - cor de cabelo (`person.hair_color`)
  - cor dos olhos (`person.eye_color`)
  - quantidade de filmes do personagem encontrado (`person.films.length`)
- Feedback de status durante o carregamento da lista e da busca
- Mensagem de erro caso o personagem não seja encontrado ou a API falhe

## Como executar localmente
1. Clone: `git clone https://github.com/biroveyou/bootcamp2-app` (Uso do HTTPS)
2. Abra o arquivo `index.html` no navegador

## Links
- **Aplicação no ar (GitHub Pages):** https://biroveyou.github.io/bootcamp2-app/
- **Repositório:** https://github.com/biroveyou/bootcamp2-app
