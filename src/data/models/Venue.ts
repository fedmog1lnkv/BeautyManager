import VenueTheme from '@/data/models/VenueTheme';
import VenueLocation from '@/data/models/VenueLocation';

export default class Venue {
    id: string;
    name: string;
    description?: string;
    theme: VenueTheme;
    address: string;
    rating?: number;
    location?: VenueLocation;
    photos: str[];

    constructor(id?: string, name?: string, description?: string, theme?: VenueTheme, address?: string, rating?: number, location?: VenueLocation, photos?: str[]) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.theme = theme;
        this.address = address;
        this.rating = rating;
        this.location = location;
        this.photos = photos;
    }

    static fromJson(json: any): Venue {
        if (!json) {
            return null;
        }
        return new Venue(json.id, json.name, json.description, VenueTheme.fromJSON(json['theme']), json.address, json.rating, VenueLocation.fromJson(json.location), json?.photos ?? []);
    }
}
