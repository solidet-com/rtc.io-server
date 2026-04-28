export const RtcioEvents = {
    OFFER:       "#rtcio:offer",
    ANSWER:      "#rtcio:answer",
    CANDIDATE:   "#rtcio:candidate",
    MESSAGE:     "#rtcio:message",
    STREAM_META: "#rtcio:stream-meta",
    INIT_OFFER:  "#rtcio:init-offer",
    // Server → client. Fan out to a leaving socket's rooms so existing peers
    // can tear down their RTCPeerConnection immediately instead of waiting
    // on ICE consent-freshness (~30 s) to declare the peer dead.
    PEER_LEFT:   "#rtcio:peer-left",
} as const;
