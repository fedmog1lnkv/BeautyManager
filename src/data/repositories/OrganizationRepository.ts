import Organization from '@/data/models/Organization';
import BeautyClient from '@/data/clients/BeautyClient';
import { BehaviorSubject } from 'rxjs';
import OrganizationStats from '@/data/models/OrganizationStats';

class OrganizationRepository {
    organization: BehaviorSubject<Organization> = new BehaviorSubject(null);

    async getOrganization(): Promise<Organization> {
        const org = await BeautyClient.get<Organization>('/staff/organization');
        return org.data;
    }

    async getStats(): Promise<OrganizationStats> {
        const org = await BeautyClient.get<Organization>('/organization/statistic');
        return org.data;
    }
}

export default new OrganizationRepository();
