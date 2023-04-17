import React, { useState, useEffect } from 'react'
import Loader from './common/loader'
import Alert from './common/alert'
import requestPostMethod from '../../../api'

let controller: AbortController

type HighlightProps = {
    context:string|null
}
export default ({context}: HighlightProps) => {
    const [loading, setLoading] = useState<boolean>(false)
    const [highlight, setHighlight] = useState<string[]|null>(null)

    useEffect(() => {
        if(!context){
            return
        }
        setLoading(true)

        if (controller) controller.abort()
        controller = new AbortController()

        const body = JSON.stringify({ "context": context })
        requestPostMethod("highlight", body, controller)
        .then(response => response.json())
            .then(response => {
                const [sentence, explanation] = response.response.split("|")

                if(sentence == undefined || explanation == undefined) {
                    setHighlight(["", ""])
                }else{
                    setHighlight([sentence.trim(), explanation.trim()])
                }
                setLoading(false)
            }
        ).catch(e => {
            console.error('API call error :', e.name, e.message)
        })
        
    }, [context])

    if (loading) return (
        <Loader/>
    )
    if(!highlight || highlight[0] == "" || highlight[1] == ""){
        return <Alert content={"No higlight found"}/>
    }

    return (
        <div className="h-full w-full text-xs bg-white text-gray-700 p-8 flex flex-col overflow-y-auto">
            <p className="italic text-base text-left mb-4 font-serif">{highlight[0]}</p>
            <p className="text-xs text-left ">{highlight[1]}</p>
         </div>
    )
}