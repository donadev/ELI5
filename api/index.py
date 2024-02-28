import json
import re
from flask import Response, stream_with_context, Flask, render_template, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from bs4 import BeautifulSoup
from multiprocessing import Pool

import requests

client = OpenAI(organization="org-CfSBGlGQ3mG4LSEYPfp1Yy4o")
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
    Generate a query to search on Google Images for an image that can clarify content.
    """
def boldPrompt(p):
    return f""""
    Given this paragraph: "{p}"
    Return the same with bold tags on some key words.
    """
def ask(prompt):
    return client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "user", "content": prompt}
        ]).choices[0].message.content

def askArgument(prompt):
    return client.chat.completions.create(
        model="gpt-3.5-turbo",
        stream=True,
        messages=[
            {"role": "system", "content": f"You are a an expert that aims to explain things to normal people in the most simple way possibile (like he's 5 years old). You divide output in html paragraphs"},
            {"role": "user", "content": prompt}
        ])

def get_image(prompt):
    try:
        # Perform Google search
        url = rf'https://www.google.no/search?q={prompt}&client=opera&hs=cTQ&source=lnms&tbm=isch&sa=X&safe=active&ved=0ahUKEwig3LOx4PzKAhWGFywKHZyZAAgQ_AUIBygB&biw=1920&bih=982'

        page = requests.get(url).text

        soup = BeautifulSoup(page, 'html.parser')

        for raw_img in soup.find_all('img'):
            link = raw_img.get('src')
    
            if link and link.startswith("https://"):
                return link
        
    except Exception as e:
        print("An error occurred:", str(e))
        return None

def transform(paragraph):
    paragraph = ask(boldPrompt(paragraph))
    image_keys = ask(imagePrompt(paragraph))
    image = get_image(image_keys)
    if image:
        paragraph = f"{paragraph}<br/><img src=\"{image}\"/>"

    paragraph = f"{paragraph}<br/>"
    return paragraph

@app.route("/api/search", methods=["POST"])
def searchArg():
    argument = request.json["query"]

    prompt = explanationPrompt(argument)

    def askPrompt():
        full_reply_content = ""
        for chunk in askArgument(prompt):
            chunk_message = chunk.choices[0].delta.content  # extract the message
            #collected_messages.append(chunk_message)
            #collected_messages = [m for m in collected_messages if m is not None]
            #full_reply_content = ''.join([m for m in collected_messages])
            if chunk_message:
                #print(chunk_message, flush=True, end="")
                full_reply_content = f"{full_reply_content}{chunk_message}"
        
        soup = BeautifulSoup(full_reply_content, 'html.parser')
        # Trova tutti i tag <p> nella pagina e ottieni solo il loro HTML
        with Pool() as pool:
            transformed_paragraphs = pool.map(transform, [str(p) for p in soup.find_all('p')])
            
        paragraphs_html = "".join(transformed_paragraphs)
        yield paragraphs_html
    
    return Response(askPrompt(), mimetype='text/event-stream')


@app.route("/api/healthchecker", methods=["GET"])
def healthchecker():
    return {"status": "success", "message": "Operational"}


if __name__ == "__main__":
    app.run()
