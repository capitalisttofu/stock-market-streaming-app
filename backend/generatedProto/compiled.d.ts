import * as $protobuf from "protobufjs";
import Long = require("long");
/** SecType enum. */
export enum SecType {
    I = 0,
    E = 1
}

/** Represents a RawTradeEvent. */
export class RawTradeEvent implements IRawTradeEvent {

    /**
     * Constructs a new RawTradeEvent.
     * @param [properties] Properties to set
     */
    constructor(properties?: IRawTradeEvent);

    /** RawTradeEvent id. */
    public id: string;

    /** RawTradeEvent secType. */
    public secType: SecType;

    /** RawTradeEvent lastTradePrice. */
    public lastTradePrice?: (number|null);

    /** RawTradeEvent tradingTime. */
    public tradingTime?: (google.protobuf.ITimestamp|null);

    /** RawTradeEvent tradingDate. */
    public tradingDate?: (google.protobuf.ITimestamp|null);

    /**
     * Creates a new RawTradeEvent instance using the specified properties.
     * @param [properties] Properties to set
     * @returns RawTradeEvent instance
     */
    public static create(properties?: IRawTradeEvent): RawTradeEvent;

    /**
     * Encodes the specified RawTradeEvent message. Does not implicitly {@link RawTradeEvent.verify|verify} messages.
     * @param message RawTradeEvent message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IRawTradeEvent, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified RawTradeEvent message, length delimited. Does not implicitly {@link RawTradeEvent.verify|verify} messages.
     * @param message RawTradeEvent message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IRawTradeEvent, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a RawTradeEvent message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns RawTradeEvent
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): RawTradeEvent;

    /**
     * Decodes a RawTradeEvent message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns RawTradeEvent
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): RawTradeEvent;

    /**
     * Verifies a RawTradeEvent message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a RawTradeEvent message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns RawTradeEvent
     */
    public static fromObject(object: { [k: string]: any }): RawTradeEvent;

    /**
     * Creates a plain object from a RawTradeEvent message. Also converts values to other types if specified.
     * @param message RawTradeEvent
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: RawTradeEvent, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this RawTradeEvent to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for RawTradeEvent
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a TradeEvent. */
export class TradeEvent implements ITradeEvent {

    /**
     * Constructs a new TradeEvent.
     * @param [properties] Properties to set
     */
    constructor(properties?: ITradeEvent);

    /** TradeEvent id. */
    public id: string;

    /** TradeEvent symbol. */
    public symbol: string;

    /** TradeEvent exchange. */
    public exchange: string;

    /** TradeEvent sectype. */
    public sectype: SecType;

    /** TradeEvent lasttradeprice. */
    public lasttradeprice: number;

    /** TradeEvent lastUpdate. */
    public lastUpdate?: (google.protobuf.ITimestamp|null);

    /** TradeEvent lastTrade. */
    public lastTrade?: (google.protobuf.ITimestamp|null);

    /**
     * Creates a new TradeEvent instance using the specified properties.
     * @param [properties] Properties to set
     * @returns TradeEvent instance
     */
    public static create(properties?: ITradeEvent): TradeEvent;

    /**
     * Encodes the specified TradeEvent message. Does not implicitly {@link TradeEvent.verify|verify} messages.
     * @param message TradeEvent message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ITradeEvent, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified TradeEvent message, length delimited. Does not implicitly {@link TradeEvent.verify|verify} messages.
     * @param message TradeEvent message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ITradeEvent, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a TradeEvent message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns TradeEvent
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): TradeEvent;

    /**
     * Decodes a TradeEvent message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns TradeEvent
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): TradeEvent;

    /**
     * Verifies a TradeEvent message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a TradeEvent message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns TradeEvent
     */
    public static fromObject(object: { [k: string]: any }): TradeEvent;

    /**
     * Creates a plain object from a TradeEvent message. Also converts values to other types if specified.
     * @param message TradeEvent
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: TradeEvent, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this TradeEvent to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for TradeEvent
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Namespace google. */
export namespace google {

    /** Namespace protobuf. */
    namespace protobuf {

        /** Properties of a Timestamp. */
        interface ITimestamp {

            /** Timestamp seconds */
            seconds?: (number|Long|null);

            /** Timestamp nanos */
            nanos?: (number|null);
        }

        /** Represents a Timestamp. */
        class Timestamp implements ITimestamp {

            /**
             * Constructs a new Timestamp.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.ITimestamp);

            /** Timestamp seconds. */
            public seconds: (number|Long);

            /** Timestamp nanos. */
            public nanos: number;

            /**
             * Creates a new Timestamp instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Timestamp instance
             */
            public static create(properties?: google.protobuf.ITimestamp): google.protobuf.Timestamp;

            /**
             * Encodes the specified Timestamp message. Does not implicitly {@link google.protobuf.Timestamp.verify|verify} messages.
             * @param message Timestamp message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.ITimestamp, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Timestamp message, length delimited. Does not implicitly {@link google.protobuf.Timestamp.verify|verify} messages.
             * @param message Timestamp message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.ITimestamp, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Timestamp message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.Timestamp;

            /**
             * Decodes a Timestamp message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.Timestamp;

            /**
             * Verifies a Timestamp message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Timestamp message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Timestamp
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.Timestamp;

            /**
             * Creates a plain object from a Timestamp message. Also converts values to other types if specified.
             * @param message Timestamp
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.Timestamp, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Timestamp to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Timestamp
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}
