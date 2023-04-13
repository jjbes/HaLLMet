from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from pydantic import BaseModel
from dotenv import dotenv_values
import tiktoken
import openai

config = dotenv_values(".env")
openai.api_key = config["OPENAI_KEY"]
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

class Translate(BaseModel):
    context: str
    language: str

class ChatBot(BaseModel):
    question: str
    context: Optional[str]

class Question(BaseModel):
    context: str
    number: int

class Triplet(BaseModel):
    context: str
    number: int

class Rephrase(BaseModel):
    context: str

class Highlight(BaseModel):
    context: str

class Summarize(BaseModel):
    context: str
    title: str
    author: str

def request_GPT(content, max_tokens=300):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        temperature=0,
        max_tokens=max_tokens,
        messages=[{"role": "system", "content":content}],
    )    
    return {"response": response["choices"][0]["message"]['content']}

""" Translate """
@app.post("/translate")
def rephrase(item: Translate):

    if len(enc.encode(item.context)) > 1000:
        return {"response": "Error: Max tokens limit"}

    _TRANSLATE_TEMPLATE = \
    """Instruction: Translate in {language}
    
    Context: '{context}'

    A:"""

    return request_GPT(
        _TRANSLATE_TEMPLATE.format(context=item.context, language=item.language), 
        max_tokens=1000
    )  

""" Basic chat with ChatGPT with optional context """
@app.post("/chat")
def ask_chatbot(item: ChatBot):

    if len(enc.encode(item.context)) > 1000:
        return {"response": "Error: Max tokens limit"}
        
    _CHATBOT_TEMPLATE_NO_CONTEXT = \
    """Instruction: Answer the question.
    Instruction: Reply in the question language.

    Question: "{question}"

    A:"""

    _CHATBOT_TEMPLATE = \
    """Instruction: Answer the question in the question language using the following context."
    Instruction: Reply in the question language.

    Context: "{context}"

    Question: "{question}"

    A:"""

    template = _CHATBOT_TEMPLATE if item.context != "" else _CHATBOT_TEMPLATE_NO_CONTEXT 
    return request_GPT(template.format(context=item.context, question=item.question))  

""" Generate Question/Answer out of a context """
@app.post("/generate_qa")
def generate_qa(item: Question):

    if len(enc.encode(item.context)) > 1000:
        return {"response": "Error: Max tokens limit"}

    _QA_TEMPLATE = \
        """Instruction: You are a tool designed to extract {number} questions that you can answer using the context.
        Format: question|answer<|>question|answer<|>question|answer

        EXAMPLE:'We met next day as he had arranged, and inspected the rooms at No. 221B, Baker Street, of which he had spoken at our meeting'
        Output: Where did they meet the next day?|They met at No. 221B, Baker Street.<|>What did they do when they met the next day?|They inspected the rooms at No. 221B, Baker Street<|>What is the address of the rooms they inspected?|No. 221B, Baker Street
        EXAMPLE:'Le lendemain, Laurent s'éveilla frais et dispos. Il avait bien dormi. L'air froid qui entrait par la fenêtre fouettait son sang alourdi. Il se rappelait à peine les scènes de la veille; sans la cuisson ardente qui le brûlait au cou, il aurait pu croire qu'il s'était couché à dix heures, après une soirée calme. La morsure de Camille était comme un fer rouge posé sur sa peau; lorsque sa pensée se fut arrêtée sur la douleur que lui causait cette entaille, il en souffrit cruellement. Il lui semblait qu'une douzaine d'aiguilles pénétraient peu à peu dans sa chair. Il rabattit le col de sa chemise et regarda la plaie dans un méchant miroir de quinze sous accroché au mur. Cette plaie faisait un trou rouge, large comme une pièce de deux sous; la peau avait été arrachée, la chair se montrait, rosâtre, avec des taches noires; des filets de sang avaient coulé jusqu'à l'épaule, en minces traînées qui s'écaillaient. Sur le cou blanc, la morsure paraissait d'un brun sourd et puissant; elle se trouvait à droite, au-dessous de l'oreille. Laurent, le dos courbé, le cou tendu, regardait, et le miroir verdâtre donnait à sa face une grimace atroce.'
        Output: Comment Laurent se sentait-il le lendemain matin ?|Le lendemain, Laurent s'éveilla frais et dispos. Il avait bien dormi.<|>Comment était l'air qui entrait par la fenêtre ?|L'air qui entrait par la fenêtre était froid et fouettait le sang alourdi de Laurent.<|>Comment Laurent décrivait-il la morsure de Camille ?|Laurent décrivait la morsure de Camille comme une cuisson ardente qui le brûlait au cou, comme un fer rouge posé sur sa peau, et comme une douzaine d'aiguilles pénétrant peu à peu dans sa chair.<|>Comment Laurent a-t-il examiné sa plaie ?|Laurent a rabattu le col de sa chemise et a regardé la plaie dans un miroir accroché au mur.

        Context: '{context}'

        A:"""

    return request_GPT( _QA_TEMPLATE.format(context=item.context, number=item.number))  

