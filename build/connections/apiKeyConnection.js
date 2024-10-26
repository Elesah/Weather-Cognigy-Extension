"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiKeyConnection = void 0;
/**
 * This file defines a 'schema' for a connection of type 'api-key'.
 * The connection needs to be referenced in the node that wants to
 * use the connection:
 * - see 'nodes/executeCognigyApiRequest.ts'
 *
 * The connection also needs to get exposed in the 'createExtension'
 * call:
 * - see 'module.ts'
 */
exports.apiKeyConnection = {
    type: "api-key",
    label: "Holds the api-key for a Cognigy.AI v4 API request.",
    fields: [
        { fieldName: "key" }
    ]
};
//# sourceMappingURL=apiKeyConnection.js.map