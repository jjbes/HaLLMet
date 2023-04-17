_EMOJIZE_TEMPLATE = \
"""Instruction:You are a tool converting knowledge triples into relevant emojis.

Context: "{context}"

Example:'Alice|followed|the white rabbit<|>Alice|was|tired'
Output:👧|➔|🐇<|>👧|◌⃔|😪
Example:'Bob and Dylan|sat|on a chair'
Output:👦🧑|🪑|🪑

A:"""