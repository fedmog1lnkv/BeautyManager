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

    async saveVenue(venue: Venue): Promise<void> {
        await BeautyClient.patch('/venue', {
            id: venue.id,
            name: venue.name,
            description: venue.description,
            color: venue.theme.color,
            address: venue.address,
            location: venue.location
        });
    }

    async savePhotoOrder(venueId: string, photos: string[]): Promise<void> {
        const photoGuids = photos.map((photo: string) => photo.split('/').pop().split('.')[0]);

        await BeautyClient.patch('/venue', {
            id: venueId,
            photos: photoGuids
        });
    }

    async deletePhoto(venueId: string, photo: string): Promise<void> {
        const photoGuid = photo.split('/').pop().split('.')[0];

        await BeautyClient.delete(`/venue/${venueId}/photo/${photoGuid}`);
    }

    async saveVenuePhoto(venueId: string, photo: string | ArrayBuffer): Promise<void> {
        await BeautyClient.patch('/venue', {
            id: venueId,
            photo: photo
        });
    }

    async addPhotoToList(venueId: string, photo: string | ArrayBuffer): Promise<void> {
        await BeautyClient.post('/venue/photo', {
            venueId: venueId,
            photo: photo
        });
    }
}

export default new VenueRepository();
