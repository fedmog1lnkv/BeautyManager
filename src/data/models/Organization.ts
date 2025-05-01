import VenueTheme from '@/data/models/VenueTheme';

export default interface Organization {
    id: string;
    name: string;
    description?: string;
    subscription: string;
    theme: VenueTheme;
}
