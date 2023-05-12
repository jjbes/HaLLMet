_EXCERPT_TEMPLATE = \
"""Instruction: The following is a conversation between a user and a language model.

User: Extract excerpts from the specified context that are important excerpts for comprehension of the context
User: Extracted excerpt should be identical to the context, keep special characters the sames.
User: Try to keep the extracted excerpt short if possible.

Example:I am a sentence with a specific interesting content inside. This sample is meant to show how the feature is supposed to work to the mode. "This is important". The sentence is long for the model to understand excerpts do not have to be the same size as the sentence. Also this one is important.
Output:1. I am a sentence with a specific interesting content inside.\n2. "This is important"\n3. Also this one is important.

Context: {context}

3 excerpts:"""