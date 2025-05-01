export default class VenueTheme {
    color: string;
    photo: string | null;

    constructor(color?: string, photo?: string) {
        this.color = color || '';
        this.photo = photo || null;
    }

    static fromJSON(json: any): VenueTheme {
        return new VenueTheme(json.color, json.photo);
    }
}
