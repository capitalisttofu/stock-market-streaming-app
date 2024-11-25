from pyflink.common import Time, Types

TRADE_EVENT_TYPE = Types.ROW_NAMED(
    [
        "id",
        "symbol",
        "exchange",
        "sectype",
        "lasttradeprice",
        "timestamp",
    ],
    [
        Types.STRING(),
        Types.STRING(),
        Types.STRING(),
        Types.STRING(),
        Types.FLOAT(),
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
    ],
    [
        Types.FLOAT(),
        Types.FLOAT(),
        Types.FLOAT(),
        Types.FLOAT(),
        Types.STRING(),
        Types.LONG(),
        Types.LONG(),
    ],
)
