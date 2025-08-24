import json, yaml, pathlib

def test_config_yaml_is_valid():
    text = pathlib.Path("config.yaml").read_text()
    data = yaml.safe_load(text)
    assert isinstance(data, dict)

def test_bigquery_schema_json_is_valid():
    p = pathlib.Path("bigquery_schemas/ga4_events_schema.json")
    text = p.read_text()
    json.loads(text)  # raises if invalid
