import React, { MutableRefObject, useState } from 'react'
import Reader from './components/reader'
import Uploader from './components/uploader'

type EpubHighLightProps = {
    currentPage: MutableRefObject<any>
    setPageContent:Function
    setExplanation:Function
}
export default ({ currentPage, setPageContent, setExplanation}: EpubHighLightProps) => {
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
                currentPage={currentPage} 
                setExplanation={setExplanation} 
                setPageContent={setPageContent}
            />
        }
    </>
    )
}