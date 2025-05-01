export default class OrganizationStats {
    completedRecordsCount: number;
    uniqueCustomersCount: number;
    averageRating: number;
    totalEarned: number;

    constructor(completedRecordsCount?: number, uniqueCustomersCount?: number, averageRating?: number, totalEarned?: number) {
        this.completedRecordsCount = completedRecordsCount;
        this.uniqueCustomersCount = uniqueCustomersCount;
        this.averageRating = averageRating;
        this.totalEarned = totalEarned;
    }

    static fromJson(json: any): OrganizationStats {
        return new OrganizationStats(json.completedRecordsCount, json.uniqueCustomersCount, json.averageRating, json.totalEarned);
    }
}
