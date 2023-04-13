import React, { useState, useEffect } from 'react'
import Loader from './common/loader'
import Message from './common/message'
import Alert from './common/alert'

let controller: AbortController

type TranslateProps = {
    context:string|null
}
export default ({context}: TranslateProps) => {
    const [loading, setLoading] = useState<boolean>(false)
    const [content, setContent] = useState<string|null>(null)
    const [language, setLanguage] = useState<string>("french")

    
    const translations = [
        ["🇯🇵","japanese"],
        ["🇩🇪","german"],
        ["🇫🇷","french"],
        ["🇪🇸","spanish"],
        ["🇮🇹","italian"],
        ["🇬🇧","english"]
    ]

    useEffect(() => {
        if(!context){
            return
        }
        setLoading(true)

        if (controller) controller.abort()
        controller = new AbortController()
        const signal = controller.signal

        fetch("http://127.0.0.1:8000/translate", {
            signal: signal,
            method : "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "context": context,
                "language": language
            })
        }).then(response => response.json())
            .then(response => {
                setContent(response.response)
                setLoading(false)
            }
            
        ).catch(e => {
            console.error('API call error :', e.name, e.message)
        })

    }, [context, language])

    if (loading && !content) return (
        <Loader/>
    )

    if (!content) return (
        <Alert content="No translation to display"/>
    )

    const changeLanguage= (language:string) => {
        if(loading) return
        setLanguage(language)
    }

    const buttonStyle = loading ? 
        'opacity-50 cursor-not-allowed m-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-3 rounded':
        'm-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-3 rounded'

    return (
        <div className="h-full w-full text-sm bg-white text-gray-700 text-justify ">
            <div className="flex flex-col h-full">
                <div className="h-5/6">
                    {
                        loading ? 
                        <Loader/>:
                        <Message content={content}/>
                    }                    
                </div>
                <div className="h-1/6 flex flex-row items-center justify-center">
                    {
                        translations.map((item: Array<string>, i: number) => {
                            return <button onClick={() => changeLanguage(item[1])} key={i} className={buttonStyle}>
                                    {item[0]}
                                </button>                          
                        })
                    }
                </div>
            </div>
        </div>
    )
}