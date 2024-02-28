from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

todos = []
todo_id_counter = 1


@app.route("/api/search", methods=["POST"])
def search():
    data = request.get_json()
    title = data.get("title")
    if not title:
        return {"error": "Title is required"}, 400

    global todo_id_counter
    todo = {
        "id": todo_id_counter,
        "title": title,
        "completed": False
    }
    todos.append(todo)
    todo_id_counter += 1
    return todo, 201


@app.route("/api/healthchecker", methods=["GET"])
def healthchecker():
    return {"status": "success", "message": "Integrate Flask Framework with Next.js"}


if __name__ == "__main__":
    app.run()
