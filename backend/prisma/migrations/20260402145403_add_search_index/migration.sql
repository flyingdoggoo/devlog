CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Wrapper IMMUTABLE để dùng trong index expression
CREATE OR REPLACE FUNCTION public.immutable_unaccent(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
RETURNS NULL ON NULL INPUT
AS $$
  SELECT public.unaccent('public.unaccent'::regdictionary, input);
$$;

CREATE INDEX IF NOT EXISTS idx_post_search_fts
ON "Post" USING GIN (
  to_tsvector(
    'simple',
    public.immutable_unaccent(
      coalesce("title", '') || ' ' || coalesce("excerpt", '') || ' ' || coalesce("content", '')
    )
  )
)
WHERE "status" = 'PUBLISHED';

CREATE INDEX IF NOT EXISTS idx_user_search_fts
ON "User" USING GIN (
  to_tsvector(
    'simple',
    public.immutable_unaccent(coalesce("username", '') || ' ' || coalesce("name", ''))
  )
)
WHERE "active" = true;

CREATE INDEX IF NOT EXISTS idx_tag_search_fts
ON "Tag" USING GIN (
  to_tsvector('simple', public.immutable_unaccent("name"))
);

CREATE INDEX IF NOT EXISTS idx_tag_name_trgm
ON "Tag" USING GIN (public.immutable_unaccent("name") gin_trgm_ops);
