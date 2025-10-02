import requests
import csv
from io import StringIO
from datetime import date, timedelta
import pandas as pd

#pandas
def get_trades_for_range_pandas(account_key, start_date, end_date):
    all_trades = []
    current_date = start_date
    while current_date <= end_date:
        year = current_date.year
        month = current_date.month
        day = current_date.day
        url = f"{URL_PREFIX}/user/{account_key}/tradeRecords/{year}/{year}{month:02}{day:02}"

        try:
            df = pd.read_csv(url)
            all_trades.append(df)
        except requests.exceptions.RequestException as e:
            print(f"Error fetching data for {current_date}: {e}")
        except pd.errors.EmptyDataError:
            print(f"No data available for {current_date}")

        current_date += timedelta(days=1)

    if all_trades:
        return pd.concat(all_trades, ignore_index=True)
    else:
        return pd.DataFrame()

#csv reader
def get_trades_for_range_csv(account_key, start_date, end_date):
    all_trades = []
    current_date = start_date
    while current_date <= end_date:
        year = current_date.year
        month = current_date.month
        day = current_date.day
        url = f"{URL_PREFIX}/user/{account_key}/tradeRecords/{year}/{year}{month:02}{day:02}"
        response = requests.get(url)
        response.raise_for_status()

        csv_data = StringIO(response.text)
        reader = csv.reader(csv_data)
        for row in reader:
            all_trades.append(row)

        current_date += timedelta(days=1)

    return all_trades
