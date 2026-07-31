import { CrudConfigService } from '@dataui/crud';

CrudConfigService.load({
  query: {
    alwaysPaginate: true,
    maxLimit: 100,
  },
});
