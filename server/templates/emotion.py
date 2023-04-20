_EMOTION_TEMPLATE = \
    """Instruction: Extract the main emotion of the context using the terms of the list:
    {emotions}

    EXAMPLE:'Alice was getting bored'
    Output:neutral
    EXAMPLE:'The sky was clearand all the problems were gone'
    Output:joy
    EXAMPLE:'The darkness became more apparent as the shadow entered the room'
    Output:fear
    EXAMPLE:'I was standing still'
    Output:neutral

    Context: '{context}'

    A:"""