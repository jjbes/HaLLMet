_LOCATION_TEMPLATE = \
"""Instruction: Extract the main location of the context and mood if location exists, reply none if no location

EXAMPLE:'Alice was getting bored'
Output:none
EXAMPLE:'The daisy-field was clearand all the problems were gone'
Output:a clear daisy-field
EXAMPLE:'The darkness became more apparent as the shadow entered the room'
Output:dark room with shadow
EXAMPLE:'I was standing still'
Output:none

Context: '{context}'

A:"""