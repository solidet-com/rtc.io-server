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
import { RtcioEvents } from "./lib/events";

interface ServerOptions extends RootServerOptions {}

export class Server extends RootServer {
    constructor(opts?: Partial<ServerOptions>) {
        super(opts);
        super.on("connection", (socket: Socket) => addDefaultListeners(socket));
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
    RtcioEvents,
};
export default Server;
