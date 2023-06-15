import React, { useState } from 'react'
import Reader from './components/reader'
import Uploader from './components/uploader'

export default () => {
    const [file, setFile] = useState()

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