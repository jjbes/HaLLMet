import React from 'react'
import Contextualization from './highlight-card/contextualization'
import Quote from './highlight-card/quote'
import Title from './highlight-card/title'

type HighlightCardProps = {
    highlights: any[],
    context:string,
    index:number,
    sectionCanonical: string, 
    highlightedCfi:string|null,
    setHighlightedCfi:Function,
}
export default ({
    highlights,
    context,
    index,
    sectionCanonical,
    highlightedCfi,
    setHighlightedCfi,
}: HighlightCardProps) => {

    const highlightEvent = (cfiRange: string) => {
        setHighlightedCfi(cfiRange)
    }

    return (
        <>
            <div 
            key={`highlight-${index}`}
            className={`${!index?"":"mt-10"} relative p-4 bg-white`}>
                <Title 
                section={sectionCanonical}
                index={index}
                context={context}
                sentence={Object.entries(highlights).map((element: any) => element[1].content).join('\n')}/>

                {
                    
                    highlights.map((element: any, hl_index:number) => {
                        return (
                            <div 
                            key={hl_index}
                            id={element.href}
                            className={`p-4 border-l-4 ${element.href==highlightedCfi?"border-yellow-300 bg-yellow-50":"border-slate-200 bg-slate-50"} cursor-pointer mt-4`}
                            onClick={()=>{highlightEvent(element.href)}}>
                                <div className={"font-medium"}>
                                    <Quote 
                                    content={element.content}
                                    href={element.href} />
                                </div>
                                
                                <Contextualization 
                                    section={sectionCanonical}
                                    index={element.href}
                                    context={context}
                                    sentence={element.content}/>
                            </div>
                        )
                    })
                }
            </div>
        </>
    )
}
