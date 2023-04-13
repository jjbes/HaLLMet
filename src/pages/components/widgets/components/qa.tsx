import React, { useState, useEffect } from 'react'
import Loader from './common/loader'
import Alert from './common/alert'

let controller: AbortController

type AccordionProps = {
    title: string,
    content: string
}
type QAProps = {
    context:string|null
}

const Accordion = ({ title, content }: AccordionProps) => {
  const [isActive, setIsActive] = useState(false)

  return (
    <div className="hover:bg-gray-200 bg-gray-100 mb-2 rounded-sm p-2">
      <div className="text-sm p-2 flex flex-row text-black font-bold cursor-pointer" onClick={() => setIsActive(!isActive)}>
        <div className="w-full text-left">{title}</div>
        <div className="w-8 flex justify-end items-center">{isActive ? '▲' : '▼'}</div>
      </div>
      {isActive && <div className="text-sm rounded-b-sm text-black p-4 text-left">{content}</div>}
    </div>
  )
}

export default ({context}: QAProps) => {
    const [loading, setLoading] = useState<boolean>(false)
    const [QAs, setQAs] = useState<string[]|null>(null)

    useEffect(() => {
        if(!context){
            return
        }
        setLoading(true)

        if (controller) controller.abort()
        controller = new AbortController()
        const signal = controller.signal
        
        fetch("http://127.0.0.1:8000/generate_qa", {
            signal:signal,
            method : "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "context": context,
                "number": 4
            })
        }).then(response => response.json())
            .then(response => {
                setQAs(response.response.split("<|>"))
                setLoading(false)
            }
            
        ).catch(e => {
            console.error('API call error :', e.name, e.message)
        })
        
    }, [context])

    if (loading) return (
        <Loader/>
    )

    if (!QAs) return (
        <Alert content={"No QA to display"}/>
    )

    return (
        <div className="h-full w-full bg-white p-2 overflow-y-scroll">
            {
                QAs.map((qa: string, i: number) => {
                    return <Accordion key={i} title={qa.split("|")[0]} content={qa.split("|")[1]} />
                })
            }
        </div>
    )
}