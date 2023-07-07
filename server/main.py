import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from pydantic import BaseModel
import tiktoken
import re

from models.chatgpt import request_GPT, request_DALLE

from templates.excerpt import _EXCERPT_TEMPLATE
from templates.explain import _EXPLAIN_TEMPLATE
from templates.title import _TITLE_TEMPLATE

enc = tiktoken.get_encoding("cl100k_base")

origins = [
    os.getenv("FRONTEND_URL"),
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
""" Extract context meaningful excerpts"""
class Exerpt(BaseModel):
    context: str
@app.post("/excerpt")
def excerpt(item: Exerpt):
    verify_context_size(item.context)
    return request_GPT(_EXCERPT_TEMPLATE.format(context=item.context))

""" Title extracts based on the context """
class Title(BaseModel):
    context: str
    sentence: str
@app.post("/title")
def explain(item: Title):
    verify_context_size(item.context)
    return request_GPT(_TITLE_TEMPLATE.format(context=item.context, sentences=item.sentence))

""" Explain a sentence based on a context """
class Explain(BaseModel):
    context: str
    sentence: str
@app.post("/explain")
def explain(item: Explain):
    verify_context_size(item.context)
    return request_GPT(_EXPLAIN_TEMPLATE.format(context=item.context, sentence=item.sentence), max_tokens=80)