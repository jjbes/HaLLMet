from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from pydantic import BaseModel
import tiktoken

from models.chatgpt import request_GPT 
from models.dreamstudio import request_dreamstudio 

from templates.chatbot import _CHATBOT_TEMPLATE_NO_CONTEXT, _CHATBOT_TEMPLATE
from templates.compress import _COMPRESS_TEMPLATE
from templates.emojize import _EMOJIZE_TEMPLATE
from templates.emotion import _EMOTION_TEMPLATE
from templates.excerpt import _EXCERPT_TEMPLATE
from templates.explain import _EXPLAIN_TEMPLATE
from templates.highlight import _HIGHLIGHT_TEMPLATE
from templates.qa import _QA_TEMPLATE
from templates.location import _LOCATION_TEMPLATE
from templates.rephrase import _REPHRASE_TEMPLATE
from templates.summarize import _SUMMARIZE_TEMPLATE
from templates.translate import _TRANSLATE_TEMPLATE
from templates.triples import _TRIPLES_EXTRACTION_TEMPLATE

enc = tiktoken.get_encoding("cl100k_base")

origins = [
    "http://localhost:3000",
]
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def verify_context_size(context, min_tokens=1, max_tokens=1000):
    if context == None:
        raise HTTPException(
            status_code=400, 
            detail=f"Min tokens number is {max_tokens}, no token  have been sent."
        )
    if len(enc.encode(context)) < min_tokens:
        raise HTTPException(
            status_code=400, 
            detail=f"Min tokens number is {min_tokens}, no token  have been sent."
        )
    if len(enc.encode(context)) > max_tokens:
        raise HTTPException(
            status_code=413, 
            detail=f"Max tokens limit is {max_tokens}, {len(enc.encode(context))} tokens  have been sent."
        )

""" Basic chat with ChatGPT using a context """
class ChatBot(BaseModel):
    question: str
    context: Optional[str]
@app.post("/chat")
def ask_chatbot(item: ChatBot):
    if item.context == None:
        template = _CHATBOT_TEMPLATE_NO_CONTEXT
    else:
        verify_context_size(item.context)
        template = _CHATBOT_TEMPLATE if item.context != "" else _CHATBOT_TEMPLATE_NO_CONTEXT 
    return request_GPT(template.format(context=item.context, question=item.question))  

""" Basic chat with ChatGPT using a context """
class Compress(BaseModel):
    context: str
@app.post("/compress")
def compress(item: Compress):
    verify_context_size(item.context, max_tokens=1000)
    return request_GPT(_COMPRESS_TEMPLATE.format(context=item.context), max_tokens=500)  

""" Basic chat with ChatGPT using a context """
class Emojize(BaseModel):
    triples: str
@app.post("/emojize")
def emojize(item: Emojize):
    verify_context_size(item.triples, max_tokens=1000)
    return request_GPT(_EMOJIZE_TEMPLATE.format(context=item.triples), max_tokens=500)  

""" Quote and explain most important sentence of a context"""
class Highlight(BaseModel):
    context: str
@app.post("/highlight")
def highlight(item: Highlight):
    verify_context_size(item.context)
    return request_GPT(_HIGHLIGHT_TEMPLATE.format(context=item.context))

""" Generate Question/Answer from a context """
class QA(BaseModel):
    context: str
    number: int
@app.post("/generate_qa")
def generate_qa(item: QA):
    verify_context_size(item.context)
    return request_GPT( _QA_TEMPLATE.format(context=item.context, number=item.number))  

""" Rephrase a context in simpler style """
class Rephrase(BaseModel):
    context: str
@app.post("/rephrase")
def rephrase(item: Rephrase):
    verify_context_size(item.context)
    return request_GPT(_REPHRASE_TEMPLATE.format(context=item.context))

""" Summarize a book context """
class Summarize(BaseModel):
    context: str
    title: str
    author: str
@app.post("/summarize")
def rephrase(item: Summarize):
    verify_context_size(item.context)
    return request_GPT(_SUMMARIZE_TEMPLATE.format(context=item.context, title=item.title, author=item.author))

""" Translate a context """
class Translate(BaseModel):
    context: str
    language: str
@app.post("/translate")
def rephrase(item: Translate):
    verify_context_size(item.context)
    return request_GPT(
        _TRANSLATE_TEMPLATE.format(context=item.context, language=item.language), 
        max_tokens=1000
    )  

""" Generate triples from a context """
class Triples(BaseModel):
    context: str
    number: int
@app.post("/generate_triples")
def generate_triples(item: Triples):
    verify_context_size(item.context)
    return request_GPT(_TRIPLES_EXTRACTION_TEMPLATE.format(context=item.context, number=item.number))

class Emotion(BaseModel):
    context: str
@app.post("/emotionColor")
def ask_chatbot(item: Emotion):
    verify_context_size(item.context)
    
    emotions_to_colors = {
        "neutral":"lightgrey",
        "love": "lightpink",
        "contentment": "lightgreen",
        "joy": "lightyellow",
        "pleasure": "lightpurple",
        "disgust": "brown",
        "fear": "black",
        "sadness": "lightblue",
    }
    emotions = list(emotions_to_colors.keys())

    response = request_GPT(_EMOTION_TEMPLATE.format(context=item.context, emotions=emotions), max_tokens=15)
    
    if(response["response"] not in emotions):
        return {"response": "lightgrey"}

    return {"response": emotions_to_colors[response["response"]]}

""" Extract context meaningful excerpts"""
class Exerpt(BaseModel):
    context: str
@app.post("/excerpt")
def excerpt(item: Exerpt):
    verify_context_size(item.context)
    return request_GPT(_EXCERPT_TEMPLATE.format(context=item.context))

""" Explain a sentence based on a context """
class Explain(BaseModel):
    context: str
    sentence: str
@app.post("/explain")
def explain(item: Explain):
    verify_context_size(item.context)
    return request_GPT(_EXPLAIN_TEMPLATE.format(context=item.context, sentence=item.sentence))

""" Extract location of the context """
class Location(BaseModel):
    context: str
@app.post("/location")
def location(item: Location):
    verify_context_size(item.context)

    prompt = request_GPT(_LOCATION_TEMPLATE.format(context=item.context))["response"]
    if(prompt == "none"):
        return {"response": None}
    return request_dreamstudio(prompt)