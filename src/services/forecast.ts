import StormGlass, { ForecastPoint } from "@src/clients/stormGlass";

export enum BeachPosition {
    S = 'S',
    E = 'E',
    W = 'W',
    N = 'N'
}

export interface Beach {
    name: string;
    position: BeachPosition;
    lat: number;
    lng:number;
    user: string;
}

export interface BeachForecast extends Omit<Beach, 'user'>, ForecastPoint {}

export default class Forecast
{
    constructor(protected stormGlass = new StormGlass()){}

    public async processForecastForBeaches(beaches: Beach[]) : Promise<BeachForecast[]>{
        const poinstWhitCorrectSources: BeachForecast[] = [];

        for(const beach of beaches)
        {
            const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng);
            const enrichedBeachData = points.map((e) => ({
                ...{
                    lat: beach.lat,
                    lng: beach.lng,
                    name: beach.name,
                    position: beach.position,
                    rating: 1,
                },
                ...e,
            }));
            poinstWhitCorrectSources.push(...enrichedBeachData);
        }
        return poinstWhitCorrectSources;
    }
}