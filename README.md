# SWAPI Search

## Autor
Daniel Macêdo Passos — Matrícula 22611324

## Descrição
Digita o nome de um personagem de Star Wars e a aplicação busca e mostra os dados dele. Foi feito principalmente pra treinar fetch com API pública em JavaScript puro, mas serve pra qualquer um que quiser ver esse fluxo funcionando na prática. Escolhi não fazer sobre o pokemon para testar se os mesmos conhecimentos podiam ser aplicados a outras APIs.

Na Etapa 02 a aplicação ganhou banco de dados (Supabase): dá pra salvar personagens como favoritos, e as buscas feitas ficam registradas. Também é distribuída como imagem Docker no Docker Hub.

## APIs e serviços utilizados
- SWAPI - The Star Wars API: https://swapi.dev/documentation
  - `GET /api/people/` — lista paginada de personagens (usada na construção do índice de nomes)
  - `GET /api/people/{id}/` — detalhes do personagem específico achado
- Supabase — banco PostgreSQL com API REST (persistência dos dados): https://supabase.com/docs
  - Tabela `favoritos`: `id`, `criado_em`, `personagem_id` (unique), `nome`, `ano_nascimento`, `genero`
  - Tabela `historico`: `id`, `criado_em`, `termo`, `encontrado`
  - Políticas RLS para `anon`: `select`, `insert` e `delete` em `favoritos`; `select` e `insert` em `historico`

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
- Salvar o personagem nos favoritos, listar os favoritos e remover (os dados continuam lá depois de fechar a página)
- Feedback de status durante o carregamento da lista e da busca
- Tratamento de erros: personagem não encontrado, API fora do ar, favorito duplicado e falha do banco

## Sidequests concluídas
- [x] A — histórico de buscas: toda busca é gravada (inclusive as sem resultado) e as últimas 5 aparecem na tela; clicar em uma refaz a busca
- [x] C — painel de estatísticas dos favoritos: total, favorito mais recente e gênero mais comum, calculados a partir do banco

## Como executar

### No navegador (sem instalar nada)
Acesse: https://biroveyou.github.io/bootcamp2-app/

### Com Docker (um comando)
```
docker run -d -p 8080:80 biroveyou/bootcamp2-app:1.0
```
Depois abra http://localhost:8080

### Localmente a partir do código
1. Clone: `git clone https://github.com/biroveyou/bootcamp2-app` (Uso do HTTPS)
2. Abra o arquivo `index.html` no navegador

## Links
- **Aplicação no ar (GitHub Pages):** https://biroveyou.github.io/bootcamp2-app/
- **Repositório:** https://github.com/biroveyou/bootcamp2-app
- **Imagem no Docker Hub:** https://hub.docker.com/r/biroveyou/bootcamp2-app
