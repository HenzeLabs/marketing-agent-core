
import importlib
import os
import sys
from pathlib import Path
import pytest

# ---- Imports-only tests (cheap insurance) ----
@pytest.mark.parametrize("module", [
    "scripts.pipeline_clarity",          # adjust to your actual module names
    "scripts.pipeline_clarity_hotash",
    "scripts.pipeline_clarity_summaries",
    "src.ga4_pipeline",
    "src.shopify_pipeline",
    "pipeline",
])
def test_imports_only(module):
    mod = importlib.import_module(module)
    assert mod is not None


# --- Clarity import test: skip if no local creds ---
import os
from pathlib import Path

import json
def _has_local_creds():
    env_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if env_path and Path(env_path).exists():
        try:
            with open(env_path) as f:
                data = json.load(f)
            if "type" in data:
                return True
        except Exception:
            return False
    hardcoded = Path("./creds/henzelabs-ci.json")
    if hardcoded.exists():
        try:
            with open(hardcoded) as f:
                data = json.load(f)
            if "type" in data:
                return True
        except Exception:
            return False
    return False

@pytest.mark.skipif(not _has_local_creds(), reason="No local GCP creds; skipping clarity import smoke test.")
def test_clarity_import_only():
    # Only validates the module imports when creds are present locally.
    mod = importlib.import_module("scripts.fetch_clarity_pageviews")
    assert mod is not None

# ---- Pipeline main: don't hit real APIs; validate args wiring only ----
def test_pipeline_main_help(monkeypatch):
    """
    Many pipelines require --brand; instead of hitting APIs, call --help to test CLI wiring.
    """
    import pipeline as pipeline_module
    # Simulate "pipeline --help"
    monkeypatch.setenv("NO_NETWORK", "1")  # if your code respects it, fine; if not, harmless
    monkeypatch.setattr(sys, "argv", ["pipeline", "--help"])
    # If your pipeline parses args in main(), ensure calling --help doesn't crash
    if hasattr(pipeline_module, "main"):
        try:
            pipeline_module.main()
        except SystemExit as e:
            # argparse exits with code 0 on --help
            assert e.code == 0
