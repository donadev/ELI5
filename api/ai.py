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
    return client.chat.completions.create(
        model=model,
        messages=[
            {"role": "user", "content": prompt}
        ]).choices[0].message.content

def askArgument(prompt):
    return client.chat.completions.create(
        model=model,
        stream=True,
        messages=[
            {"role": "system", "content": f"You are a an expert that aims to explain things to normal people in the most simple way possibile (like he's 5 years old). You divide output in html paragraphs. You put in <b> the key words."},
            {"role": "user", "content": prompt}
        ])