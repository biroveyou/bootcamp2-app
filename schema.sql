-- ============================================================
-- Bootcamp II · Etapa 02 — tabelas do projeto SWAPI
-- Cole tudo no SQL Editor do Supabase e clique em Run.
-- ============================================================

-- Favoritos (persistência principal)
create table favoritos (
  id             bigint generated always as identity primary key,
  criado_em      timestamptz not null default now(),
  personagem_id  int  not null unique,   -- id do personagem na SWAPI (impede favoritar 2x)
  nome           text not null,
  ano_nascimento text,
  genero         text                    -- usado no painel de estatísticas
);

alter table favoritos enable row level security;

create policy "leitura publica"  on favoritos for select to anon using (true);
create policy "insercao publica" on favoritos for insert to anon with check (true);
create policy "remocao publica"  on favoritos for delete to anon using (true);

create table historico (
  id         bigint generated always as identity primary key,
  criado_em  timestamptz not null default now(),
  termo      text    not null,
  encontrado boolean not null
);

alter table historico enable row level security;

create policy "leitura publica"  on historico for select to anon using (true);
create policy "insercao publica" on historico for insert to anon with check (true);
