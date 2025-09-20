from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.get("/healthz")
def healthz():
    return {"status": "ok"}


@app.post("/api/coach")
def coach():
    data = request.get_json(force=True) or {}
    stage = data.get("stage", "preflop")
    action = data.get("action", "")
    context = data.get("context", {})

    # Placeholder coaching response. Replace with real logic/LLM later.
    message = (
        f"At {stage}, consider ranges, position, and stack depth. "
        f"You suggested: '{action}'. Start by evaluating opponent ranges, pot odds, and EV."
    )

    example_ranges = {
        "hero": "Tight-aggressive preflop open 15%",
        "villain": "Blind defend ~30%"
    }

    return jsonify({
        "message": message,
        "ranges": example_ranges,
        "echo": {"stage": stage, "context": context}
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(5000), debug=True)


