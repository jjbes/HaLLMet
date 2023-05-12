import React, { useEffect, useState } from 'react'
import ImageBackground from './components/image'
import Modal from "../modal/prompt-location"

import requestPostMethod from '../../../api'

let locationController = new AbortController()
let backgroundController = new AbortController()

let backgroundList: {[k: string]: string|null} = {}

type backgroundProps = {
    context: string|null
    currentPage: string|null
}
export default ({ context, currentPage }: backgroundProps) => {
    const [imageUrl, setImageUrl] = useState<string|null>(null)
    const [prompt, setPrompt] = useState<string>("")

    const getLocation = async (context: string) => {
        if (locationController) locationController.abort()
        locationController = new AbortController()

        const body = JSON.stringify({ "context": context })
        return requestPostMethod("location", body, locationController)
        .then(response => response.json())
        .then(response => response["response"])
    }

    const getBackground = async (location: string) => {
        if (backgroundController) backgroundController.abort()
            backgroundController = new AbortController()

        const body = JSON.stringify({ "location": location })
        return requestPostMethod("background", body, backgroundController)
        .then(response => response.json())
        .then(response => response["response"])
    }

    //Get emotion
    useEffect(() => {
        setImageUrl(null)
        
        if(!context) return

        if(currentPage && currentPage in backgroundList) {
            setImageUrl(backgroundList[currentPage])
            return
        }

        (async () => {
            const location = await getLocation(context)
            .catch(e => {
                console.error('API call error :', e.name, e.message)
            })
            if(!location) {
                if(currentPage) backgroundList[currentPage] = null
                setImageUrl(null)
                return
            }

            const background = await getBackground(location)
            .catch(e => {
                console.error('API call error :', e.name, e.message)
            })
            if (!background) {
                if(currentPage) backgroundList[currentPage] = null
                setImageUrl(null)
                return
            }

            const image = new Image()
            image.src = background
            if (background.substring(0, 5) == 'data:'){
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
        })()
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