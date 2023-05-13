import React, { useState, useEffect } from 'react'
import TextLoader from './text-loader'

let contextualList: {[k: string]: Map<number, string>} = {}

type ContextualizationProps = {
    context:string
    highlights:Object
    section:string
    index:number
}
export default ({ context, highlights, section, index }: ContextualizationProps) => {
    const [contextualization, setContextualization] = useState<string|null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [apiError, setApiError] = useState<boolean>(false)
    const [dataError, setDataError] = useState<boolean>(false)

    const getContexualizations = () =>{
        const highlightsStr = Object.entries(highlights).map((entry)=>{
            return entry[1].content
        }).join('\n')

        ;(async () => {
            contextualList[section].set(index, "")
            return fetch("http://127.0.0.1:8000/contextualize", {
                method : "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body : JSON.stringify({ "context": context, "sentence": highlightsStr })
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
            })      
        })()
    }

    const retry = () => {
        setApiError(false)
        setDataError(false)
        setLoading(true)
        getContexualizations()
    }

    useEffect(() => {
        if (!contextualList[section]) contextualList[section] = new Map()
        if(contextualList[section].has(index)) {
            setContextualization(contextualList[section].get(index)??"")
            return
        }
        getContexualizations()
    })

    useEffect(() => {
        if(!contextualization && !loading) setDataError(true)
    },[loading])

    if(apiError || dataError) return (
        <div 
        className={`relative h-full p-4 text-center text-gray-700 bg-white border-l-4 border-l-blue-500 cursor-pointer`}
        onClick={()=>{retry()}}>
            <p className="text-base text-left text-red-700">
                An error occured, click to retry
            </p>
        </div>
    )

    if(loading) return (
        <div className={`relative h-full p-4 text-center text-gray-700 bg-white border-l-4 border-l-blue-500`}>
            <TextLoader/>
        </div>
    )

    return (
        <div className={`relative h-full p-4 text-center text-gray-700 bg-white border-l-4 border-l-blue-500`}>
            <p className="text-base text-left ">{contextualization}</p>
        </div>
    )
}
