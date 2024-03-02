import json
import re
from flask import Response, stream_with_context, Flask, render_template, request, jsonify
from flask_cors import CORS
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor
import time
import requests
from flask_socketio import SocketIO, emit

from api.ai import ask, askArgument

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app)

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
    Explain how the following concept work: {argument} like I'm 5 years old. Use 100 words.
    """
def imagePrompt(p, arg):
    return f""""
    Given this paragraph: "{p}", relative to the argument "{arg}"
    You can decide if you want to augment the content with an Image.
    If you decide to do it, output a short query to search the most relevant image on Bing.
    If you decide to don't do it, output "NO"
    """
def boldPrompt(p, arg):
    return f""""
    Given this paragraph: "{p}", relative to the argument "{arg}"
    Return the same with <b> tags on some key words. Do not alter the content.
    """

def get_image(prompt):
    try:
        if prompt == "NO":
            return None
        print("ImageQuery", prompt, flush=True)
        # Perform Google search
        url = rf'https://www.bing.com/images/search?q={prompt}&form=QBILPG'

        page = requests.get(url).text

        soup = BeautifulSoup(page, 'html.parser')

        for a in soup.find_all('a', {"class": "iusc"}):
            m = a.get('m')
            if m:
                body = json.loads(m)
                link = body["murl"]
                if link and link.startswith("https://"):
                    return link
        
    except Exception as e:
        print("An error occurred:", str(e))
        return None

def transform(query, paragraph):
    with ThreadPoolExecutor() as executor:
        [paragraph] = executor.map(ask, [boldPrompt(paragraph, query)])#, imagePrompt(paragraph, query)]) 
    image = get_image(query)
    if image:
        paragraph = f"{paragraph}<br/><img src=\"{image}\"/>"

    paragraph = f"{paragraph}<br/>"
    return paragraph

def askPrompt(prompt, topic):
    full_reply_content = ""
    for chunk in askArgument(prompt):
        chunk_message = chunk.choices[0].delta.content  # extract the message
            #collected_messages.append(chunk_message)
            #collected_messages = [m for m in collected_messages if m is not None]
            #full_reply_content = ''.join([m for m in collected_messages])
        if chunk_message:
                #print(chunk_message, flush=True, end="")
            full_reply_content = f"{full_reply_content}{chunk_message}"
            socketio.emit(topic, {"data" : full_reply_content, "status": "generating"}, namespace='/updates')
            yield full_reply_content
    soup = BeautifulSoup(full_reply_content, 'html.parser')
    with ThreadPoolExecutor() as executor:
        transformed_paragraphs = executor.map(lambda a: transform(*a), [(prompt, str(p)) for p in soup.find_all('p')])  
    paragraphs_html = "".join(transformed_paragraphs).replace("\"\"\"", "")
    socketio.emit(topic, {"data" : paragraphs_html, "status": "end"}, namespace='/updates')

    yield paragraphs_html

@app.route("/api/search", methods=["POST"])
def searchArg():
    argument = request.json["query"]
    clientId = request.json["clientId"]

    prompt = explanationPrompt(argument)
    
    return stream_with_context(askPrompt(prompt, clientId))

@socketio.on('connect', namespace='/updates')
def handle_connect():
    print('Client connected', flush=True)


@app.route("/api/healthchecker", methods=["GET"])
def healthchecker():
    return {"status": "success", "message": "Operational"}


if __name__ == "__main__":
    socketio.run(app)
