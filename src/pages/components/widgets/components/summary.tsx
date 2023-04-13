import React, { useState, useEffect } from 'react'
import Loader from './common/loader'
import Message from './common/message'
import Alert from './common/alert'

let controller: AbortController

type SummaryProps = {
    infos: any|null
    context:string|null
}
export default ({infos, context}: SummaryProps) => {
    const [loading, setLoading] = useState<boolean>(false)
    const [content, setContent] = useState<string|null>(null)

    useEffect(() => {
        if(!context || !infos){
            return
        }
        setLoading(true)

        if (controller) controller.abort()
        controller = new AbortController()
        const signal = controller.signal

        fetch("http://127.0.0.1:8000/summarize", {
            signal:signal,
            method : "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "title":infos.title ? infos.title : "",
                "author":infos.creator ? infos.creator : "",
                "context": context,
            })
        }).then(response => response.json())
            .then(response => {
                setContent(response.response)
                setLoading(false)
            }
            
        ).catch(e => {
            console.error('API call error :', e.name, e.message)
        })

    }, [context])

    if (loading) return (
        <Loader/>
    )
    if (!content) return (
        <Alert content="No summary to display"/>
    )
    return (
        <Message content={content}/>
    )
}