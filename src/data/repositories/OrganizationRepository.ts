import Organization from '@/data/models/Organization';
import BeautyClient from '@/data/clients/BeautyClient';
import { BehaviorSubject } from 'rxjs';
import OrganizationStats from '@/data/models/OrganizationStats';

class OrganizationRepository {
    organization: BehaviorSubject<Organization> = new BehaviorSubject(null);

    async getCachedOrFetch(): Promise<Organization> {
        let cache = localStorage.getItem('organization');
        if (cache) {
            return Organization.fromJson(JSON.parse(cache));
        }
        return this.getOrganization();
    }

    async getOrganization(): Promise<Organization> {
        const org = await BeautyClient.get('/staff/organization');
        const des = Organization.fromJson(org.data);
        localStorage.setItem('organization', JSON.stringify(des));
        return des;
    }

    async getStats(): Promise<OrganizationStats> {
        const org = await BeautyClient.get('/organization/statistic');
        return OrganizationStats.fromJson(org.data);
    }

    async uploadPhoto(organizationId: string, photo: string | ArrayBuffer): Promise<void> {
        await BeautyClient.patch('/organization', {
            id: organizationId,
            photo: photo
        });
    }

    async saveOrganization(organization: Organization): Promise<void> {
        await BeautyClient.patch('/organization', {
            id: organization.id,
            name: organization.name,
            description: organization.description,
            color: organization.theme.color
        });
    }
}

export default new OrganizationRepository();
