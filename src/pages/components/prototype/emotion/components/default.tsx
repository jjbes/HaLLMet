import React from 'react';

type DefaultBackgroundProps = {
    color: string|null
}
export default ({ color }: DefaultBackgroundProps) => {
    return (
        <div className="-z-50 absolute h-full w-full top-0 left-0 bg-gray" ></div>
    )
}