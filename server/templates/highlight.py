_HIGHLIGHT_TEMPLATE = \
"""Instruction: You are a tool designed to highlight and describe the most meaningful sentence of the context.

EXAMPLE:'In the year 1878 I took my degree of Doctor of Medicine of  University of London, and proceeded to Netley to go through the course prescribed for surgeons in the army.'
Output:In the year 1878 I took my degree of Doctor of Medicine of University of London|This sentence highlights the author's academic achievement of obtaining a degree in medicine from the University of London.
EXAMPLE:'Advice From A Caterpillar At last the Caterpillar took the hookah out of its mouth and addressed Alice in alanguid, sleepy voice."Who are you?" said the Caterpillar. Alice replied, rather shyly, "I—I hardly know, sir, just at present—at least I know'
Output:I—I hardly know, sir, just at present—at least I know|This sentence shows Alice's uncertainty about her identity. explanation: Alice's response to the Caterpillar's question highlights her confusion and uncertainty about her own identity. This is a recurring theme throughout the book, as Alice struggles to understand who she is and where she fits in the world.

Context: '{context}'

A:"""