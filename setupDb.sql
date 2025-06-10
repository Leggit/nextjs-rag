/* Run this in the supabase SQL editor to setup the vector extension, 
create a table to store vector embeddings and related data, 
and a function to query that table */

create extension vector
with schema extensions;

create table chunks (
  id uuid not null default gen_random_uuid (),
  content text null,
  vector extensions.vector null,
  url text null,
  date_updated timestamp default now(),
  constraint data_chunks primary key (id)
);

create or replace function get_relevant_chunks(
  query_vector vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  content text,
  url text,
  date_updated timestamp,
  similarity float
)
language sql stable
as $$
  select
    id,
    content,
    url,
    date_updated,
    1 - (chunks.vector <=> query_vector) as similarity
  from chunks
  where 1 - (chunks.vector <=> query_vector) > match_threshold
  order by similarity desc
  limit match_count;
$$;