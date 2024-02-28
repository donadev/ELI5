import json
import re
from flask import Response, stream_with_context, Flask, render_template, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import time

client = OpenAI(organization="org-CfSBGlGQ3mG4LSEYPfp1Yy4o")
app = Flask(__name__)
CORS(app)


def get_image(context):
    return "<img src='https://img.freepik.com/free-psd/google-icon-isolated-3d-render-illustration_47987-9777.jpg?size=338&ext=jpg&ga=GA1.1.1141335507.1707609600&semt=ais'/>"

def enhance_result(output, pattern):
    print(output)
    contexts = re.findall(pattern, output)
    print(contexts)
    images = [get_image(ctx) for ctx in contexts]
    print(images)
    replaced = [x.group() for x in re.finditer(pattern, output)]
    print(replaced)
    for (i, o) in zip(replaced, images):
        output = output.replace(i, o)
    return output

def explanationPrompt(argument):
    return f""""
    Explain the following concept: {argument} in a concise and simple way, like I'm 5 years old. 
    Output as list of paragraphs, 200 words max overall.
    """
def imagePrompt(p):
    return f""""
    Given this paragraph: "{p}"
    Generate a query to search on Google Images for an image that can clarify content.
    """
    
def ask(prompt):
    return client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "user", "content": prompt}
        ])

def askArgument(prompt):
    return client.chat.completions.create(
        model="gpt-3.5-turbo",
        stream=True,
        messages=[
            {"role": "system", "content": f"You are a an expert that aims to explain things to normal people in the most simple way possibile (like he's 5 years old). You divide output in html paragraphs"},
            {"role": "user", "content": prompt}
        ])

def format(paragraph):
    pass

@app.route("/api/search", methods=["POST"])
def search():
    argument = request.json["query"]

    prompt = explanationPrompt(argument)

    def askPrompt():
        collected_messages = []
        for chunk in ask(prompt, stream=True):
            chunk_message = chunk.choices[0].delta.content  # extract the message
            #collected_messages.append(chunk_message)
            #collected_messages = [m for m in collected_messages if m is not None]
            #full_reply_content = ''.join([m for m in collected_messages])
            if chunk_message:
                print(chunk_message, flush=True, end="")
                yield f"{chunk_message}"
    
    return Response(askPrompt(), mimetype='text/event-stream')


@app.route("/api/healthchecker", methods=["GET"])
def healthchecker():
    return {"status": "success", "message": "Operational"}


if __name__ == "__main__":
    app.run()
