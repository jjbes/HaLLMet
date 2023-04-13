import React from 'react'

type AlertProps = {
    content:string
}
export default ({content}: AlertProps) => {
    return(
        <div className="h-full w-full text-xs bg-white text-gray-700 p-8 flex items-center justify-center text-center overflow-y-auto">
            <p>{content}</p>
        </div>
    )
}