export type StatisticDateRange = {
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
