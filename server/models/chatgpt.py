import openai
import os

openai_key = os.getenv("OPENAI_KEY")
openai.api_key = openai_key

def request_GPT(content, max_tokens=300):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        temperature=0,
        max_tokens=max_tokens,
        messages=[{"role": "system", "content":content}],
    )  
    return {"response": response["choices"][0]["message"]['content']}

def request_DALLE(prompt):
    response = openai.Image.create(
        prompt=prompt,
        n=1,
        size="256x256",
    )
    return {"response": response["data"][0]["url"]}