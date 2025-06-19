import BeautyClient from '@/data/clients/BeautyClient';
import Coupon from '@/data/models/Coupon';
import Paging from "@/data/models/Paging";

class CouponRepository {
    async getCoupons(page: number, pageSize: number, query: string): Promise<Paging<Coupon>> {
        const response = await BeautyClient.get('/organization/coupons', {
            params: {
                page: page,
                pageSize: pageSize,
                search: query.trim().length === 0 ? null : query.trim()
            }
        });
        return Paging.fromJson<Coupon>(response.data, Coupon.fromJson);
    }

    async getCoupon(id: string): Promise<Coupon> {
        const response = await BeautyClient.get(`/coupon/${id}`);
        return Coupon.fromJson(response.data);
    }

    async createCoupon(coupon: Coupon): Promise<void> {
        await BeautyClient.post('/coupon', {
            name: coupon.name,
            description: coupon.description || null,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            isPublic: coupon.isPublic,
            usageLimit: coupon.usageLimit,
            startDate: coupon.startDate,
            endDate: coupon.endDate,
            serviceIds: coupon.serviceIds || []
        });
    }
    //
    // async updateCoupon(coupon: Coupon): Promise<void> {
    //     await BeautyClient.patch('/coupon', {
    //         id: coupon.id,
    //         name: coupon.name,
    //         description: coupon.description || null,
    //         code: coupon.code,
    //         discountType: coupon.discountType,
    //         discountValue: coupon.discountValue,
    //         isPublic: coupon.isPublic,
    //         usageLimit: coupon.usageLimit,
    //         startDate: coupon.startDate,
    //         endDate: coupon.endDate,
    //     });
    // }
    //
    // async deleteCoupon(id: string): Promise<void> {
    //     await BeautyClient.delete(`/coupon/${id}`);
    // }
}

export default new CouponRepository();
