"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetWeatherFromLocationNode = void 0;
const extension_tools_1 = require("@cognigy/extension-tools");
const axios_1 = require("axios");
exports.GetWeatherFromLocationNode = (0, extension_tools_1.createNodeDescriptor)({
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
                    var _a, _b;
                    try {
                        const response = await api.httpRequest({
                            method: "get",
                            url: `https://countriesnow.space/api/v0.1/countries/positions`,
                        });
                        return (_b = (_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.map((country) => {
                            return {
                                label: country.name,
                                value: country.name
                            };
                        });
                    }
                    catch (error) {
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
                    var _a;
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
                        return (_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.data.map((city) => {
                            return {
                                label: city,
                                value: city
                            };
                        });
                    }
                    catch (error) {
                        if (!config.country) {
                            throw new Error("Please select a country!");
                        }
                        throw new Error(error);
                    }
                },
            },
        }
    ],
    function: async ({ cognigy, config }) => {
        var _a, _b, _c, _d, _e, _f;
        const { api } = cognigy;
        let { connection, location, country } = config;
        let cityToBeFound = null;
        try {
            const responseCities = await axios_1.default.get(`http://dataservice.accuweather.com/locations/v1/cities/search?apikey=${connection.key}&q=${location}`);
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
                const responseForecast = await axios_1.default.get(`http://dataservice.accuweather.com/forecasts/v1/daily/1day/${cityToBeFound.Key}?apikey=${connection.key}&details=true&metric=true`);
                api.output(responseForecast.statusText);
                api.output(`The weather today in ${location}, ${country} will be ${(_a = responseForecast.data) === null || _a === void 0 ? void 0 : _a.DailyForecasts[0].Day.ShortPhrase.toLowerCase()} during the day ` +
                    `and ${(_b = responseForecast.data) === null || _b === void 0 ? void 0 : _b.DailyForecasts[0].Night.ShortPhrase.toLowerCase()} during the night, with a minimum temperature of ` +
                    `${(_c = responseForecast.data) === null || _c === void 0 ? void 0 : _c.DailyForecasts[0].Temperature.Minimum.Value}° ${(_d = responseForecast.data) === null || _d === void 0 ? void 0 : _d.DailyForecasts[0].Temperature.Minimum.Unit} and a ` +
                    `maximum temperature of ${(_e = responseForecast.data) === null || _e === void 0 ? void 0 : _e.DailyForecasts[0].Temperature.Maximum.Value}° ${(_f = responseForecast.data) === null || _f === void 0 ? void 0 : _f.DailyForecasts[0].Temperature.Maximum.Unit}`);
            }
        }
        catch (error) {
            api.log('error', error.message);
        }
    }
});
//# sourceMappingURL=GetWeatherFromLocation.js.map