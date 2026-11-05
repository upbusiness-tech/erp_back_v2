import { CrudConfigService } from '@dataui/crud';

CrudConfigService.load({
  query: {
    alwaysPaginate: true,
    maxLimit: 100,
  },
  operators: {
    custom: {
      /**
       * Contains, case-insensitive and accent-insensitive.
       *
       * SQL gerado:
       *   unaccent(LOWER(campo)) ILIKE '%' || unaccent(LOWER(:valor)) || '%'
       *
       * Aceita tanto o termo puro (`pelicula`) quanto já com wildcards
       * (`%peli%`). O `unaccent` no parâmetro garante que a busca funcione
       * mesmo quando o usuário digita a palavra com acento.
       *
       * Requer a extension `unaccent` habilitada no PostgreSQL.
       */
      $contUL: {
        query: (field, param) =>
          `unaccent(LOWER(${field})) ILIKE '%' || unaccent(LOWER(:${param})) || '%'`,
      },
    },
  },
});
