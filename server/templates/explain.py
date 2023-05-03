_EXPLAIN_TEMPLATE = \
"""Instruction: You are a tool designed to explain why the excerpt is important based on the following context.

EXAMPLE:'In the year 1878 I took my degree of Doctor of Medicine of University of London.'
Output:This sentence explains the qualification of the narrator and foreshadow the character ability.
EXAMPLE:'I—I hardly know, sir, just at present—at least I know'
Output:This sentence shows Alice's uncertainty about her identity. Her response to the Caterpillar's question highlights her confusion and uncertainty about her own identity. This is a recurring theme throughout the book, as Alice struggles to understand who she is and where she fits in the world.

Context: '{context}'

Sentence: '{sentence}'

A:"""