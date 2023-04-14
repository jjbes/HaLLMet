_TRIPLES_EXTRACTION_TEMPLATE = \
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