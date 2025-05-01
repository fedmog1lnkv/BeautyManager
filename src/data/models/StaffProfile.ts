import StaffRole from '@/data/models/StaffRole';

export default class StaffProfile {
    id: string;
    name: string;
    phoneNumber: string;
    role: StaffRole;

    constructor(id?: string, name?: string, phoneNumber?: string, role?: StaffRole) {
        this.id = id || '';
        this.name = name || '';
        this.phoneNumber = phoneNumber || '';
        this.role = role || StaffRole.Manager;
    }

    static fromJson(json: any): StaffProfile {
        return new StaffProfile(json.id, json.name, json.phoneNumber, json.role);
    }
}
