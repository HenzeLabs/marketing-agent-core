#!/bin/sh
exec gunicorn -b 0.0.0.0:${PORT:-8080} app:app
