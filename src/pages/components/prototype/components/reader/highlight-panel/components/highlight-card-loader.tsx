import React from 'react'
import QuoteLoader from './highlight-card/loaders/quote-loader'
import TitleLoader from './highlight-card/loaders/title-loader'

type HighlightCardProps = {
    index:number
}
export default ({
    index,
}: HighlightCardProps) => {
    return (
        <div 
        key={`highlight-loader-${index}`}
        className={`${!index?"":"mt-10"} relative p-4 bg-white`}>
            <TitleLoader/>
            {
                Array(3).fill(0).map((_, quote_i) => 
                    <div 
                    key={quote_i}
                    className='mt-4'>
                        <QuoteLoader/>
                    </div>
                )
            }
        </div>
    )
}
