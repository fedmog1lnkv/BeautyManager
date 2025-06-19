import DiscountType from '@/data/models/DiscountType';

export default class Coupon {
    id: string;
    organizationId: string;
    name: string;
    description: string;
    code: string;
    discountType: DiscountType;
    discountValue: number;
    isPublic: boolean;
    usageLimit: number;
    usageLimitRemaining: number;
    startDate: string;
    endDate: string;
    serviceIds: string[];

    constructor(
        id?: string,
        organizationId?: string,
        name?: string,
        description?: string,
        code?: string,
        discountType?: DiscountType,
        discountValue?: number,
        isPublic?: boolean,
        usageLimit?: number,
        usageLimitRemaining?: number,
        startDate?: string,
        endDate?: string,
        serviceIds?: string[]
    ) {
        this.id = id || '';
        this.organizationId = organizationId || '';
        this.name = name || '';
        this.description = description || '';
        this.code = code || '';
        this.discountType = discountType || DiscountType.Fixed;
        this.discountValue = discountValue ?? 0;
        this.isPublic = isPublic ?? false;
        this.usageLimit = usageLimit ?? 1;
        this.usageLimitRemaining = usageLimitRemaining ?? 0;
        this.startDate = startDate || '';
        this.endDate = endDate || '';
        this.serviceIds = serviceIds || [];
    }

    static fromJson(json: any): Coupon {
        return new Coupon(
            json.id,
            json.organizationId,
            json.name,
            json.description,
            json.code,
            json.discountType as DiscountType,
            json.discountValue,
            json.isPublic,
            json.usageLimit,
            json.usageLimitRemaining,
            json.startDate,
            json.endDate,
            json.serviceIds || []
        );
    }
}
