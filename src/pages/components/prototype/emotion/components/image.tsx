import React from 'react'
import { useTransition, animated } from '@react-spring/web'

type ImageBackgroundProps = {
    imageUrl: string|null
}
export default ({ imageUrl }: ImageBackgroundProps) => {
    const transitions = useTransition(imageUrl, {
        from: { opacity: 0 },
        enter: { opacity: 1 },
        leave: { opacity: 0 },
        config: { duration: 5000 },
    })
    return (
        <>
            {
                transitions((style, data) => (
                    <animated.div
                        className="-z-50 absolute h-full w-full top-0 left-0 bg-end bg-no-repeat bg-cover after:content-[''] after:absolute after:h-full after:w-full after:backdrop-blur" 
                        style={{
                            ...style,
                            backgroundImage: data ? `url(${data})`: 'none',
                        }}
                    />
                ))
            }
        </>
    )
}