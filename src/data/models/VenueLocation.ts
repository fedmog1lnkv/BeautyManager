export default class VenueLocation {
    latitude: number;
    longitude: number;

    constructor(latitude: number, longitude: number) {
        this.latitude = latitude;
        this.longitude = longitude;
    }

    static fromJson(json: any): VenueLocation {
        return new VenueLocation(json.latitude, json.longitude);
    }
}
