import json
import re
from flask import Response, stream_with_context, Flask, render_template, request, jsonify
from flask_cors import CORS
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor
import time
import requests

from api.ai import ask, askArgument
from api.pubsub import stream

app = Flask(__name__)
CORS(app)




def explanationPrompt(argument):
    return f""""
    Explain how the following concept work: "{argument}" like I'm 5 years old. Use 100 words.
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
    Return a list of words, comma separated, in this paragraphs that you think can go bold.
    """

def get_image(prompt):
    try:
        print("Image prompt", prompt)
        if prompt == "NO":
            return None
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

def bold_occurrences(text, word):
    occurrences = text.split(f" {word} ")
    if len(occurrences) > 1:
        new_text = f' <b>{word}</b> '.join(occurrences)
        return new_text
    else:
        return text
    
def boldify(paragraph, bold_words):
    words = bold_words.split(",")
    for word in words:
        paragraph = bold_occurrences(paragraph, word.strip())
    return paragraph

def transform(query, paragraph):
    print("transform", paragraph, flush=True)
    with ThreadPoolExecutor() as executor:
        [bold_words, image_prompt] = executor.map(ask, [boldPrompt(paragraph, query), imagePrompt(paragraph, query)]) 
    paragraph = boldify(paragraph, bold_words)
    image = get_image(image_prompt)
    if image:
        paragraph = f"{paragraph}<br/><img src=\"{image}\"/>"

    paragraph = f"{paragraph}<br/>"
    return paragraph

def askPrompt(prompt, argument, topic):
    full_reply_content = ""
    for chunk in askArgument(prompt):
        chunk_message = chunk.choices[0].delta.content  # extract the message
            #collected_messages.append(chunk_message)
            #collected_messages = [m for m in collected_messages if m is not None]
            #full_reply_content = ''.join([m for m in collected_messages])
    
        if chunk_message:
                #print(chunk_message, flush=True, end="")
            full_reply_content = f"{full_reply_content}{chunk_message}"
            stream(topic, full_reply_content)
            yield full_reply_content
    soup = BeautifulSoup(full_reply_content, 'html.parser')
    with ThreadPoolExecutor() as executor:
        transformed_paragraphs = executor.map(lambda a: transform(*a), [(argument, str(p)) for p in soup.find_all('p')])  
    paragraphs_html = "".join(transformed_paragraphs).replace("\"\"\"", "")
    stream(topic, paragraphs_html, last=True)
    print("Finished generation", flush=True)

    yield paragraphs_html

@app.route("/api/search", methods=["POST"])
def searchArg():
    argument = request.json["query"]
    clientId = request.json["clientId"]

    prompt = explanationPrompt(argument)
    
    return stream_with_context(askPrompt(prompt, argument, clientId))


@app.route('/api/ip')
def get_requester_ip():
    requester_ip = request.remote_addr
    return jsonify({"requester_ip": requester_ip})


@app.route("/api/healthchecker", methods=["GET"])
def healthchecker():
    return {"status": "success", "message": "Operational"}


if __name__ == "__main__":
    app.run()
