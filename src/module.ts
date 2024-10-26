import { createExtension } from "@cognigy/extension-tools";

/* import all nodes */
import { GetWeatherFromLocationNode } from "./nodes/GetWeatherFromLocation";

/* import all connections */
import { apiKeyConnection } from "./connections/apiKeyConnection";

export default createExtension({
	nodes: [
		GetWeatherFromLocationNode
	],

	connections: [
		apiKeyConnection
	]
});