""" Generate triplet out of a context """
@app.post("/generate_triplet")
def generate_triplet(item: Triplet):

    if len(enc.encode(item.context)) > 1000:
        return {"response": "Error: Max tokens limit"}

    _KNOWLEDGE_TRIPLE_EXTRACTION_TEMPLATE = \
        """Instruction: You are a tool extracting knowledge triples of relevant entities. A knowledge triple is a clause that contains a subject, a predicate, and an object. The subject is the entity being described, the predicate is the property of the subject that is being described, and the object is the value of the property. Use same entities name when they are the same.
        Instruction: Extract {number} triplet using the context.

        EXAMPLE:'We met next day as he had arranged, and inspected the rooms at No. 221B.'
        Output: We|met|next day<|>He|had|arranged<|>We|inspected|221B
        EXAMPLE:'Le lendemain, Laurent s'éveilla frais et dispos. Il avait bien dormi.'
        Output: Laurent|s'éveilla|frais et dispos<|>Laurent|avait|bien dormi
        EXAMPLE:'本は紙でできている'
        Output:本|でできている|紙

        Context: '{context}'

        A:"""
 
    return request_GPT(_KNOWLEDGE_TRIPLE_EXTRACTION_TEMPLATE.format(context=item.context, number=item.number))

""" Rephrase with simpler style """
@app.post("/rephrase")
def rephrase(item: Rephrase):

    if len(enc.encode(item.context)) > 1000:
        return {"response": "Error: Max tokens limit"}

    _REPHRASE_TEMPLATE = \
    """Instruction: You are a tool designed to rephrase with simpler terms the following context.
    
    Context: '{context}'

    A:"""

    return request_GPT(_REPHRASE_TEMPLATE.format(context=item.context))

""" Quote and explain most important sentence"""
@app.post("/highlight")
def rephrase(item: Highlight):

    if len(enc.encode(item.context)) > 1000:
        return {"response": "Error: Max tokens limit"}

    _HIGHLIGHT_TEMPLATE = \
    """Instruction: You are a tool designed to highlight and describe the most meaningful sentence of the context.
    
    EXAMPLE:'In the year 1878 I took my degree of Doctor of Medicine of  University of London, and proceeded to Netley to go through the course prescribed for surgeons in the army.'
    Output:In the year 1878 I took my degree of Doctor of Medicine of University of London|This sentence highlights the author's academic achievement of obtaining a degree in medicine from the University of London.
    EXAMPLE:'Advice From A Caterpillar At last the Caterpillar took the hookah out of its mouth and addressed Alice in alanguid, sleepy voice."Who are you?" said the Caterpillar. Alice replied, rather shyly, "I—I hardly know, sir, just at present—at least I know'
    Output:I—I hardly know, sir, just at present—at least I know|This sentence shows Alice's uncertainty about her identity. explanation: Alice's response to the Caterpillar's question highlights her confusion and uncertainty about her own identity. This is a recurring theme throughout the book, as Alice struggles to understand who she is and where she fits in the world.

    Context: '{context}'

    A:"""
  
    return request_GPT(_HIGHLIGHT_TEMPLATE.format(context=item.context))

""" Summarize """
@app.post("/summarize")
def rephrase(item: Summarize):

    if len(enc.encode(item.context)) > 1000:
        return {"response": "Error: Max tokens limit"}

    _SUMMARIZE_PROMPT =\
    """Instruction: Summarize the book '{title}' by {author} based on the following context.
    
    Context: '{context}'

    A:"""

    return request_GPT(_SUMMARIZE_PROMPT.format(context=item.context, title=item.title, author=item.author))