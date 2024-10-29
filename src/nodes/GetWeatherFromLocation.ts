import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IWeatherParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
		}
		location: string;
	};
}

export const GetWeatherFromLocationNode = createNodeDescriptor({
    type: "GetWeatherFromLocation",
    defaultLabel: "Get Weather for a location",
	summary: "Returns weather for a certain location",
    fields: [
		{
            key: "connection",
            label: "My AccuWeather Connection",
            type: "connection",
            description: "Please add AccuWeather api key here",
			params: {
				connectionType: "api-key",
				required: true
			}
        },
		{
            key: "location",
            label: "Weather in this city",
            type: "cognigyText",
            description: "Please write a city name here"
        },
    ],
	function: async ({ cognigy, config }: IWeatherParams) => {
		const { api } = cognigy;
		let { connection, location} = config;
		let cityCountryMap: Map<number, string> = new Map<number, string>();


		try {

			const responseCities = await axios.get(`http://dataservice.accuweather.com/locations/v1/cities/search?apikey=${connection.key}&q=${location}&details=true`);
			if (responseCities.data.length === 0) {
				api.output("This city does not exist.");
				return;

			}

			for (let foundCity of responseCities.data) { // we can have multiple cities with the same name
					cityCountryMap.set(foundCity.Key, foundCity.Country.LocalizedName);
				}

			for (let cityKey of cityCountryMap.keys()) {
				const responseForecast = await axios.get(
					`http://dataservice.accuweather.com/forecasts/v1/daily/1day/${cityKey}?apikey=${connection.key}&details=true&metric=true`);

					api.output(`The weather today in ${location}, ${cityCountryMap.get(cityKey)} will be ${responseForecast.data?.DailyForecasts[0].Day.ShortPhrase.toLowerCase()} during the day ` +
							`and ${responseForecast.data?.DailyForecasts[0].Night.ShortPhrase.toLowerCase()} during the night, the minimum temperature will be of ` +
							`${responseForecast.data?.DailyForecasts[0].Temperature.Minimum.Value}° ${responseForecast.data?.DailyForecasts[0].Temperature.Minimum.Unit} and the ` +
							`maximum temperature of ${responseForecast.data?.DailyForecasts[0].Temperature.Maximum.Value}° ${responseForecast.data?.DailyForecasts[0].Temperature.Maximum.Unit}.` + `\n`
						);
				}

		} catch (error) {
				api.log('error', error.message);
		}
	}
});
