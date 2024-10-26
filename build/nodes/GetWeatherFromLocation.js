"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetWeatherFromLocationNode = void 0;
const extension_tools_1 = require("@cognigy/extension-tools");
const axios_1 = require("axios");
exports.GetWeatherFromLocationNode = (0, extension_tools_1.createNodeDescriptor)({
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
            label: "Weather in this ciry",
            type: "cognigyText",
            description: "Please add a city here"
        },
        {
            key: "location",
            type: "select",
            label: "Select with Option Resolvers",
            description: "Dynmically loads information from an API when the Background Selector above is changed",
            optionsResolver: {
                dependencies: ["connection"],
                resolverFunction: async ({ api, config }) => {
                    // fetch list of files using http request
                    const response = await api.httpRequest({
                        method: "GET",
                        url: `http://dataservice.accuweather.com/locations/v1/cities/autocomplete?apikey=${config.connection.key}&q=${config.location}`,
                    });
                    console.log(JSON.stringify(response.data, null, 2));
                    // map file list to "options array"
                    return response.data.map((location) => {
                        return {
                            city: location.LocalizedName
                        };
                    });
                },
            },
        }
    ],
    function: async ({ cognigy, config }) => {
        const { api } = cognigy;
        const { connection, location } = config;
        const response = await axios_1.default.get(`http://dataservice.accuweather.com/locations/v1/cities/search?apikey=${connection.key}&q=${location}`);
        api.output(connection.key);
        api.output(location);
        const cityCodesArray = response.data.map((location) => {
            return {
                cityCode: location.Key
            };
        });
        for (let cityCode of cityCodesArray) {
            const response = await axios_1.default.get(`http://dataservice.accuweather.com/forecasts/v1/daily/1day/${cityCode.cityCode}?apikey=${connection.key}`);
            api.output(`Today it will be a ${response.data.Headline.Text} with a minimum temperature of ${response.data.DailyForecasts[0].Temperature.Minimum.Value} F and a maximum of ${response.data.DailyForecasts[0].Temperature.Maximum.Value}`);
        }
    }
});
//# sourceMappingURL=GetWeatherFromLocation.js.map