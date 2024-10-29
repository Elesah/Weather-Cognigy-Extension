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
            key: "location",
            label: "Weather in this city",
            type: "cognigyText",
            description: "Please write a city name here"
        },
    ],
    function: async ({ cognigy, config }) => {
        var _a, _b, _c, _d, _e, _f;
        const { api } = cognigy;
        let { connection, location } = config;
        let multipleResults = false;
        let cityCountryMap = new Map();
        try {
            const responseCities = await axios_1.default.get(`http://dataservice.accuweather.com/locations/v1/cities/search?apikey=${connection.key}&q=${location}&details=true`);
            for (let foundCity of responseCities.data) { // we can have multiple cities with the same name
                cityCountryMap.set(foundCity.Key, foundCity.Country.LocalizedName);
            }
            for (let cityKey of cityCountryMap.keys()) {
                const responseForecast = await axios_1.default.get(`http://dataservice.accuweather.com/forecasts/v1/daily/1day/${cityKey}?apikey=${connection.key}&details=true&metric=true`);
                api.output(responseForecast.statusText);
                api.output(`The weather today in ${location}, ${cityCountryMap.get(cityKey)} will be ${(_a = responseForecast.data) === null || _a === void 0 ? void 0 : _a.DailyForecasts[0].Day.ShortPhrase.toLowerCase()} during the day ` +
                    `and ${(_b = responseForecast.data) === null || _b === void 0 ? void 0 : _b.DailyForecasts[0].Night.ShortPhrase.toLowerCase()} during the night, the minimum temperature will be of ` +
                    `${(_c = responseForecast.data) === null || _c === void 0 ? void 0 : _c.DailyForecasts[0].Temperature.Minimum.Value}° ${(_d = responseForecast.data) === null || _d === void 0 ? void 0 : _d.DailyForecasts[0].Temperature.Minimum.Unit} and the ` +
                    `maximum temperature of ${(_e = responseForecast.data) === null || _e === void 0 ? void 0 : _e.DailyForecasts[0].Temperature.Maximum.Value}° ${(_f = responseForecast.data) === null || _f === void 0 ? void 0 : _f.DailyForecasts[0].Temperature.Maximum.Unit}.` + `\n`);
            }
        }
        catch (error) {
            api.output("I can't help you with the weather in this city");
            api.log('error', error.message);
        }
    }
});
//# sourceMappingURL=GetWeatherFromLocation.js.map