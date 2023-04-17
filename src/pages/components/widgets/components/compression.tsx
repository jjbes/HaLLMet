import React, { useState, useEffect } from 'react'
import Loader from './common/loader'
import Message from './common/message'
import Alert from './common/alert'

let controller: AbortController

type CompressionProps = {
    context:string|null
}
export default ({context}: CompressionProps) => {
    const [loading, setLoading] = useState<boolean>(false)
    const [content, setContent] = useState<string|null>(null)

    useEffect(() => {
        if(!context){
            return
        }
        setLoading(true)

        if (controller) controller.abort()
        controller = new AbortController()
        const signal = controller.signal

        fetch("http://127.0.0.1:8000/compress", {
            signal:signal,
            method : "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
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
        <Alert content="No compression to display"/>
    )
    return (
        <Message content={content}/>
    )
}