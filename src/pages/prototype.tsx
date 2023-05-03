import React, { useState, useEffect, useRef } from 'react'

import Explanation from './components/prototype/explanation'
import EpubReader from './components/prototype/epub-reader'
import Emotion from './components/prototype/emotion'

export default () => {
    const [highlightExcerpt, setHighlightExcerpt] = useState<string|null>(null)
    const [pageContent, setPageContent] = useState<string|null>()
    const [sectionContent, setSectionContent] = useState<string|null>()
    const [context, setContext] = useState<string|null>()
    const currentLocation = useRef<any>(null)

    useEffect(() => {
        if(true) {
            setContext(sectionContent)
        }else
        if(false) {
            setContext(pageContent)
        }
    }, [pageContent, sectionContent])

    return (
        <>
        <Emotion currentPage={currentLocation.current ? currentLocation.current.page : null} context={pageContent?pageContent:null}/>
        <div className="h-full flex justify-center ">
            <div className="w-2/4 px-4 pt-4 text-center text-gray-700">
                <EpubReader 
                    setHighlightExcerpt={setHighlightExcerpt}
                    setPageContent={setPageContent} 
                    setSectionContent={setSectionContent}
                    currentLocation={currentLocation}
                />
            </div>
            <Explanation context={context?context:''} excerpt={highlightExcerpt} setExcerpt={setHighlightExcerpt} currentSection={currentLocation.current ? currentLocation.current.section : null}/>       
        </div>
        </>
        
    )
}
