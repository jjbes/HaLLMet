import React, { useState, useEffect, useRef } from 'react'

import Explanation from './components/prototype/explanation'
import EpubReader from './components/prototype/epub-reader'
import Emotion from './components/prototype/emotion'

export default () => {
    const [pageContent, setPageContent] = useState<string|null>()
    const [context, setContext] = useState<string|null>(null)
    const [selectedExcerpt, setExcerpt] = useState<string|null>(null)
    const currentLocation = useRef<any>(null)

    //Handle context
    useEffect(() => {      
        if(pageContent){
            setContext(pageContent.trim())
        }
    }, [pageContent])

    return (
        <>
        <Emotion currentPage={currentLocation.current ? currentLocation.current.page : null} context={context}/>
        <div className="h-full flex justify-center ">
            <div className="w-2/4 px-4 pt-4 text-center text-gray-700">
                <EpubReader 
                    setPageContent={setPageContent} 
                    currentLocation={currentLocation}
                    setExcerpt={setExcerpt}
                />
            </div>
            <Explanation context={context} excerpt={selectedExcerpt} setExcerpt={setExcerpt} currentSection={currentLocation.current ? currentLocation.current.section : null}/>
            
        </div>
        </>
        
    )
}
