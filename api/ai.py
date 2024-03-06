from openai import OpenAI
import os

from groq import Groq

#OPENAI
client = OpenAI(organization="org-CfSBGlGQ3mG4LSEYPfp1Yy4o")
model = "gpt-3.5-turbo-0125" 
#model = "gpt-4-0125-preview"
#GROQ
#client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
#model = "mixtral-8x7b-32768"

def ask(prompt):
    print(prompt, flush=True)
    return client.chat.completions.create(
        model=model,
        messages=[
            {"role": "user", "content": prompt}
        ]).choices[0].message.content

def askSummary(prompt):
    print(prompt, flush=True)
    return client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": f"I give you a tweet messags and you extract the noun of the argument that is asked to explain. Remove articles, adverbs and verbs from the output, if present."},
            {"role": "user", "content": prompt}
        ]).choices[0].message.content
def askArgument(prompt):
    print(prompt, flush=True)
    return client.chat.completions.create(
        model=model,
        stream=True,
        messages=[
            {"role": "system", "content": f"You are a an expert that aims to explain things to normal people in the most simple way possibile (like he's completely newbie on the topic). You divide output in html paragraphs."},
            {"role": "user", "content": prompt}
        ])