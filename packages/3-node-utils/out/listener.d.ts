import { Message } from "./types/types";
export declare class EventObserver {
    lastTakenId: any;
    process: boolean;
    observerFunction: Function | undefined;
    incoming: any;
    intervalId: any;
    action: any;
    constructor();
    newIncoming(message: any): void;
    on(action: string, fn?: Function): void;
    off(): void;
    static getPossibleLostAnswer(id: number, subscriber: string, provider: string, timestamp: number): Promise<any>;
    broadcast(info: Message): Promise<void>;
    kill(): void;
    static start(params: [string, string, number, string]): Promise<void>;
}
