export interface IPaginationResults<E> {
  data: E[];
  paginate: {
    records: number;
    page: number;
    limit: number;
    pages: number;
    previous?: number;
    next?: number;
  };
}
