from time import time


def get_current_timestamp():
    return int(time() * 1000)  # Current system time in ms
