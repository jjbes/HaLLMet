import React from 'react'
import Contextualization from './components/contextualization'
import Quote from './components/quote'
import TextLoader from './components/text-loader'

type HighlightProps = {
    sectionCanonical:string
    highlights:{ [key: string]: any }
    highlightedCfi:string|null
    setHighlightedCfi:Function
    isLoading:boolean
    retryHighlight:Function
}
export default ({sectionCanonical, highlights, highlightedCfi, setHighlightedCfi, isLoading, retryHighlight}: HighlightProps) => {
    if (!sectionCanonical) return <></>
    if (!(sectionCanonical in highlights)) return <></>

    //TODO: 
    //- Refactor highlight card as component
    //- Prompts

    const panelContent: any = []

    Object.entries(highlights[sectionCanonical]).forEach((element: any) => {
        const index = parseInt(element[0])
        const currentHighlights = Object.entries(element[1]).map((element: any) => element[1].content)
        
        panelContent.push(
            <p 
            key={`title-${sectionCanonical}-${element}`}
            id={`page-${index+1}`}
            className={`${!index?"":"mt-10"} text-2xl bold font-serif text-left text-blue-500`}>
                {index+1+"."}
            </p>
        )
        
        if(!Object.entries(element[1]).length && isLoading){
            panelContent.push(
                <div className={`relative h-full p-4 text-center text-gray-700 bg-white border-l-4 border-l-blue-500 cursor-pointer`}>
                    <TextLoader/>
                </div>
            )
            return
        }

        if(!Object.entries(element[1]).length && !isLoading){
            panelContent.push(
                <div 
                    className={`relative h-full p-4 text-center text-gray-700 bg-white border-l-4 border-l-blue-500 cursor-pointer`}
                    onClick={()=>{retryHighlight(index)}}>
                    <p className="text-base text-left text-red-700">
                        An error occured, click to retry
                    </p>
                </div>
            )
            return
        }

        if(Object.entries(element[1]).length){
            panelContent.push(
                <Contextualization 
                    key={`contextualization-${sectionCanonical}-${index}`}
                    section={sectionCanonical}
                    index={index}
                    context={element[1].context}
                    highlights={currentHighlights}
                />
            )
            Object.entries(element[1]).forEach((element: any) => {
                if(element[0]=="context") return
                panelContent.push(
                    <Quote 
                        key={`quote-${sectionCanonical}-${element[1].href}`}
                        content={element[1].content}
                        href={element[1].href}
                        highlightedCfi={highlightedCfi}
                        setHighlightedCfi={setHighlightedCfi} />
                )
            })
        }
    })

    return (
        <div className="max-h-full w-full overflow-auto p-4 pr-6">
            { panelContent }
        </div>
    )
}