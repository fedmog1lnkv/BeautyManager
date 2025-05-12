export default class Paging<T> {
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    data: T[];

    constructor(totalCount: number, pageNumber: number, pageSize: number, totalPages: number, data: T[]) {
        this.totalCount = totalCount;
        this.pageNumber = pageNumber;
        this.pageSize = pageSize;
        this.totalPages = totalPages;
        this.data = data;
    }

    static fromJson<T>(json: any, fromJson: (json: any) => T): Paging<T> {
        return new Paging<T>(
            json.totalCount,
            json.pageNumber,
            json.pageSize,
            json.totalPages,
            json.data.map((e) => fromJson(e))
        );
    }
}
