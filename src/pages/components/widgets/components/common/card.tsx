import React, { ReactNode } from 'react'

type CardProps = {
    title:string
    content:ReactNode 
}
export default ({ title, content }: CardProps) => { 
    return (
        <div className="w-1/2 px-2 h-full">
        <div className="h-full py-2">
            <div className="h-1/12 bg-blue-500 text-white text-xs font-bold rounded-t px-2 py-1">
                {title}
            </div>
            <div className='h-11/12'>
                {content}
            </div>
        </div>
    </div>
    )
}