import React, { useState, useEffect, useRef } from 'react'
import Message from './components/message'
import requestPostMethod from '../../api'

let controller: AbortController

type ChatbotProps = {
    context:string|null
}
export default ({ context }: ChatbotProps) => {
    const [loading, setLoading] = useState<boolean>(false)
    const [messages, setMessages] = useState<{content:string, type:string}[]>([])
    
    const handleSubmit = (event:any) => {
        event.preventDefault()
        
        if(loading) return
        if(!event.target.question.value) return

        const question = event.target.question.value
        event.target.question.value = ""

        setLoading(true)
        setMessages(messages => [...messages, {"content": question, "type":"user"}])

        if (controller) controller.abort()
        controller = new AbortController()

        const body = JSON.stringify({
            "context": context,
            "question": question
        })
        requestPostMethod("chat", body, controller)
        .then(response => response.json())
            .then(response => {
                setMessages(messages => [...messages, {"content": response.response, "type":"chatbot"}])
                setLoading(false)
            }            
        ).catch(e => {
            console.error('API call error :', e.name, e.message)
        })
    }

    const messagesEndRef = useRef<any|null>(null)
    const scrollToBottom = () => {
        messagesEndRef.current?.scroll({ top: messagesEndRef.current?.scrollHeight, behavior: 'smooth' })
    }
    useEffect(() => {scrollToBottom()}, [messages])

    const buttonStyle = loading ?
    'opacity-50 cursor-not-allowed bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline':
    'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
    
    return (
        <>
            <div  ref={messagesEndRef} className="bg-white w-full p-6 h-5/6 overflow-y-auto">
                {
                    messages.map((message: {content:string, type:string}, i: number) => {
                        return <Message key={i} content={message.content} type={message.type}/>
                    })
                }
            </div>
            <div className="w-full h-1/6">
                <form onSubmit={(e) => {handleSubmit(e)}} className="bg-white rounded px-8 pt-6 pb-8 w-full flex flex-row items-end">
                    <input id="question" type="text" placeholder="What is happening in this scene?"
                        className="shadow appearance-none border rounded w-full py-2 px-3 mr-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    <input type="submit" value="Search" className={buttonStyle}/>
                </form>
            </div>
        </>
    )
}