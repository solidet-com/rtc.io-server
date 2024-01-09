type BasePayload = {
    source: string;
    target: string;
};

export type MessagePayload<T> = {
    data: T;
} & BasePayload;
