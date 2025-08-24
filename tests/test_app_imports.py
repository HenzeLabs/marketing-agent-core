import importlib

def test_app_module_imports():
    # Just verifies your Flask API module imports without crashing
    importlib.import_module("app")
