import Venue from '@/data/models/Venue';
import BeautyClient from '@/data/clients/BeautyClient';

class VenueRepository {
    async getVenues(): Promise<Venue[]> {
        const venues = await BeautyClient.get('/organization/venues');
        return (venues.data as Array<any>).map((venue: any) => Venue.fromJson(venue));
    }

    async getVenue(id: string): Promise<Venue> {
        const venue = await BeautyClient.get(`/venue/${id}`);
        return Venue.fromJson(venue.data);
    }

    async saveVenue() {

    }
}

export default new VenueRepository()
