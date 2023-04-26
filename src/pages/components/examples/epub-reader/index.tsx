import React, { useState } from 'react'
import Reader from './components/reader'
import Uploader from './components/uploader'

type EpubProps = {
    selections: any
    setSelections: Function
    setPageContent: Function
    setInfos: Function
}
export default ({selections, setSelections, setPageContent, setInfos}: EpubProps) => {
    const [file, setFile] = useState()

    function handleChange(event: any) {
        setFile(event.target.files[0])
    }

    return (
    <>
        {
            !file ? 
            <Uploader event={handleChange}/> : 
            <Reader file={file} selections={selections} setSelections={setSelections} setPageContent={setPageContent} setInfos={setInfos}/>
        }
    </>
    )
}