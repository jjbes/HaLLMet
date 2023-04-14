from dotenv import dotenv_values
import openai

config = dotenv_values(".env")
openai.api_key = config["OPENAI_KEY"]

def request_GPT(content, max_tokens=300):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        temperature=0,
        max_tokens=max_tokens,
        messages=[{"role": "system", "content":content}],
    )    
    return {"response": response["choices"][0]["message"]['content']}