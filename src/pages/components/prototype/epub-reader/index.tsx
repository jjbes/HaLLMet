import React, { MutableRefObject, useState } from 'react'
import Reader from './components/reader'
import Uploader from './components/uploader'

type EpubHighLightProps = {
    currentLocation: MutableRefObject<any>
    setPageContent:Function
    setSectionContent:Function
    setHighlightExcerpt:Function
}
export default ({ currentLocation, setPageContent, setSectionContent, setHighlightExcerpt}: EpubHighLightProps) => {
    const [file, setFile] = useState()

    function handleChange(event: any) {
        setFile(event.target.files[0])
    }

    return (
    <>
        {
            !file ? 
            <Uploader event={handleChange}/> : 
            <Reader 
                file={file}
                currentLocation={currentLocation} 
                setPageContent={setPageContent}
                setSectionContent = {setSectionContent}
                setHighlightExcerpt = {setHighlightExcerpt}
            />
        }
    </>
    )
}