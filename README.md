# rtc.io-server

Node signaling server for [rtc.io](https://www.npmjs.com/package/rtc.io). Thin wrapper on top of `socket.io` that wires up the rtc.io signaling protocol.

```bash
npm install rtc.io-server
```

## Usage

```ts
import { Server } from "rtc.io-server";

const server = new Server({ cors: { origin: "*" } });

server.on("connection", (socket) => {
  socket.on("join-room", ({ roomId, name }) => {
    socket.data.name = name;
    socket.join(roomId);
    // Tell every existing peer in the room to initiate an offer to the new one.
    socket.to(roomId).emit("#rtcio:init-offer", { source: socket.id });
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((roomId) => {
      if (roomId === socket.id) return;
      socket.to(roomId).emit("user-disconnected", { id: socket.id });
    });
  });
});

server.listen(3001);
```

## What this server does

The rtc.io client multiplexes all WebRTC signaling (offers, answers, ICE candidates, stream metadata) into a single `#rtcio:message` event. This server registers a default handler for that event and relays it to the addressed peer (`socket.to(target).emit(...)`). Everything else — room management, app-level events, presence — is **your** code.

### What you implement

- **Room/lobby logic.** `socket.join(roomId)`, fan-out on join, presence broadcasts.
- **The `#rtcio:init-offer` kickoff.** When a new peer joins a room, emit this to existing peers so they initiate offers to the newcomer. The client listens for it and starts the WebRTC handshake.
- **App-level events.** Chat persistence, auth, etc.

The server has no opinion about any of these — it's just a relay.

## API

```ts
import { Server, ServerOptions, RtcioEvents } from "rtc.io-server";
```

- `Server` — extends socket.io's `Server`. Same options. `addDefaultListeners` is attached automatically on every `connection`.
- `RtcioEvents` — string constants for the rtc.io reserved event names (use `RtcioEvents.INIT_OFFER` instead of typing `"#rtcio:init-offer"` by hand).
- `addDefaultListeners(socket)` — registers the message-relay handler. Called automatically; expose for advanced use.

## Wire compatibility

This server speaks the rtc.io signaling protocol — pair it with `rtc.io@^1.1.0` clients. The envelope format changed in 1.1, so older clients are not wire-compatible.

## License

MIT
