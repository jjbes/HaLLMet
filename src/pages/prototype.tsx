import React, { useState, useEffect, useRef } from 'react'

import Explanation from './components/prototype/explanation'
import EpubReader from './components/prototype/epub-reader'
import Emotion from './components/prototype/emotion'

export default () => {
    const [pageContent, setPageContent] = useState<string|null>()
    const [context, setContext] = useState<string|null>(null)
    const [explanation, setExplanation] = useState<string|null>(null)
    const currentPage = useRef<any>(null)
    
    //Handle context
    useEffect(() => {      
        if(pageContent){
            setContext(pageContent.trim())
        }
    }, [pageContent])

    return (
        <>
        <Emotion currentPage={currentPage.current} context={context}/>
        <div className="h-full flex justify-center ">
            <div className="w-2/4 p-4 text-center text-gray-700">
                <EpubReader 
                    setPageContent={setPageContent} 
                    currentPage={currentPage}
                    setExplanation={setExplanation}
                />
            </div>
            <Explanation context={context} excerpt={explanation} currentPage={currentPage.current}/>
            
        </div>
        </>
        
    )
}
