import React from 'react'

type HighlightCardProps = {
    index:number,
    sectionCanonical: string, 
    retryHighlight:Function
}
export default ({
    index,
    sectionCanonical,
    retryHighlight
}: HighlightCardProps) => {
    return (
        <>
            <p 
                key={`title-${sectionCanonical}-${index}`}
                id={`page-${index+1}`}
                className={`${!index?"":"mt-10"} text-2xl bold font-serif text-left text-slate-400`}>
                {index+1+"."}
            </p>

            <div 
                className={`relative h-full p-4 bg-white border-l-4 border-l-slate-400 cursor-pointer`}
                onClick={()=>{retryHighlight(index)}}>
                <p className="text-base text-left text-red-700">
                    An error occured, click to retry
                </p>
            </div>
        </>
    )
}
