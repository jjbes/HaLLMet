import React, { useState, useEffect } from 'react'
import TextLoader from './loaders/text-loader'

let contextualList: {[k: string]: Map<number, string|null>} = {}

type ContextualizationProps = {
    context:string
    sentence:string
    section:string
    index:number
}
const Contextualization = ({ context, sentence, section, index }: ContextualizationProps) => {
    const [contextualization, setContextualization] = useState<string|null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [apiError, setApiError] = useState<boolean>(false)
    const [dataError, setDataError] = useState<boolean>(false)

    const requestContexualizations = async () =>{
        contextualList[section].set(index, "")

        return fetch(`${process.env.NEXT_PUBLIC_API_URL}/explain`, {
            method : "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body : JSON.stringify({ "context": context, "sentence": sentence })
        })
        .then(response => response.json())
        .then(response => {
            setContextualization(response.response)
            contextualList[section].set(index, response.response)
        })
        .finally(()=> {
            setLoading(false)
        })
        .catch(e => {
            console.error('API call error :', e.name, e.message)
            setApiError(true)
            setLoading(false)
            contextualList[section].set(index, null)
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
        if (!contextualList[section]) contextualList[section] = new Map()
        if(contextualList[section].has(index)) {
            if(contextualList[section].get(index) == null){
                setDataError(true)
                return
            }
            setContextualization(contextualList[section].get(index)??null)
        } else {
            setLoading(true)
            requestContexualizations()
        }
    })

    if(apiError || dataError) return (
        <p 
            className="text-sm text-left text-red-700 cursor-pointer"
            onClick={()=>{retry()}}>
            An error occured, click to retry
        </p>
    )

    if(loading) return (
        <TextLoader/>
    )
    
    return (
        <p className="text-sm text-left text-slate-700 mt-2">{contextualization}</p>
    )
}

export default Contextualization