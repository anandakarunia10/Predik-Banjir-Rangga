from flask import Flask, request, jsonify
from flask_cors import CORS
from gee import uhi_map, ndvi_map, uhi_stats

app = Flask(__name__)
CORS(app)

cache = {}

@app.route("/uhi")
def uhi():
    year = request.args.get("year")
    key = f"uhi_{year}"
    try:
        if key not in cache:
            cache[key] = uhi_map(year)
        return jsonify(cache[key])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/ndvi")
def ndvi():
    year = request.args.get("year")
    key = f"ndvi_{year}"
    try:
        if key not in cache:
            cache[key] = ndvi_map(year)
        return jsonify(cache[key])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/uhi/stats")
def stats():
    year = request.args.get("year")
    try:
        # Memastikan fungsi uhi_stats di gee.py mengembalikan info numerik
        return jsonify(uhi_stats(year))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)