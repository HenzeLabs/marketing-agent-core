from google.cloud import bigquery
from datetime import datetime

def insert_rows_into_table(table_id, rows):
    """
    Insert rows (list of dicts) into a BigQuery table.
    Args:
        table_id (str): Fully qualified table ID in the form 'project.dataset.table'.
        rows (list): List of dictionaries representing rows to insert.
    Returns:
        errors (list): List of errors returned from the BigQuery API.
    """
    client = bigquery.Client()
    errors = client.insert_rows_json(table_id, rows)
    return errors
