import { IPaginationResults } from './interfaces/results.interface';

interface IPagination {
  records: number;
  page: number;
  limit: number;
  pages: number;
  previous?: number;
  next?: number;
}
export class Pagination<E> {
  public data: E[];
  public paginate: IPagination;

  constructor(paginationResults: IPaginationResults<E>) {
    this.data = paginationResults.data;
    this.paginate = {
      records: paginationResults.paginate.records,
      page: paginationResults.paginate.page,
      limit: paginationResults.paginate.limit,
      pages: paginationResults.paginate.pages,
      previous: paginationResults.paginate.previous,
      next: paginationResults.paginate.next,
    };
  }
}
// có 17 records | limit là 5
/* 
    lấy: page 1: i: 0->4
         page 2: 5->9
         page 3: 10->14
         page 4: 15->17
*/
