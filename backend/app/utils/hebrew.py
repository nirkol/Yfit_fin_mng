from datetime import datetime
from dateutil import parser

HEBREW_DAYS = {
    0: "יום שני",      # Monday
    1: "יום שלישי",    # Tuesday
    2: "יום רביעי",    # Wednesday
    3: "יום חמישי",    # Thursday
    4: "יום שישי",     # Friday
    5: "שבת",          # Saturday
    6: "יום ראשון"     # Sunday
}


def get_hebrew_day_of_week(date_str: str) -> str:
    """
    Convert a date string to Hebrew day of week.
    Accepts ISO format (YYYY-MM-DD or full ISO datetime)
    """
    try:
        date = parser.parse(date_str)
        weekday = date.weekday()
        return HEBREW_DAYS.get(weekday, "")
    except:
        return ""
