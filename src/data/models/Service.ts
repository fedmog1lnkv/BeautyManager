import Venue from '@/data/models/Venue';
import StaffProfile from '@/data/models/StaffProfile';

export default class Service {
    id: string;
    name: string;
    rating: number;
    duration: string;
    description: string;
    price: number;
    photo: string;
    staffIds: string[];
    venueIds: string[];

    constructor(id?: string, name?: string, rating?: number, duration?: string, description?: string, price?: number, photo?: string, staffs?: string[], venues?: string[]) {
        this.id = id;
        this.name = name;
        this.rating = rating;
        this.duration = duration;
        this.description = description;
        this.price = price;
        this.photo = photo;
        this.staffIds = staffs;
        this.venueIds = venues;
    }

    getDurationMinutes(): number {
        return parseInt(this.duration.split(':')[0]) * 60 + parseInt(this.duration.split(':')[1]);
    }

    static fromJSON(json: any): Service {
        return new Service(
            json.id,
            json.name,
            json.rating,
            json.duration,
            json.description ?? '',
            json.price,
            json.photo,
            json.staffIds,
            json.venueIds
        );
    }
}
