import {
    Server as RootServer,
    Socket,
    DisconnectReason,
    ServerOptions as RootServerOptions,
    Namespace,
    BroadcastOperator,
    RemoteSocket,
    Event,
} from "socket.io";
import { createServer, IncomingMessage, ServerResponse } from "http"; // Import the 'http' module
import { addDefaultListeners } from "./lib/defaulthandlers";
import { whipManager } from "./lib/whip-whep";

interface ServerOptions extends RootServerOptions {}

export class Server extends RootServer {
    constructor(opts?: Partial<ServerOptions>) {
        super(opts);
    }

    listen(port: number, opts?: Partial<ServerOptions>): this {
        console.log("extended listen method");

        const options = {
            rtcHttpServerPort: port || 3000,
            socketIoServerOptions: {},
        };

        const server = whipManager(options);

        return this;
    }
}

export {
    ServerOptions,
    BroadcastOperator,
    RemoteSocket,
    Event,
    Namespace,
    DisconnectReason,
    Socket,
    addDefaultListeners,
};
export default Server;
