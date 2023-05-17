import React from 'react'
import TextLoader from './highlight-card/text-loader'
import QuoteLoader from './highlight-card/quote-loader'

type HighlightCardProps = {
    index:number,
    sectionCanonical: string, 
}
export default ({
    index,
    sectionCanonical,
}: HighlightCardProps) => {
    return (
        <>
            <p 
            key={`title-${sectionCanonical}-${index}`}
            id={`page-${index+1}`}
            className={`${!index?"":"mt-10"} text-2xl bold font-serif text-left text-blue-500`}>
                {index+1+"."}
            </p>
            <div 
                key={`loader-${sectionCanonical}-${index}`}
                className={`relative h-full p-4 text-center text-gray-700 bg-white border-l-4 border-l-blue-500`}>
                <div className='pb-4'>
                    <TextLoader/>
                </div>
                <div className='pt-4'>
                    <QuoteLoader/>
                </div>
            </div>
        </>
    )
}
