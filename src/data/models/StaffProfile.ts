import StaffRole from '@/data/models/StaffRole';

export default interface StaffProfile {
    id: string;
    name: string;
    phoneNumber: string;
    role: StaffRole;
}
