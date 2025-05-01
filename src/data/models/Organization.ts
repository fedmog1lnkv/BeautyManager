import VenueTheme from '@/data/models/VenueTheme';

export default class Organization {
    id: string;
    name: string;
    description?: string;
    subscription: string;
    theme: VenueTheme;

    constructor(id?: string, name?: string, description?: string, subscription?: string, theme?: VenueTheme) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.subscription = subscription;
        this.theme = theme;
    }

    static fromJson(json: any): Organization {
        return new Organization(
            json.id,
            json.name,
            json.description,
            json.subscription,
            VenueTheme.fromJSON(json['theme'])
        )
    }

    isActiveSubscription(): boolean {
        return this.subscription.toLowerCase() == 'active';
    }
}
