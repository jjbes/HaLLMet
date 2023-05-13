import React, { useEffect, useState } from 'react'
import ImageBackground from './components/image'
import Modal from "./components/modal-location"

let locationController: AbortController
let backgroundController: AbortController

let backgroundList: {[k: string]: string|null} = {}

type backgroundProps = {
    context: string|null
    currentPage: string|null
}
export default ({ context, currentPage }: backgroundProps) => {
    const [imageUrl, setImageUrl] = useState<string|null>(null)
    const [prompt, setPrompt] = useState<string>("")

    const requestLocation = async (context: string) => {
        if (locationController) locationController.abort()
        locationController = new AbortController()

        return fetch("http://127.0.0.1:8000/location", {
            signal : locationController ? locationController.signal : null,
            method : "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body : JSON.stringify({ "context": context })
        })
        .then(response => response.json())
        .then(response => {
            const location = response.response
            if(!location) {
                if(currentPage) backgroundList[currentPage] = null
                setImageUrl(null)
            }
            return location
        })
        .catch(e => {
            console.error('API call error :', e.name, e.message)
        })
    }

    const requestBackground = async (context: string) => {
        const location = await requestLocation(context)
        if(!location) return

        if (backgroundController) backgroundController.abort()
        backgroundController = new AbortController()

        return fetch("http://127.0.0.1:8000/background", {
            signal : backgroundController ? backgroundController.signal : null,
            method : "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body :JSON.stringify({ "location": location })
        })
        .then(response => response.json())
        .then(response => {
            const background = response.response
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
        })
        .catch(e => {
            console.error('API call error :', e.name, e.message)
        })
    }

    //Get emotion
    useEffect(() => {
        setImageUrl(null)
        if(!context) return
        if(currentPage && currentPage in backgroundList) {
            setImageUrl(backgroundList[currentPage])
            return
        }
        requestBackground(context)
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