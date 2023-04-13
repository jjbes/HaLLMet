import React, { useState, useEffect, useRef } from 'react'

type MessageProps = {
    content:string,
    type:string
}

type ChatbotProps = {
    context:string|null
}

const Message = ({content, type}:MessageProps) => {
    if(type == "user"){
        return (
        <div className='w-full p-4 flex justify-end '>
            <div className='max-w-[70%] p-4 min-h-[3rem] bg-blue-400 rounded-lg'>
                <p className='w-full break-words whitespace-normal text-left text-white'>{content}</p>
            </div>
        </div>
        )
    }else {
        return (
        <div className='w-full p-4 flex justify-start'>
            <div className='max-w-[70%] p-4 min-h-[3rem] bg-gray-100 rounded-lg'>
                <p className='w-full break-words whitespace-normal text-left text-black'>{content}</p>    
            </div>
        </div>
        )
    }
    
}

export default ({ context }: ChatbotProps) => {
    const [loading, setLoading] = useState<boolean>(false)
    const [question, setQuestion] = useState<string|null>(null)
    const [messages, setMessages] = useState<{content:string, type:string}[]>([])
    
    useEffect(() => {
        if(!question) return

        setLoading(true)
        setMessages(messages => [...messages, {"content": question, "type":"user"}])
        fetch("http://127.0.0.1:8000/chat", {
            method : "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "context": context,
                "question": question
            })
        }).then(response => response.json())
            .then(response => {
                setMessages(messages => [...messages, {"content": response.response, "type":"chatbot"}])
                setLoading(false)
            }
            
        ).catch(e => {
            console.error('API call error :', e.name, e.message)
        })

    }, [question])

    const messagesEndRef = useRef<any|null>(null)
    const scrollToBottom = () => {
        messagesEndRef.current?.scroll({ top: messagesEndRef.current?.scrollHeight, behavior: 'smooth' })
    }
    useEffect(() => {scrollToBottom()}, [messages])

    const handleSubmit = (event:any) => {
        event.preventDefault()

        if(loading) return
        if(!event.target.question.value) return
        setQuestion(event.target.question.value)   
        event.target.question.value = ""
    }

    const buttonStyle = loading ?
    'opacity-50 cursor-not-allowed bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline':
    'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
    
    return (
        <>
            <div  ref={messagesEndRef} className="bg-white w-full p-6 h-5/6 overflow-y-auto">
                {
                    messages.map((message: {content:string, type:string}, i: number) => {
                        return <Message content={message.content} type={message.type}/>
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