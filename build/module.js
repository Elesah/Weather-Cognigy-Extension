"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const extension_tools_1 = require("@cognigy/extension-tools");
/* import all nodes */
const GetWeatherFromLocation_1 = require("./nodes/GetWeatherFromLocation");
/* import all connections */
const apiKeyConnection_1 = require("./connections/apiKeyConnection");
exports.default = (0, extension_tools_1.createExtension)({
    nodes: [
        GetWeatherFromLocation_1.GetWeatherFromLocationNode
    ],
    connections: [
        apiKeyConnection_1.apiKeyConnection
    ]
});
//# sourceMappingURL=module.js.map