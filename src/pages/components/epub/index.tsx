import React, { useState } from 'react'
import Reader from './components/reader'
import Uploader from './components/uploader'

type EpubProps = {
    setInfos: Function
    selections: any
    setSelections: Function
}
export default ({setInfos, selections, setSelections}: EpubProps) => {
    const [file, setFile] = useState()

    function handleChange(event: any) {
        setFile(event.target.files[0])
    }

    return (
    <>
        {
            !file ? 
            <Uploader event={handleChange}/> : 
            <Reader setInfos={setInfos} selections={selections} setSelections={setSelections} file={file}/>
        }
    </>
    )
}
