import StormGlass, { ForecastPoint } from "@src/clients/stormGlass";
import InternalError from "@src/utils/errors/internalError";
import { Beach } from "@src/models/beach";

export interface BeachForecast extends Omit<Beach, 'user'>, ForecastPoint {}

export interface TimeForecast {
    time: string,
    forecast: BeachForecast[]
}

export class ForecastProcessingInternalError extends InternalError {
    constructor(message: string) {
      super(`Unexpected error during the forecast processing: ${message}`);
    }
  }

export default class Forecast
{
    constructor(protected stormGlass = new StormGlass()){}

    public async processForecastForBeaches(beaches: Beach[]) : Promise<TimeForecast[]>{
        const poinstWhitCorrectSources: BeachForecast[] = [];
        try
        {
            for(const beach of beaches)
            {
                const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng);
                const enrichedBeachData = this.EnrichedbeachData(points, beach);
                poinstWhitCorrectSources.push(...enrichedBeachData);
            }
            return this.mapForecatsByTime(poinstWhitCorrectSources);
        }
        catch(error)
        {
            throw new ForecastProcessingInternalError((error as Error).message);
        }        
    }

    private EnrichedbeachData(points: ForecastPoint[], beach: Beach) : BeachForecast[]{
    return points.map((e) => 
        (
            {
            ...{
                lat: beach.lat,
                lng: beach.lng,
                name: beach.name,
                position: beach.position,
                rating: 1,
            },
            ...e,
            }
        ));
    }

    private mapForecatsByTime(forecast: BeachForecast[]): TimeForecast[] {
        const forecastByTime : TimeForecast [] = [];
        for( const point of forecast)
        {
            const timePoint = forecastByTime.find((f)=> f.time == point.time)
            {
                if(timePoint)
                {
                    timePoint.forecast.push(point);
                }
                else
                {
                    forecastByTime.push(
                        {
                            time: point.time,
                            forecast: [point]
                        }
                    )
                }
            }
        }
        return forecastByTime;
    }
}