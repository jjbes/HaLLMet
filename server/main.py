from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from pydantic import BaseModel
import tiktoken

from models.chatgpt import request_GPT 

from templates.chatbot import _CHATBOT_TEMPLATE_NO_CONTEXT, _CHATBOT_TEMPLATE
from templates.compress import _COMPRESS_TEMPLATE
from templates.emojize import _EMOJIZE_TEMPLATE
from templates.highlight import _HIGHLIGHT_TEMPLATE
from templates.qa import _QA_TEMPLATE
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

def verify_context_size(context, max_tokens=1000):
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
    verify_context_size(item.context)
    template = _CHATBOT_TEMPLATE if item.context != "" else _CHATBOT_TEMPLATE_NO_CONTEXT 
    return request_GPT(template.format(context=item.context, question=item.question))  

""" Basic chat with ChatGPT using a context """
class Compress(BaseModel):
    context: str
@app.post("/compress")
async def compress(item: Compress):
    verify_context_size(item.context, max_tokens=1000)
    return request_GPT(_COMPRESS_TEMPLATE.format(context=item.context), max_tokens=500)  

""" Basic chat with ChatGPT using a context """
class Emojize(BaseModel):
    triples: str
@app.post("/emojize")
async def compress(item: Emojize):
    verify_context_size(item.triples, max_tokens=1000)
    return request_GPT(_EMOJIZE_TEMPLATE.format(context=item.triples), max_tokens=500)  

""" Quote and explain most important sentence of a context"""
class Highlight(BaseModel):
    context: str
@app.post("/highlight")
def rephrase(item: Highlight):
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