import { CrudConfigService } from '@dataui/crud';

CrudConfigService.load({
  query: {
    alwaysPaginate: true,
    limit: 10,
    maxLimit: 100,
  },
});
