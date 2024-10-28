import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IWeatherParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
		}
		location: string;
		country: string;
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
			key: "country",
			type: "select",
			label: "Select country",
			params: {
				required: true
			},
			optionsResolver: {
				dependencies: ["connection"],
				resolverFunction: async ({ api, config }) => {
					try {
							const response = await api.httpRequest({
								method: "get",
								url: `https://countriesnow.space/api/v0.1/countries/positions`,
						});
							return response?.data?.data?.map((country) => {
								return {
									label: country.name,
									value: country.name
								};
							});
					} catch (error) {
						throw new Error(error);
					}
				},
			},
		},

		{
			key: "location",
			type: "select",
			label: "Select location",
			params: {
				required: true
			},
			optionsResolver: {
				dependencies: ["connection", "country"],
				resolverFunction: async ({ api, config }) => {

					try {
							const response = await api.httpRequest({
								method: "post",
								url: `https://countriesnow.space/api/v0.1/countries/cities`,
								headers: {
									"Content-Type": "application/json",
								},
								data: {
										"country": config.country
								}
							});
							return response?.data?.data.map((city) => {
									return {
										label: city,
										value: city
									};
								});
					} catch (error) {
						if (!config.country) {
							throw new Error("Please select a country!");
						}
						throw new Error(error);
					}
				},
			},
		}
    ],
	function: async ({ cognigy, config }: IWeatherParams) => {
		const { api } = cognigy;
		let { connection, location, country} = config;
		let cityToBeFound = null;

		try {

			const responseCities = await axios.get(`http://dataservice.accuweather.com/locations/v1/cities/search?apikey=${connection.key}&q=${location}`);
			api.output(responseCities.statusText);
			for (let foundCity of responseCities.data) {
				if (foundCity.Country.EnglishName === country) {
					cityToBeFound = foundCity;
					break;
				}
			}
			api.output(cityToBeFound.LocalizedName);
			api.output(cityToBeFound.Key);

			if (cityToBeFound) {
				const responseForecast = await axios.get(
					`http://dataservice.accuweather.com/forecasts/v1/daily/1day/${cityToBeFound.Key}?apikey=${connection.key}&details=true&metric=true`);
					api.output(responseForecast.statusText);


				api.output(`The weather today in ${location}, ${country} will be ${responseForecast.data?.DailyForecasts[0].Day.ShortPhrase.toLowerCase()} during the day ` +
							`and ${responseForecast.data?.DailyForecasts[0].Night.ShortPhrase.toLowerCase()} during the night, the minimum temperature will be of ` +
							`${responseForecast.data?.DailyForecasts[0].Temperature.Minimum.Value}° ${responseForecast.data?.DailyForecasts[0].Temperature.Minimum.Unit} and the ` +
							`maximum temperature of ${responseForecast.data?.DailyForecasts[0].Temperature.Maximum.Value}° ${responseForecast.data?.DailyForecasts[0].Temperature.Maximum.Unit}.`
						);
			}
		} catch (error) {
				api.log('error', error.message);
		}
	}
});
