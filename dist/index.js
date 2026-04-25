"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RtcioEvents = exports.addDefaultListeners = exports.Socket = exports.Namespace = exports.Server = void 0;
const socket_io_1 = require("socket.io");
Object.defineProperty(exports, "Socket", { enumerable: true, get: function () { return socket_io_1.Socket; } });
Object.defineProperty(exports, "Namespace", { enumerable: true, get: function () { return socket_io_1.Namespace; } });
const defaulthandlers_1 = require("./lib/defaulthandlers");
Object.defineProperty(exports, "addDefaultListeners", { enumerable: true, get: function () { return defaulthandlers_1.addDefaultListeners; } });
const events_1 = require("./lib/events");
Object.defineProperty(exports, "RtcioEvents", { enumerable: true, get: function () { return events_1.RtcioEvents; } });
class Server extends socket_io_1.Server {
    constructor(opts) {
        super(opts);
        super.on("connection", (socket) => (0, defaulthandlers_1.addDefaultListeners)(socket));
    }
}
exports.Server = Server;
exports.default = Server;
