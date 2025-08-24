import pytest
flask = pytest.importorskip("flask")

from app import app as flask_app  # adjust if your Flask instance has a different name

def test_root_route_200_or_skip():
    routes = {str(r.rule) for r in flask_app.url_map.iter_rules()}
    if "/" not in routes:
        pytest.skip("root route not defined")
    with flask_app.test_client() as c:
        r = c.get("/")
        assert r.status_code == 200
