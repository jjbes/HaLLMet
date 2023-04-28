import React, { MutableRefObject, useState } from 'react'
import Reader from './components/reader'
import Uploader from './components/uploader'

type EpubHighLightProps = {
    currentLocation: MutableRefObject<any>
    setPageContent:Function
    setExcerpt:Function
}
export default ({ currentLocation, setPageContent, setExcerpt}: EpubHighLightProps) => {
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
                setExcerpt={setExcerpt} 
                setPageContent={setPageContent}
            />
        }
    </>
    )
}