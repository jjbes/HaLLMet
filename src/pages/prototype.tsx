import React, { useState, useRef } from 'react'

import EpubReader from './components/prototype/epub-reader'
import Emotion from './components/prototype/emotion'

export default () => {
    const [pageContent, setPageContent] = useState<string|null>()
    const currentLocation = useRef<any>(null)

    return (
        <>
        <Emotion currentPage={currentLocation.current ? currentLocation.current.page : null} context={pageContent?pageContent:''}/>
        <div className="h-full flex justify-center ">
            <div className="w-3/4 px-4 pt-4 text-center text-gray-700">
                <EpubReader 
                    setPageContent={setPageContent} 
                    currentLocation={currentLocation}
                />
            </div>
        </div>
        </>
        
    )
}
