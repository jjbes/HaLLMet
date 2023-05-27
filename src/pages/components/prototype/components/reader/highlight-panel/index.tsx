import React from 'react'
import HighlightCard from './components/highlight-card'
import HighlightCardLoader from './components/highlight-card-loader'
import HighlightCardError from './components/highlight-card-error'

type HighlightProps = {
    sectionCanonical:string
    highlights:{ [key: string]: any }
    highlightedCfi:string|null
    setHighlightedCfi:Function
    isLoadingBatch:boolean
    isLoadingMoreBatch:boolean
    retryHighlight:Function
    sectionAccuracies:any
}
export default ({
    sectionCanonical, 
    highlights,
    highlightedCfi, 
    setHighlightedCfi, 
    isLoadingBatch, 
    isLoadingMoreBatch, 
    retryHighlight,
    sectionAccuracies
}: HighlightProps) => {
    if (!sectionCanonical) return <></>
    if (!(sectionCanonical in highlights)) return <></>

    //TODO: 
    //- Prompts
    return (
        <div className="max-h-full w-full overflow-auto pl-4 pb-4 pr-6">
            <div className='sticky top-0 text-sm text-end bg-slate-50 z-50 pt-4 pb-4'>
                Highlights accuracy: {  
                    sectionAccuracies[sectionCanonical]?.total ?
                    (
                        sectionAccuracies[sectionCanonical].correct/
                        sectionAccuracies[sectionCanonical].total
                    ).toPrecision(2) :
                    (0).toPrecision(2)
                }
            </div>
            { 
                Object.entries(highlights[sectionCanonical]).map((element: any) => {
                    const index = parseInt(element[0])

                    if(!Object.entries(element[1]).length && isLoadingBatch){
                        return <HighlightCardLoader 
                            key={`card-loader-${sectionCanonical}-${index}`}
                            index={index} 
                            sectionCanonical={sectionCanonical}/>
                    }
                    //TODO:
                    //- Differenciate API error from model error (Only API should be displayed)
                    if(!Object.entries(element[1]).length && !isLoadingBatch){
                        return <HighlightCardError
                            key={`card-error-${sectionCanonical}-${index}`}
                            index={index} 
                            sectionCanonical={sectionCanonical}
                            retryHighlight={retryHighlight}/>
                    }

                    const context = element[1]?.context
                    const highlights = Object.entries(element[1].highlights)
                        .filter((element: any) => Object.entries(element[1]).length)
                        .map((element:any)=>element[1])
                    
                    if(!highlights.length && !isLoadingBatch) return <></>

                    return <HighlightCard 
                                key={`card-${sectionCanonical}-${index}`}
                                highlights={highlights}
                                context={context} 
                                index={index}
                                sectionCanonical={sectionCanonical}
                                highlightedCfi={highlightedCfi}
                                setHighlightedCfi={setHighlightedCfi}/>     
                }) 
            }
            { isLoadingMoreBatch ? <div className='p-4'>...</div> : <></> }
        </div>
    )
}