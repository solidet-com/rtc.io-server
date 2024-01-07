import socketIo from "socket.io";

export default interface BaseSocketData {
    socket: socketIo.Socket;
  }