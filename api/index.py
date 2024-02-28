from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import time

client = OpenAI(organization="org-CfSBGlGQ3mG4LSEYPfp1Yy4o")
# Initialize the Assistant and Thread globally
assistant_id = "asst_hLLm6X0b9o2sJ8v7xqNQo8vl"
thread_id = ""

app = Flask(__name__)
CORS(app)

def create_assistant():
    global assistant_id
    if assistant_id == "":
        my_assistant = client.beta.assistants.create(
            instructions="Explain concepts in a concise and simple way, like I'm 5 years old. Output formatted HTML and add some images/charts if necessary",
            name="ELI5",
            model="gpt-3.5-turbo-16k",
            tools=[],
        )
        assistant_id = my_assistant.id
    else:
        my_assistant = client.beta.assistants.retrieve(assistant_id)
        assistant_id = my_assistant.id

    return my_assistant


def create_thread():
    global thread_id
    if thread_id == "":
        thread = client.beta.threads.create()
        thread_id = thread.id
    else:
        thread = client.beta.threads.retrieve(thread_id)
        thread_id = thread.id

    return thread

@app.before_request
def initialize():
    app.before_request_funcs[None].remove(initialize)
    create_assistant()
    create_thread()

@app.route("/api/search", methods=["POST"])
def search():
    content = request.json["query"]

    # Send the message to the assistant
    message_params = {"thread_id": thread_id, "role": "user", "content": content}

    print("Message params", message_params)

    thread_message = client.beta.threads.messages.create(**message_params)
    print("Thread message created")
    # Run the assistant
    run = client.beta.threads.runs.create(
        thread_id=thread_id, assistant_id=assistant_id
    )
    # Wait for the run to complete and get the response
    while run.status != "completed":
        if run.status == "failed":
            return jsonify(success=True, message="Failed")
        print("Run status", run.status)
        time.sleep(0.5)
        run = client.beta.threads.runs.retrieve(thread_id=thread_id, run_id=run.id)

    response = client.beta.threads.messages.list(thread_id).data[0]

    return jsonify(success=True, message=response.content[0].text.value)


@app.route("/api/healthchecker", methods=["GET"])
def healthchecker():
    return {"status": "success", "message": "Operational"}


if __name__ == "__main__":
    app.run()
