import React from 'react'

type HighlightCardProps = {
    index:number
    retryHighlight:Function
}
export default ({
    index,
    retryHighlight
}: HighlightCardProps) => {
    return (
        <>
            <div 
            key={`highlight-error-${index}`}
            className={`${!index?"":"mt-10"} relative p-4 bg-white cursor-pointer`}
                onClick={()=>{retryHighlight(index)}}>
                <p className="text-base text-left text-red-700">
                    An error occured, click to retry
                </p>
            </div>
        </>
    )
}
