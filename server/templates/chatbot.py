_CHATBOT_TEMPLATE_NO_CONTEXT = \
"""Instruction: Answer the question in the question language.

Question: "{question}"

A:"""

_CHATBOT_TEMPLATE = \
"""Instruction: Answer the question using the following context."
Instruction: Reply in the question language.

Context: "{context}"

Question: "{question}"

A:"""
