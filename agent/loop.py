#!/usr/bin/env python3
import os, sys, re, json, argparse
try:
    import requests, yaml
except ImportError:
    print("Missing deps. Run: pip install requests pyyaml", file=sys.stderr); sys.exit(1)

INTENTS = yaml.safe_load(open("config/intents.yaml"))
TOOLS   = json.load(open("config/tools.json"))

def match_intent(q: str):
    for it in INTENTS:
        for pat in it["patterns"]:
            rx = re.compile(pat.replace("*", ".*"), re.I)
            if rx.search(q): return it
    return INTENTS[0]

def route(query: str, brand: str = None, base: str = None):
    it = match_intent(query)
    tool = TOOLS[it["tool"]]
    params = dict(it.get("defaults", {}))
    if brand: params["brand"] = brand
    endpoint = tool["endpoint"]
    base = base or os.getenv("API_BASE", "http://localhost:8000")
    url = base.rstrip("/") + endpoint
    r = requests.get(url, params=params, timeout=90)
    r.raise_for_status()
    return {"intent": it["intent"], "inputs": params, "data": r.json()}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("query")
    ap.add_argument("--brand", default=None, choices=["labessentials","hotash"])
    ap.add_argument("--base", default=os.getenv("API_BASE"))
    args = ap.parse_args()
    out = route(args.query, brand=args.brand, base=args.base)
    print(json.dumps(out, indent=2))

if __name__ == "__main__":
    main()