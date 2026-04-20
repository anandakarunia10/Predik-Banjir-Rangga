from flask import Flask, request, jsonify
from flask_cors import CORS
from gee import uhi_map, ndvi_map, uhi_stats

app = Flask(__name__)
CORS(app)

cache = {}

@app.route("/")
def home():
    return "API UHI Tabanan Aktif"

@app.route("/uhi")
def uhi():
    year = request.args.get("year")
    key = f"uhi_{year}"

    if key not in cache:
        result = uhi_map(year)
        cache[key] = result["tile_fetcher"].url_format

    return jsonify({"tile": cache[key]})


@app.route("/ndvi")
def ndvi():
    year = request.args.get("year")
    key = f"ndvi_{year}"

    if key not in cache:
        result = ndvi_map(year)
        cache[key] = result["tile_fetcher"].url_format

    return jsonify({"tile": cache[key]})


@app.route("/uhi/stats")
def stats():
    year = request.args.get("year")
    return jsonify(uhi_stats(year))


if __name__ == "__main__":
    app.run(debug=True)