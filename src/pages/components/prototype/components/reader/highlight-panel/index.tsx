import React from 'react'
import Contextualization from './components/contextualization'
import Quote from './components/quote'


type HighlightProps = {
    section:string
    sectionContexts:{ [key: string]: any }
    highlights:{ [key: string]: any }
    highlightedCfi:string|null
    setHighlightedCfi:Function
}
export default ({section, sectionContexts, highlights, highlightedCfi, setHighlightedCfi}: HighlightProps) => {
    if (!section) return <></>
    if (!(section in highlights)) return <></>

    const panelContent: any = []

    Object.entries(highlights[section]).forEach((element: any) => {
        const index = parseInt(element[0])
        const currentHighlights = Object.entries(element[1]).map((element: any) => element[1].content)

        panelContent.push(
            <p 
            key={`title-${section}-${element}`}
            id={`page-${index+1}`}
            className={`${!index?"":"mt-10"} text-2xl bold font-serif text-left text-blue-500`}>
                {index+1+"."}
            </p>
        )
        panelContent.push(
            <Contextualization 
                key={`contextualization-${section}-${index}`}
                section={section}
                index={index}
                context={sectionContexts[section][index]}
                highlights={currentHighlights}
            />
        )
        Object.entries(element[1]).forEach((element: any) => {
            panelContent.push(
                <Quote 
                    key={`quote-${section}-${element[1].href}`}
                    content={element[1].content}
                    href={element[1].href}
                    highlightedCfi={highlightedCfi}
                    setHighlightedCfi={setHighlightedCfi} />
            )
        })
    })

    return (
        <div className="max-h-full w-full overflow-auto p-4 pr-6">
            { panelContent }
        </div>
    )
}