import React from 'react'

type TextOnlyProps = {
    content:string
}
export default ({content}: TextOnlyProps) => {
    return(
        <div className="h-full w-full text-sm bg-white text-gray-700 p-6 text-left leading-6 overflow-y-auto">
            <p>{content}</p>
        </div>
    )
}