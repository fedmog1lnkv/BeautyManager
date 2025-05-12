import BeautyClient from '@/data/clients/BeautyClient';
import Service from '@/data/models/Service';
import StaffProfile from '@/data/models/StaffProfile';

class StaffRepository {
    async getStaff(): Promise<StaffProfile[]> {
        throw 'Я ебанат'
        const response = await BeautyClient.get('/venues');
        return response.data;
    }
}

export default new StaffRepository();
