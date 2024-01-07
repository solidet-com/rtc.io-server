import SocketInfo from "./socket-info";


export default interface IceData  extends SocketInfo {
    data: RTCSessionDescriptionInit|RTCIceCandidate
  }