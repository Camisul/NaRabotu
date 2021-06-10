#!/bin/sh
export FLASK_ENV=development
export FLASK_APP=wrapper.py
echo "PIZDA"
python3 -m flask run --host 0.0.0.0 --port=8000
