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
import { addDefaultListeners } from "./lib/defaulthandlers";

interface ServerOptions extends RootServerOptions {}

export class Server extends RootServer {
    constructor(opts?: Partial<ServerOptions>) {
        super(opts);
    }

    listen(port: number, opts?: Partial<ServerOptions>): this {
        console.log("extended listen method");

        return super.listen(port, opts);
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
