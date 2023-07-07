import React, { useState } from 'react'
import Reader from './components/reader'
import Uploader from './components/uploader'

const Prototype =  () => {
    const [file, setFile] = useState<any>(null)

    function handleChange(event: any) {
        setFile(event.target.files[0])
    }

    return (
    <>
        {
            !file ? 
            <Uploader event={handleChange}/> : 
            <Reader file={file}/>
        }
    </>
    )
}

export default Prototype