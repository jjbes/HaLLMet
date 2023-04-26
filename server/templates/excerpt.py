_EXCERPT_TEMPLATE = \
"""Instruction: You are a tool designed to extract a few meaningful excerpts of the context. Keep excerpts the same as the original sentence.

EXAMPLE:'In the year 1878 I took my degree of Doctor of Medicine of  University of London, and proceeded to Netley to go through the course prescribed for surgeons in the army.'
Output:In the year 1878 I took my degree of Doctor of Medicine of University of London|proceeded to Netley to go through the course prescribed for surgeons in the army.
EXAMPLE:'Advice From A Caterpillar At last the Caterpillar took the hookah out of its mouth and addressed Alice in alanguid, sleepy voice."Who are you?" said the Caterpillar. Alice replied, rather shyly, "I—I hardly know, sir, just at present—at least I know'
Output:I—I hardly know, sir, just at present—at least I know|the Caterpillar took the hookah out of its mouth

Context: '{context}'

A:"""