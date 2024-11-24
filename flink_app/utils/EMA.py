def calulcate_EMA(last_price: float, j: int, prev_window_ema_for_j: float):
    smoothing_factor_multiplier = 2 / (1 + j)
    return last_price * smoothing_factor_multiplier + prev_window_ema_for_j * (
        1 - smoothing_factor_multiplier
    )
