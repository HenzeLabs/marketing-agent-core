import os, shutil, subprocess, sys, pytest
DBT_DIR = "transform/dbt"

def _has_creds():
    p = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    return p and os.path.exists(p)

dbt = shutil.which("dbt")

@pytest.mark.skipif(not dbt, reason="dbt not installed")
def test_dbt_parse(tmp_path, monkeypatch):
    # Always set a dummy GOOGLE_APPLICATION_CREDENTIALS so dbt parse never fails for missing env
    if not os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
        dummy = tmp_path / "dummy_creds.json"
        dummy.write_text('{"type": "service_account"}')
        monkeypatch.setenv("GOOGLE_APPLICATION_CREDENTIALS", str(dummy))
    r = subprocess.run([dbt, "parse", "--profiles-dir", "."], cwd=DBT_DIR)
    assert r.returncode == 0

@pytest.mark.skipif(not dbt or not _has_creds(), reason="No dbt or GCP creds; skipping dbt build.")
def test_dbt_build_sanity():
    r = subprocess.run([dbt, "build", "--profiles-dir", ".", "-s", "marts.mart_sanity"], cwd=DBT_DIR)
    assert r.returncode == 0
