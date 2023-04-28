import React from 'react';
import { useTransition, animated } from '@react-spring/web';

type DefaultBackgroundProps = {
    color: string|null
}
export default ({ color }: DefaultBackgroundProps) => {
    const transitions = useTransition(color, {
        from: { opacity: 0 },
        enter: { opacity: 1 },
        leave: { opacity: 0 },
        config: { duration: 5000 },
    })
    return (
        <>
            {
                transitions((style, _) => (
                    <animated.div
                        className="-z-50 absolute h-full w-full top-0 left-0 bg-gray" 
                        style={{
                            ...style
                        }}
                    />
                ))
            }
        </>
    )
}