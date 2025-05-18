import StaffRole from '@/data/models/StaffRole';

export default class StaffProfile {
    id: string;
    name: string;
    phoneNumber: string;
    role: StaffRole;
    rating: number;
    photo: string;

    constructor(
        id?: string,
        name?: string,
        phoneNumber?: string,
        role?: StaffRole,
        rating?: number,
        photo?: string
    ) {
        this.id = id || '';
        this.name = name || '';
        this.phoneNumber = phoneNumber || '';
        this.role = role || StaffRole.Manager;
        this.rating = rating ?? 0;
        this.photo = photo || '';
    }

    static fromJson(json: any): StaffProfile {
        return new StaffProfile(
            json.id,
            json.name,
            json.phoneNumber,
            json.role,
            json.rating,
            json.photo
        );
    }
}
