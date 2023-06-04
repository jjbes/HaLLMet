import React, { useState, useEffect } from 'react'
import TitleLoader from './loaders/title-loader'

let titleList: {[k: string]: Map<number, string|null>} = {}

type TitleProps = {
    context:string
    sentence:string
    section:string
    index:number
}
export default ({ context, sentence, section, index }: TitleProps) => {
    const [title, setTitle] = useState<string|null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [apiError, setApiError] = useState<boolean>(false)
    const [dataError, setDataError] = useState<boolean>(false)

    const requestContexualizations = async () =>{
        titleList[section].set(index, "")

        return fetch("http://127.0.0.1:8000/title", {
            method : "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body : JSON.stringify({ "context": context, "sentence": sentence })
        })
        .then(response => response.json())
        .then(response => {
            setTitle(response.response)
            titleList[section].set(index, response.response)
        })
        .finally(()=> {
            setLoading(false)
        })
        .catch(e => {
            console.error('API call error :', e.name, e.message)
            setApiError(true)
            setLoading(false)
            titleList[section].set(index, null)
        })      
    }

    const retry = () => {
        if(!apiError && !dataError) return
        setApiError(false)
        setDataError(false)
        setLoading(true)
        requestContexualizations()
    }

    useEffect(() => {
        if (!titleList[section]) titleList[section] = new Map()
        if(titleList[section].has(index)) {
            if(titleList[section].get(index) == null){
                setDataError(true)
                return
            }
            setTitle(titleList[section].get(index)??null)
        } else {
            setLoading(true)
            requestContexualizations()
        }
    })

    if(apiError || dataError) return (
        <div 
            className='text-left text-base font-semibold text-red-700 cursor-pointer'
            onClick={()=>{retry()}}>
            An error occured, click to retry
        </div>
    )

    if(loading) return (
        <div className="pb-4">
            <TitleLoader/>
        </div>
    )

    return (
        <div className='text-left text-base font-semibold text-slate-700'>
            {title}
        </div>
    )
}
