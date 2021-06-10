import flask
from scrape import get_all_offers_links, rebuild_and_deep_index, sha1
from flask import request, jsonify
import os
import redis
import json
import threading

app = flask.Flask(__name__)
app.config["DEBUG"] = True
r = redis.Redis(host=os.getenv('REDIS'), port=6379, db=0)
# Create some test data for our catalog in the form of a list of dictionaries.

@app.route('/', methods=['GET'])
def home():
    return '''No.'''

def runner(query):
    global r
    all_offers = get_all_offers_links(query, '2')
    r.set('index', json.dumps([x['link'] for x in all_offers]))
    rebuild_and_deep_index(r, all_offers)

# A route to return all of the available entries in our catalog.
@app.route('/api/fetch_more', methods=['POST'])
def fetch_more():
    content = request.json
    query = content['query']
    tt = threading.Thread(target=runner, args=(query,))
    print("Thread", tt)
    tt.start()
    return jsonify({'message': 'OK'})

app.run()

