import StaffProfile from '@/data/models/StaffProfile';
import BeautyClient from '@/data/clients/BeautyClient';

class AuthRepository {
    async sendCode(phone: string, code: string): Promise<StaffProfile> {
        const response = await BeautyClient.post('/staff/auth', {
            phoneNumber: phone,
            code: code
        });

        localStorage.setItem('auth', JSON.stringify(response.data));

        return await this.fetchProfile();
    }

    async sendPhone(phone: string): Promise<void> {
        let response = await BeautyClient.post('/staff/phone_challenge', {
            phoneNumber: phone
        });
        localStorage.setItem('auth', JSON.stringify(response.data));
    }

    async fetchProfile(): Promise<StaffProfile> {
        const response = await BeautyClient.get<StaffProfile>('/staff');
        localStorage.setItem('profile', JSON.stringify(response.data));
        return response.data;
    }

    async getAuth() {
        const auth = localStorage.getItem('auth');
        return auth ? JSON.parse(auth) : null;
    }

    async getProfile() {
        const profile = localStorage.getItem('profile');
        return profile ? JSON.parse(profile) : null;
    }

    clearAuth() {
        localStorage.removeItem('auth');
        localStorage.removeItem('profile');
    }
}

export default new AuthRepository();
