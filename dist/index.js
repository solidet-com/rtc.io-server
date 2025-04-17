"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDefaultListeners = exports.Socket = exports.Namespace = exports.Server = void 0;
const socket_io_1 = require("socket.io");
Object.defineProperty(exports, "Socket", { enumerable: true, get: function () { return socket_io_1.Socket; } });
Object.defineProperty(exports, "Namespace", { enumerable: true, get: function () { return socket_io_1.Namespace; } });
const defaulthandlers_1 = require("./lib/defaulthandlers");
Object.defineProperty(exports, "addDefaultListeners", { enumerable: true, get: function () { return defaulthandlers_1.addDefaultListeners; } });
const whip_whep_1 = require("./lib/whip-whep");
class Server extends socket_io_1.Server {
    constructor(opts) {
        super(opts);
    }
    listen(port, opts) {
        const options = {
            rtcHttpServerPort: port || 3000,
            socketIoServerOptions: {},
        };
        const server = (0, whip_whep_1.whipManager)(options);
        this.attach(server);
        return this;
    }
}
exports.Server = Server;
exports.default = Server;
