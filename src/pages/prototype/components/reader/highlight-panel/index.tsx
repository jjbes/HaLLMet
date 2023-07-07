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
const HighlightPanel = ({
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
        <>
            <div className='relative h-[3.5rem] text-sm text-end bg-slate-50 p-4 flex justify-between'>
                <h1 className='font-bold'>Highlights</h1>
                <div>
                    Accuracy: {  
                        sectionAccuracies[sectionCanonical]?.total ?
                        (
                            sectionAccuracies[sectionCanonical].correct/
                            sectionAccuracies[sectionCanonical].total
                        ).toPrecision(2) :
                        (0).toPrecision(2)
                    }
                </div>
            </div>
            <div className="h-[calc(100%-3.5rem)] w-full overflow-auto px-4 pb-4">
                { 
                    Object.entries(highlights[sectionCanonical]).map((element: any) => {
                        const index = parseInt(element[0])

                        if(!Object.entries(element[1]).length && isLoadingBatch){
                            return <HighlightCardLoader 
                                key={`card-loader-${sectionCanonical}-${index}`}
                                index={index}/>
                        }
                        //TODO:
                        //- Differenciate API error from model error (Only API should be displayed)
                        if(!Object.entries(element[1]).length && !isLoadingBatch){
                            return <HighlightCardError
                                key={`card-error-${sectionCanonical}-${index}`}
                                index={index}
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
        </>
    )
}

export default HighlightPanel