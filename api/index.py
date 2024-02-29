import json
import re
from flask import Response, stream_with_context, Flask, render_template, request, jsonify
from flask_cors import CORS
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor

import requests

from api.ai import ask, askArgument

app = Flask(__name__)
CORS(app)

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
    If you find that its useful, generate a query to search on Bing Images for an image that can clarify content.
    """
def boldPrompt(p):
    return f""""
    Given this paragraph: "{p}"
    Return the same with <b> tags on some key words.
    """

def get_image(prompt):
    try:
        print("Prompt", prompt, flush=True)
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

def transform(paragraph):

    with ThreadPoolExecutor() as executor:
        [paragraph, image_keys] = executor.map(ask, [boldPrompt(paragraph), imagePrompt(paragraph)]) 
    image = get_image(image_keys)
    if image:
        paragraph = f"{paragraph}<br/><img src=\"{image}\"/>"

    paragraph = f"{paragraph}<br/>"
    return paragraph

def askPrompt(prompt):
    full_reply_content = ""
    for chunk in askArgument(prompt):
        chunk_message = chunk.choices[0].delta.content  # extract the message
            #collected_messages.append(chunk_message)
            #collected_messages = [m for m in collected_messages if m is not None]
            #full_reply_content = ''.join([m for m in collected_messages])
        if chunk_message:
                #print(chunk_message, flush=True, end="")
            full_reply_content = f"{full_reply_content}{chunk_message}"
            #yield full_reply_content
    soup = BeautifulSoup(full_reply_content, 'html.parser')
    with ThreadPoolExecutor() as executor:
        transformed_paragraphs = executor.map(transform, [str(p) for p in soup.find_all('p')])  
    paragraphs_html = "".join(transformed_paragraphs).replace("\"\"\"", "")
    yield paragraphs_html

@app.route("/api/search", methods=["POST"])
def searchArg():
    argument = request.json["query"]

    prompt = explanationPrompt(argument)
    
    return app.response_class(askPrompt(prompt), mimetype='text/event-stream')


@app.route("/api/healthchecker", methods=["GET"])
def healthchecker():
    return {"status": "success", "message": "Operational"}


if __name__ == "__main__":
    app.run()
