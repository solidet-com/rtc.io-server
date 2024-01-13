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

interface ServerOptions extends RootServerOptions {}

class Server extends RootServer {
    constructor(opts?: Partial<ServerOptions>) {
        super(opts);
    }

    listen(port: number, opts?: Partial<ServerOptions>): this {
        console.log("extended listen method");

        return super.listen(port, opts);
    }
}

export { Server, ServerOptions, BroadcastOperator, RemoteSocket, Event, Namespace, DisconnectReason, Socket };
