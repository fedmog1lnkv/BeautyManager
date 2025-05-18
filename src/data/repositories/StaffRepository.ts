import BeautyClient from '@/data/clients/BeautyClient';
import StaffProfile from '@/data/models/StaffProfile';
import Paging from '@/data/models/Paging';

class StaffRepository {
    async getStaffById(id: string): Promise<StaffProfile> {
        const response = await BeautyClient.get(`/staff/${id}`);
        return StaffProfile.fromJson(response.data);
    }

    async getStaff(page: number, pageSize: number, query: string): Promise<Paging<StaffProfile>> {
        const response = await BeautyClient.get('/organization/staffs', {
            params: {
                page: page,
                pageSize: pageSize,
                search: query.trim().length == 0 ? null : query.trim()
            }
        });
        return Paging.fromJson<StaffProfile>(response.data, StaffProfile.fromJson);
    }

    async saveStaff(staff: StaffProfile): Promise<void> {
        await BeautyClient.patch('/staff', {
            staffId: staff.id,
            name: staff.name,
            role: staff.role
        });
    }

    async saveStaffPhoto(staffId: string, photo: string | ArrayBuffer): Promise<void> {
        await BeautyClient.patch('/staff', {
            staffId: staffId,
            photo: photo
        });
    }

    async sendPhoneChallenge(phoneNumber: string, organizationId: string): Promise<void> {
        await BeautyClient.post('/staff/phone_challenge', {
            phoneNumber,
            organizationId
        });
    }

    async verifyPhoneCode(phoneNumber: string, code: string): Promise<void> {
        await BeautyClient.post('/staff/auth', {
            phoneNumber,
            code
        });
    }

    async deleteStaff(staffId: string): Promise<void> {
        await BeautyClient.delete(`/staff`, {
            params: {
                id: staffId
            }
        });
    }
}

export default new StaffRepository();
