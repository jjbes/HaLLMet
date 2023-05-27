import React from 'react'
import TextLoader from './highlight-card/text-loader'
import QuoteLoader from './highlight-card/quote-loader'
import TitleLoader from './highlight-card/title-loader'

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
            className={`${!index?"":"mt-10"} text-2xl bold font-serif text-left text-slate-400`}>
                {index+1+"."}
            </p>
            <div 
                className='relative h-full p-4 border-l-4 border-l-slate-400'>
                <div className='mb-4'>
                    <TitleLoader/>
                </div>
                
                <div className='mb-4'>
                    <TextLoader/>
                </div>
                
                <div>
                    <QuoteLoader/>
                </div>
            </div>
        </>
    )
}
