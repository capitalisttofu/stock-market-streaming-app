/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

/**
 * SecType enum.
 * @exports SecType
 * @enum {number}
 * @property {number} I=1 I value
 * @property {number} E=2 E value
 */
$root.SecType = (function() {
    var valuesById = {}, values = Object.create(valuesById);
    values[valuesById[1] = "I"] = 1;
    values[valuesById[2] = "E"] = 2;
    return values;
})();

$root.RawTradeEvent = (function() {

    /**
     * Properties of a RawTradeEvent.
     * @exports IRawTradeEvent
     * @interface IRawTradeEvent
     * @property {string|null} [id] RawTradeEvent id
     * @property {SecType|null} [secType] RawTradeEvent secType
     * @property {number|null} [lastTradePrice] RawTradeEvent lastTradePrice
     * @property {google.protobuf.ITimestamp|null} [tradingTime] RawTradeEvent tradingTime
     * @property {google.protobuf.ITimestamp|null} [tradingDate] RawTradeEvent tradingDate
     */

    /**
     * Constructs a new RawTradeEvent.
     * @exports RawTradeEvent
     * @classdesc Represents a RawTradeEvent.
     * @implements IRawTradeEvent
     * @constructor
     * @param {IRawTradeEvent=} [properties] Properties to set
     */
    function RawTradeEvent(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * RawTradeEvent id.
     * @member {string} id
     * @memberof RawTradeEvent
     * @instance
     */
    RawTradeEvent.prototype.id = "";

    /**
     * RawTradeEvent secType.
     * @member {SecType} secType
     * @memberof RawTradeEvent
     * @instance
     */
    RawTradeEvent.prototype.secType = 1;

    /**
     * RawTradeEvent lastTradePrice.
     * @member {number|null|undefined} lastTradePrice
     * @memberof RawTradeEvent
     * @instance
     */
    RawTradeEvent.prototype.lastTradePrice = null;

    /**
     * RawTradeEvent tradingTime.
     * @member {google.protobuf.ITimestamp|null|undefined} tradingTime
     * @memberof RawTradeEvent
     * @instance
     */
    RawTradeEvent.prototype.tradingTime = null;

    /**
     * RawTradeEvent tradingDate.
     * @member {google.protobuf.ITimestamp|null|undefined} tradingDate
     * @memberof RawTradeEvent
     * @instance
     */
    RawTradeEvent.prototype.tradingDate = null;

    // OneOf field names bound to virtual getters and setters
    var $oneOfFields;

    // Virtual OneOf for proto3 optional field
    Object.defineProperty(RawTradeEvent.prototype, "_lastTradePrice", {
        get: $util.oneOfGetter($oneOfFields = ["lastTradePrice"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    // Virtual OneOf for proto3 optional field
    Object.defineProperty(RawTradeEvent.prototype, "_tradingTime", {
        get: $util.oneOfGetter($oneOfFields = ["tradingTime"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    // Virtual OneOf for proto3 optional field
    Object.defineProperty(RawTradeEvent.prototype, "_tradingDate", {
        get: $util.oneOfGetter($oneOfFields = ["tradingDate"]),
        set: $util.oneOfSetter($oneOfFields)
    });

    /**
     * Creates a new RawTradeEvent instance using the specified properties.
     * @function create
     * @memberof RawTradeEvent
     * @static
     * @param {IRawTradeEvent=} [properties] Properties to set
     * @returns {RawTradeEvent} RawTradeEvent instance
     */
    RawTradeEvent.create = function create(properties) {
        return new RawTradeEvent(properties);
    };

    /**
     * Encodes the specified RawTradeEvent message. Does not implicitly {@link RawTradeEvent.verify|verify} messages.
     * @function encode
     * @memberof RawTradeEvent
     * @static
     * @param {IRawTradeEvent} message RawTradeEvent message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    RawTradeEvent.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.id != null && Object.hasOwnProperty.call(message, "id"))
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
        if (message.secType != null && Object.hasOwnProperty.call(message, "secType"))
            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.secType);
        if (message.lastTradePrice != null && Object.hasOwnProperty.call(message, "lastTradePrice"))
            writer.uint32(/* id 3, wireType 5 =*/29).float(message.lastTradePrice);
        if (message.tradingTime != null && Object.hasOwnProperty.call(message, "tradingTime"))
            $root.google.protobuf.Timestamp.encode(message.tradingTime, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
        if (message.tradingDate != null && Object.hasOwnProperty.call(message, "tradingDate"))
            $root.google.protobuf.Timestamp.encode(message.tradingDate, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified RawTradeEvent message, length delimited. Does not implicitly {@link RawTradeEvent.verify|verify} messages.
     * @function encodeDelimited
     * @memberof RawTradeEvent
     * @static
     * @param {IRawTradeEvent} message RawTradeEvent message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    RawTradeEvent.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a RawTradeEvent message from the specified reader or buffer.
     * @function decode
     * @memberof RawTradeEvent
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {RawTradeEvent} RawTradeEvent
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    RawTradeEvent.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.RawTradeEvent();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.id = reader.string();
                    break;
                }
            case 2: {
                    message.secType = reader.int32();
                    break;
                }
            case 3: {
                    message.lastTradePrice = reader.float();
                    break;
                }
            case 4: {
                    message.tradingTime = $root.google.protobuf.Timestamp.decode(reader, reader.uint32());
                    break;
                }
            case 5: {
                    message.tradingDate = $root.google.protobuf.Timestamp.decode(reader, reader.uint32());
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a RawTradeEvent message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof RawTradeEvent
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {RawTradeEvent} RawTradeEvent
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    RawTradeEvent.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a RawTradeEvent message.
     * @function verify
     * @memberof RawTradeEvent
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    RawTradeEvent.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        var properties = {};
        if (message.id != null && message.hasOwnProperty("id"))
            if (!$util.isString(message.id))
                return "id: string expected";
        if (message.secType != null && message.hasOwnProperty("secType"))
            switch (message.secType) {
            default:
                return "secType: enum value expected";
            case 1:
            case 2:
                break;
            }
        if (message.lastTradePrice != null && message.hasOwnProperty("lastTradePrice")) {
            properties._lastTradePrice = 1;
            if (typeof message.lastTradePrice !== "number")
                return "lastTradePrice: number expected";
        }
        if (message.tradingTime != null && message.hasOwnProperty("tradingTime")) {
            properties._tradingTime = 1;
            {
                var error = $root.google.protobuf.Timestamp.verify(message.tradingTime);
                if (error)
                    return "tradingTime." + error;
            }
        }
        if (message.tradingDate != null && message.hasOwnProperty("tradingDate")) {
            properties._tradingDate = 1;
            {
                var error = $root.google.protobuf.Timestamp.verify(message.tradingDate);
                if (error)
                    return "tradingDate." + error;
            }
        }
        return null;
    };

    /**
     * Creates a RawTradeEvent message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof RawTradeEvent
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {RawTradeEvent} RawTradeEvent
     */
    RawTradeEvent.fromObject = function fromObject(object) {
        if (object instanceof $root.RawTradeEvent)
            return object;
        var message = new $root.RawTradeEvent();
        if (object.id != null)
            message.id = String(object.id);
        switch (object.secType) {
        default:
            if (typeof object.secType === "number") {
                message.secType = object.secType;
                break;
            }
            break;
        case "I":
        case 1:
            message.secType = 1;
            break;
        case "E":
        case 2:
            message.secType = 2;
            break;
        }
        if (object.lastTradePrice != null)
            message.lastTradePrice = Number(object.lastTradePrice);
        if (object.tradingTime != null) {
            if (typeof object.tradingTime !== "object")
                throw TypeError(".RawTradeEvent.tradingTime: object expected");
            message.tradingTime = $root.google.protobuf.Timestamp.fromObject(object.tradingTime);
        }
        if (object.tradingDate != null) {
            if (typeof object.tradingDate !== "object")
                throw TypeError(".RawTradeEvent.tradingDate: object expected");
            message.tradingDate = $root.google.protobuf.Timestamp.fromObject(object.tradingDate);
        }
        return message;
    };

    /**
     * Creates a plain object from a RawTradeEvent message. Also converts values to other types if specified.
     * @function toObject
     * @memberof RawTradeEvent
     * @static
     * @param {RawTradeEvent} message RawTradeEvent
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    RawTradeEvent.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.id = "";
            object.secType = options.enums === String ? "I" : 1;
        }
        if (message.id != null && message.hasOwnProperty("id"))
            object.id = message.id;
        if (message.secType != null && message.hasOwnProperty("secType"))
            object.secType = options.enums === String ? $root.SecType[message.secType] === undefined ? message.secType : $root.SecType[message.secType] : message.secType;
        if (message.lastTradePrice != null && message.hasOwnProperty("lastTradePrice")) {
            object.lastTradePrice = options.json && !isFinite(message.lastTradePrice) ? String(message.lastTradePrice) : message.lastTradePrice;
            if (options.oneofs)
                object._lastTradePrice = "lastTradePrice";
        }
        if (message.tradingTime != null && message.hasOwnProperty("tradingTime")) {
            object.tradingTime = $root.google.protobuf.Timestamp.toObject(message.tradingTime, options);
            if (options.oneofs)
                object._tradingTime = "tradingTime";
        }
        if (message.tradingDate != null && message.hasOwnProperty("tradingDate")) {
            object.tradingDate = $root.google.protobuf.Timestamp.toObject(message.tradingDate, options);
            if (options.oneofs)
                object._tradingDate = "tradingDate";
        }
        return object;
    };

    /**
     * Converts this RawTradeEvent to JSON.
     * @function toJSON
     * @memberof RawTradeEvent
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    RawTradeEvent.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for RawTradeEvent
     * @function getTypeUrl
     * @memberof RawTradeEvent
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    RawTradeEvent.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/RawTradeEvent";
    };

    return RawTradeEvent;
})();

$root.TradeEvent = (function() {

    /**
     * Properties of a TradeEvent.
     * @exports ITradeEvent
     * @interface ITradeEvent
     * @property {string|null} [id] TradeEvent id
     * @property {string|null} [symbol] TradeEvent symbol
     * @property {string|null} [exchange] TradeEvent exchange
     * @property {SecType|null} [sectype] TradeEvent sectype
     * @property {number|null} [lasttradeprice] TradeEvent lasttradeprice
     * @property {google.protobuf.ITimestamp|null} [lastUpdate] TradeEvent lastUpdate
     * @property {google.protobuf.ITimestamp|null} [lastTrade] TradeEvent lastTrade
     */

    /**
     * Constructs a new TradeEvent.
     * @exports TradeEvent
     * @classdesc Represents a TradeEvent.
     * @implements ITradeEvent
     * @constructor
     * @param {ITradeEvent=} [properties] Properties to set
     */
    function TradeEvent(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * TradeEvent id.
     * @member {string} id
     * @memberof TradeEvent
     * @instance
     */
    TradeEvent.prototype.id = "";

    /**
     * TradeEvent symbol.
     * @member {string} symbol
     * @memberof TradeEvent
     * @instance
     */
    TradeEvent.prototype.symbol = "";

    /**
     * TradeEvent exchange.
     * @member {string} exchange
     * @memberof TradeEvent
     * @instance
     */
    TradeEvent.prototype.exchange = "";

    /**
     * TradeEvent sectype.
     * @member {SecType} sectype
     * @memberof TradeEvent
     * @instance
     */
    TradeEvent.prototype.sectype = 1;

    /**
     * TradeEvent lasttradeprice.
     * @member {number} lasttradeprice
     * @memberof TradeEvent
     * @instance
     */
    TradeEvent.prototype.lasttradeprice = 0;

    /**
     * TradeEvent lastUpdate.
     * @member {google.protobuf.ITimestamp|null|undefined} lastUpdate
     * @memberof TradeEvent
     * @instance
     */
    TradeEvent.prototype.lastUpdate = null;

    /**
     * TradeEvent lastTrade.
     * @member {google.protobuf.ITimestamp|null|undefined} lastTrade
     * @memberof TradeEvent
     * @instance
     */
    TradeEvent.prototype.lastTrade = null;

    /**
     * Creates a new TradeEvent instance using the specified properties.
     * @function create
     * @memberof TradeEvent
     * @static
     * @param {ITradeEvent=} [properties] Properties to set
     * @returns {TradeEvent} TradeEvent instance
     */
    TradeEvent.create = function create(properties) {
        return new TradeEvent(properties);
    };

    /**
     * Encodes the specified TradeEvent message. Does not implicitly {@link TradeEvent.verify|verify} messages.
     * @function encode
     * @memberof TradeEvent
     * @static
     * @param {ITradeEvent} message TradeEvent message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    TradeEvent.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.id != null && Object.hasOwnProperty.call(message, "id"))
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
        if (message.symbol != null && Object.hasOwnProperty.call(message, "symbol"))
            writer.uint32(/* id 2, wireType 2 =*/18).string(message.symbol);
        if (message.exchange != null && Object.hasOwnProperty.call(message, "exchange"))
            writer.uint32(/* id 3, wireType 2 =*/26).string(message.exchange);
        if (message.sectype != null && Object.hasOwnProperty.call(message, "sectype"))
            writer.uint32(/* id 4, wireType 0 =*/32).int32(message.sectype);
        if (message.lasttradeprice != null && Object.hasOwnProperty.call(message, "lasttradeprice"))
            writer.uint32(/* id 5, wireType 5 =*/45).float(message.lasttradeprice);
        if (message.lastUpdate != null && Object.hasOwnProperty.call(message, "lastUpdate"))
            $root.google.protobuf.Timestamp.encode(message.lastUpdate, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
        if (message.lastTrade != null && Object.hasOwnProperty.call(message, "lastTrade"))
            $root.google.protobuf.Timestamp.encode(message.lastTrade, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified TradeEvent message, length delimited. Does not implicitly {@link TradeEvent.verify|verify} messages.
     * @function encodeDelimited
     * @memberof TradeEvent
     * @static
     * @param {ITradeEvent} message TradeEvent message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    TradeEvent.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a TradeEvent message from the specified reader or buffer.
     * @function decode
     * @memberof TradeEvent
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {TradeEvent} TradeEvent
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    TradeEvent.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.TradeEvent();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.id = reader.string();
                    break;
                }
            case 2: {
                    message.symbol = reader.string();
                    break;
                }
            case 3: {
                    message.exchange = reader.string();
                    break;
                }
            case 4: {
                    message.sectype = reader.int32();
                    break;
                }
            case 5: {
                    message.lasttradeprice = reader.float();
                    break;
                }
            case 6: {
                    message.lastUpdate = $root.google.protobuf.Timestamp.decode(reader, reader.uint32());
                    break;
                }
            case 7: {
                    message.lastTrade = $root.google.protobuf.Timestamp.decode(reader, reader.uint32());
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a TradeEvent message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof TradeEvent
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {TradeEvent} TradeEvent
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    TradeEvent.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a TradeEvent message.
     * @function verify
     * @memberof TradeEvent
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    TradeEvent.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.id != null && message.hasOwnProperty("id"))
            if (!$util.isString(message.id))
                return "id: string expected";
        if (message.symbol != null && message.hasOwnProperty("symbol"))
            if (!$util.isString(message.symbol))
                return "symbol: string expected";
        if (message.exchange != null && message.hasOwnProperty("exchange"))
            if (!$util.isString(message.exchange))
                return "exchange: string expected";
        if (message.sectype != null && message.hasOwnProperty("sectype"))
            switch (message.sectype) {
            default:
                return "sectype: enum value expected";
            case 1:
            case 2:
                break;
            }
        if (message.lasttradeprice != null && message.hasOwnProperty("lasttradeprice"))
            if (typeof message.lasttradeprice !== "number")
                return "lasttradeprice: number expected";
        if (message.lastUpdate != null && message.hasOwnProperty("lastUpdate")) {
            var error = $root.google.protobuf.Timestamp.verify(message.lastUpdate);
            if (error)
                return "lastUpdate." + error;
        }
        if (message.lastTrade != null && message.hasOwnProperty("lastTrade")) {
            var error = $root.google.protobuf.Timestamp.verify(message.lastTrade);
            if (error)
                return "lastTrade." + error;
        }
        return null;
    };

    /**
     * Creates a TradeEvent message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof TradeEvent
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {TradeEvent} TradeEvent
     */
    TradeEvent.fromObject = function fromObject(object) {
        if (object instanceof $root.TradeEvent)
            return object;
        var message = new $root.TradeEvent();
        if (object.id != null)
            message.id = String(object.id);
        if (object.symbol != null)
            message.symbol = String(object.symbol);
        if (object.exchange != null)
            message.exchange = String(object.exchange);
        switch (object.sectype) {
        default:
            if (typeof object.sectype === "number") {
                message.sectype = object.sectype;
                break;
            }
            break;
        case "I":
        case 1:
            message.sectype = 1;
            break;
        case "E":
        case 2:
            message.sectype = 2;
            break;
        }
        if (object.lasttradeprice != null)
            message.lasttradeprice = Number(object.lasttradeprice);
        if (object.lastUpdate != null) {
            if (typeof object.lastUpdate !== "object")
                throw TypeError(".TradeEvent.lastUpdate: object expected");
            message.lastUpdate = $root.google.protobuf.Timestamp.fromObject(object.lastUpdate);
        }
        if (object.lastTrade != null) {
            if (typeof object.lastTrade !== "object")
                throw TypeError(".TradeEvent.lastTrade: object expected");
            message.lastTrade = $root.google.protobuf.Timestamp.fromObject(object.lastTrade);
        }
        return message;
    };

    /**
     * Creates a plain object from a TradeEvent message. Also converts values to other types if specified.
     * @function toObject
     * @memberof TradeEvent
     * @static
     * @param {TradeEvent} message TradeEvent
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    TradeEvent.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.id = "";
            object.symbol = "";
            object.exchange = "";
            object.sectype = options.enums === String ? "I" : 1;
            object.lasttradeprice = 0;
            object.lastUpdate = null;
            object.lastTrade = null;
        }
        if (message.id != null && message.hasOwnProperty("id"))
            object.id = message.id;
        if (message.symbol != null && message.hasOwnProperty("symbol"))
            object.symbol = message.symbol;
        if (message.exchange != null && message.hasOwnProperty("exchange"))
            object.exchange = message.exchange;
        if (message.sectype != null && message.hasOwnProperty("sectype"))
            object.sectype = options.enums === String ? $root.SecType[message.sectype] === undefined ? message.sectype : $root.SecType[message.sectype] : message.sectype;
        if (message.lasttradeprice != null && message.hasOwnProperty("lasttradeprice"))
            object.lasttradeprice = options.json && !isFinite(message.lasttradeprice) ? String(message.lasttradeprice) : message.lasttradeprice;
        if (message.lastUpdate != null && message.hasOwnProperty("lastUpdate"))
            object.lastUpdate = $root.google.protobuf.Timestamp.toObject(message.lastUpdate, options);
        if (message.lastTrade != null && message.hasOwnProperty("lastTrade"))
            object.lastTrade = $root.google.protobuf.Timestamp.toObject(message.lastTrade, options);
        return object;
    };

    /**
     * Converts this TradeEvent to JSON.
     * @function toJSON
     * @memberof TradeEvent
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    TradeEvent.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for TradeEvent
     * @function getTypeUrl
     * @memberof TradeEvent
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    TradeEvent.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/TradeEvent";
    };

    return TradeEvent;
})();

$root.google = (function() {

    /**
     * Namespace google.
     * @exports google
     * @namespace
     */
    var google = {};

    google.protobuf = (function() {

        /**
         * Namespace protobuf.
         * @memberof google
         * @namespace
         */
        var protobuf = {};

        protobuf.Timestamp = (function() {

            /**
             * Properties of a Timestamp.
             * @memberof google.protobuf
             * @interface ITimestamp
             * @property {number|Long|null} [seconds] Timestamp seconds
             * @property {number|null} [nanos] Timestamp nanos
             */

            /**
             * Constructs a new Timestamp.
             * @memberof google.protobuf
             * @classdesc Represents a Timestamp.
             * @implements ITimestamp
             * @constructor
             * @param {google.protobuf.ITimestamp=} [properties] Properties to set
             */
            function Timestamp(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Timestamp seconds.
             * @member {number|Long} seconds
             * @memberof google.protobuf.Timestamp
             * @instance
             */
            Timestamp.prototype.seconds = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Timestamp nanos.
             * @member {number} nanos
             * @memberof google.protobuf.Timestamp
             * @instance
             */
            Timestamp.prototype.nanos = 0;

            /**
             * Creates a new Timestamp instance using the specified properties.
             * @function create
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {google.protobuf.ITimestamp=} [properties] Properties to set
             * @returns {google.protobuf.Timestamp} Timestamp instance
             */
            Timestamp.create = function create(properties) {
                return new Timestamp(properties);
            };

            /**
             * Encodes the specified Timestamp message. Does not implicitly {@link google.protobuf.Timestamp.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {google.protobuf.ITimestamp} message Timestamp message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Timestamp.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.seconds != null && Object.hasOwnProperty.call(message, "seconds"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int64(message.seconds);
                if (message.nanos != null && Object.hasOwnProperty.call(message, "nanos"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int32(message.nanos);
                return writer;
            };

            /**
             * Encodes the specified Timestamp message, length delimited. Does not implicitly {@link google.protobuf.Timestamp.verify|verify} messages.
             * @function encodeDelimited
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {google.protobuf.ITimestamp} message Timestamp message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Timestamp.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Timestamp message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {google.protobuf.Timestamp} Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Timestamp.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.Timestamp();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1: {
                            message.seconds = reader.int64();
                            break;
                        }
                    case 2: {
                            message.nanos = reader.int32();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Timestamp message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {google.protobuf.Timestamp} Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Timestamp.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Timestamp message.
             * @function verify
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Timestamp.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.seconds != null && message.hasOwnProperty("seconds"))
                    if (!$util.isInteger(message.seconds) && !(message.seconds && $util.isInteger(message.seconds.low) && $util.isInteger(message.seconds.high)))
                        return "seconds: integer|Long expected";
                if (message.nanos != null && message.hasOwnProperty("nanos"))
                    if (!$util.isInteger(message.nanos))
                        return "nanos: integer expected";
                return null;
            };

            /**
             * Creates a Timestamp message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {google.protobuf.Timestamp} Timestamp
             */
            Timestamp.fromObject = function fromObject(object) {
                if (object instanceof $root.google.protobuf.Timestamp)
                    return object;
                var message = new $root.google.protobuf.Timestamp();
                if (object.seconds != null)
                    if ($util.Long)
                        (message.seconds = $util.Long.fromValue(object.seconds)).unsigned = false;
                    else if (typeof object.seconds === "string")
                        message.seconds = parseInt(object.seconds, 10);
                    else if (typeof object.seconds === "number")
                        message.seconds = object.seconds;
                    else if (typeof object.seconds === "object")
                        message.seconds = new $util.LongBits(object.seconds.low >>> 0, object.seconds.high >>> 0).toNumber();
                if (object.nanos != null)
                    message.nanos = object.nanos | 0;
                return message;
            };

            /**
             * Creates a plain object from a Timestamp message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {google.protobuf.Timestamp} message Timestamp
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Timestamp.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, false);
                        object.seconds = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.seconds = options.longs === String ? "0" : 0;
                    object.nanos = 0;
                }
                if (message.seconds != null && message.hasOwnProperty("seconds"))
                    if (typeof message.seconds === "number")
                        object.seconds = options.longs === String ? String(message.seconds) : message.seconds;
                    else
                        object.seconds = options.longs === String ? $util.Long.prototype.toString.call(message.seconds) : options.longs === Number ? new $util.LongBits(message.seconds.low >>> 0, message.seconds.high >>> 0).toNumber() : message.seconds;
                if (message.nanos != null && message.hasOwnProperty("nanos"))
                    object.nanos = message.nanos;
                return object;
            };

            /**
             * Converts this Timestamp to JSON.
             * @function toJSON
             * @memberof google.protobuf.Timestamp
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Timestamp.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Timestamp
             * @function getTypeUrl
             * @memberof google.protobuf.Timestamp
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Timestamp.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/google.protobuf.Timestamp";
            };

            return Timestamp;
        })();

        return protobuf;
    })();

    return google;
})();

module.exports = $root;
