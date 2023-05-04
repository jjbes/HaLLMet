import React, { useEffect, useState } from 'react'
import DefaultBackground from './components/default'
import ImageBackground from './components/image'
import Modal from "../modal/prompt-location"

import requestPostMethod from '../../../api'

let emotionController = new AbortController()

let backgroundList: {[k: string]: string|null} = {}

type backgroundProps = {
    context: string|null
    currentPage: string|null
}
export default ({ context, currentPage }: backgroundProps) => {
    const [imageUrl, setImageUrl] = useState<string|null>(null)
    const [prompt, setPrompt] = useState<string>("")

    //Get emotion
    useEffect(() => {
        setImageUrl(null)
        
        if(!context) return

        if(currentPage && currentPage in backgroundList) {
            setImageUrl(backgroundList[currentPage])
            return
        }

        if (emotionController) emotionController.abort()
        emotionController = new AbortController()

        const body = JSON.stringify({ "context": context })
        requestPostMethod("location", body, emotionController)
        .then(response => response.json())
            .then(response => {
                if(!response.response){
                    if(currentPage) backgroundList[currentPage] = null
                    setImageUrl(null)
                    return
                }

                const image = new Image()
                image.src = response.response
                if (response.response.substring(0, 5) == 'data:'){
                    image.decode().then(()=>{
                        if(currentPage) backgroundList[currentPage] = image.src
                        setImageUrl(image.src)
                    })
                }else{
                    image.onload = ()=>{
                        if(currentPage) backgroundList[currentPage] = image.src
                        setImageUrl(image.src)
                    }
                }
            }
        ).catch(e => {
            console.error('API call error :', e.name, e.message)
        })

    }, [context])

    useEffect(() => {
        if(prompt) return
        fetch('http://127.0.0.1:8000/prompt/location')
        .then(response => response.json())
        .then(response => {
            setPrompt(response.response)
        })
    })

    return (
    <>
        <ImageBackground imageUrl={imageUrl} />
        <Modal prompt={prompt} context={context}/>
    </>
    )
}