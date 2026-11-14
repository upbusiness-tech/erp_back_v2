export type StatisticDateRage = {
  from: string;
  to: string;
  fromDate: Date;
  toExclusiveDate: Date;
};

export type StatisticRepositoryParams = {
  fromDate: string;
  toDate: string;
  companyUid: string;
  limit?: number;
};
