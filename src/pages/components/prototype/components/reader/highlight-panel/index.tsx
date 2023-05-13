import React from 'react'
import Contextualization from './components/contextualization'
import Quote from './components/quote'


type HighlightProps = {
    section:string
    sectionContexts:Object
    highlights:Object
    highlightedCfi:string|null
    setHighlightedCfi:Function
}
export default ({section, sectionContexts, highlights, highlightedCfi, setHighlightedCfi}: HighlightProps) => {
    if (!section) return <></>
    if (!highlights) return <></>

    const compare = (a:any, b:any) => {
        if( a[1].index < b[1].index ) {
          return -1
        } else if( a[1].index > b[1].index ) {
          return 1
        } 
        return 0
    }
    
    //TODO:
    //- Do highlight request here instead of in the reader
    //- Fix server error handling

    const highlightsSection = Object.fromEntries(Object.entries(highlights).filter(entry => entry[1].section == section))
    const highlightsSorted = Object.fromEntries(Object.entries(highlightsSection).sort(compare))

    const panelContent: any = []
    let currentIndex = -1
    Object.keys(highlightsSorted).map((key: string, i: number) => {
        const index = highlightsSorted[key]["index"]
        if(index != currentIndex){
            const currentHighlights = Object.fromEntries(
                Object.entries(highlightsSorted).filter(entry => {
                    return (entry[1].section == section && entry[1].index==index)
                })
            )
            panelContent.push(
                <p 
                key={`title-${index}`}
                className={`${!index?"":"mt-10"} text-2xl bold font-serif text-left text-blue-500`}>
                    {index+1+"."}
                </p>
            )
            panelContent.push(
                <Contextualization 
                    key={`contextualization-${index}`}
                    section={section}
                    index={index}
                    context={sectionContexts[section][index]}
                    highlights={currentHighlights}
                />
            )
            currentIndex = index
        }
        panelContent.push(<Quote key={`quote-${i}`}
            content={highlightsSorted[key]["content"]}
            href={highlightsSorted[key]["href"]}
            highlightedCfi={highlightedCfi}
            setHighlightedCfi={setHighlightedCfi} />)
    })

    return (
        <div className="max-h-full w-full overflow-auto p-4 pr-6">
            {
                panelContent
            }
        </div>
    )
}