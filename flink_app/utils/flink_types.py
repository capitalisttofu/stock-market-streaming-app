from pyflink.common import Time, Types

TRADE_EVENT_TYPE = Types.ROW_NAMED(
    [
        "id",
        "symbol",
        "exchange",
        "sectype",
        "lasttradeprice",
        "timestamp",
        "created_at_timestamp",
    ],
    [
        Types.STRING(),
        Types.STRING(),
        Types.STRING(),
        Types.STRING(),
        Types.FLOAT(),
        Types.LONG(),
        Types.LONG(),
    ],
)

EMA_EVENT_TYPE = Types.ROW_NAMED(
    [
        "emaj_38",
        "emaj_100",
        "prev_emaj_38",
        "prev_emaj_100",
        "symbol",
        "window_start",
        "window_end",
        "created_at_timestamp",
    ],
    [
        Types.FLOAT(),
        Types.FLOAT(),
        Types.FLOAT(),
        Types.FLOAT(),
        Types.STRING(),
        Types.LONG(),
        Types.LONG(),
        Types.LONG(),
    ],
)

BUYSELL_EVENT_TYPE = Types.ROW_NAMED(
    [
        "emaj_38",
        "emaj_100",
        "prev_emaj_38",
        "prev_emaj_100",
        "symbol",
        "window_start",
        "window_end",
        "buy_or_sell_action",
        "ema_created_at_timestamp",
    ],
    [
        Types.FLOAT(),
        Types.FLOAT(),
        Types.FLOAT(),
        Types.FLOAT(),
        Types.STRING(),
        Types.LONG(),
        Types.LONG(),
        Types.STRING(),
        Types.LONG(),
    ],
)
