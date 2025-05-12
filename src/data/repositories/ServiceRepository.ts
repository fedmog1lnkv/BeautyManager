import BeautyClient from '@/data/clients/BeautyClient';
import Paging from '@/data/models/Paging';
import Service from '@/data/models/Service';

class ServiceRepository {
    async getServices(page: number, pageSize: number, query: string): Promise<Paging<Service>> {
        const response = await BeautyClient.get('/organization/services', {
            params: {
                page: page,
                pageSize: pageSize,
                search: query.trim().length == 0 ? null : query.trim()
            }
        });
        return Paging.fromJson<Service>(response.data, Service.fromJSON);
    }

    async saveService(service: Service) {
        await BeautyClient.patch(`/service`, {
            id: service.id,
            name: service.name,
            description: service.description,
            duration: service.getDurationMinutes(),
            price: service.price,
        });
    }

    async saveServiceVenues(service: Service, venueIds: string[]) {
        await BeautyClient.patch(`/service`, {
            id: service.id,
            venueIds: venueIds
        });
    }

    async getService(id: string): Promise<Service> {
        const response = await BeautyClient.get(`/service/${id}`);
        return Service.fromJSON(response.data);
    }

    async createService(organizationId: string, name: string) {
        await BeautyClient.post('/service', {
            organizationId: organizationId,
            name: name
        });
    }
}

export default new ServiceRepository();
