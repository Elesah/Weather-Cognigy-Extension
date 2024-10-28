import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

export interface IWeatherParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
		}
		city: string;
		country: string;
		location: string;
	};
}

export const GetWeatherFromLocationNode = createNodeDescriptor({
    type: "GetWeatherFromLocation",
    defaultLabel: "Get Weather From Locations",
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
            description: "Please add a city here"
        },

		{
			key: "country",
			type: "select",
			label: "Select country",
			optionsResolver: {
				dependencies: ["connection"],
				resolverFunction: async ({ api, config }) => {

					try {
							const response = await api.httpRequest({
								method: "get",
								url: `https://restcountries.com/v3.1/all`,

							});
							return response?.data.map((country) => {
									return {
										label: country.name.common,
										value: country.name.common
									};
								});
					} catch (error) {
						console.log(error);
						throw new Error(error);
					}
				},
			},
		},

		{
			key: "city",
			type: "select",
			label: "Select location",
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
							console.log(response.data);

							return response?.data?.data.map((city) => {
									return {
										label: city,
										value: city
									};
								});
					} catch (error) {
						console.log(error);
						throw new Error(error);
					}
				},
			},
		}
    ],
	function: async ({ cognigy, config }: IWeatherParams) => {
		const { api } = cognigy;
		let { connection, city, country, location} = config;
		let cityToBeFound;

		try {
			const responseCities = await axios.get(`http://dataservice.accuweather.com/locations/v1/cities/search?apikey=${connection.key}&q=${location}`);
			for (let foundCity of responseCities.data) {
				if (foundCity.Country.EnglishName === country) {
					cityToBeFound = foundCity;
				}
			}
			if (!cityToBeFound) {
				cityToBeFound = location;
			}
			if (cityToBeFound) {
				const responseForecast = await axios.get(
					`http://dataservice.accuweather.com/forecasts/v1/daily/1day/${cityToBeFound.Key}?apikey=${connection.key}`);
				api.output(`Today it will be a ${responseForecast.data?.Headline.Text} with a minimum temperature of ${responseForecast.data?.DailyForecasts[0].Temperature.Minimum.Value} F and a maximum of ${responseForecast.data.DailyForecasts[0].Temperature.Maximum.Value}`);
			}
			} catch (error) {
				api.log('error', error.message);
			}
	}});