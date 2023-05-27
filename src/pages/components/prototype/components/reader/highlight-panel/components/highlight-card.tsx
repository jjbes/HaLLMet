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
    return (
        <>
            <p 
            key={`title-${sectionCanonical}-${index}`}
            id={`page-${index+1}`}
            className={`${!index?"":"mt-10"} text-2xl bold font-serif text-left text-slate-400`}>
                {index+1+"."} 
            </p>

            <div className={`relative h-full p-4 border-l-4 border-l-slate-400`}>
                <Title 
                    section={sectionCanonical}
                    index={index}
                    context={context}
                    sentence={Object.entries(highlights).map((element: any) => element[1].content).join('\n')}/>

                  
                <Contextualization 
                    key={`contextualization-${sectionCanonical}-${index}`}
                    section={sectionCanonical}
                    index={index}
                    context={context}
                    sentence={Object.entries(highlights).map((element: any) => element[1].content).join('\n')}/>
                
                {
                    
                    highlights.map((element: any) => {
                        return <Quote 
                            key={`quote-${sectionCanonical}-${element.href}`}
                            content={element.content}
                            href={element.href}
                            highlightedCfi={highlightedCfi}
                            setHighlightedCfi={setHighlightedCfi} />
                    })
                }
            </div>
        </>
    )
}
