import React, { useState, useEffect } from 'react'
import Epub from './components/epub'
import requestPostMethod from './api/index'

let controller = new AbortController()

export default () => {
    const [selections, setSelections] = useState<any[]>([])
    const [pageContent, setPageContent] = useState<string|null>()
    const [context, setContext] = useState<string|null>(null)
    const [infos, setInfos] = useState<any|null>(null)
    
    useEffect(() => {      
        if(!selections.length && !pageContent) setContext(null)
        if(selections.length){
            let string = ""
            selections.forEach((item) => {string += item.text + " "})
            setContext(string.trim())
        }else if(pageContent){
            setContext(pageContent.trim())
        }
    }, [selections, pageContent])

    useEffect(() => {
        console.log(context)
        if(!context){
            document.body.setAttribute('style', 'background-color: lightgrey')
            return
        }

        if (controller) controller.abort()
        controller = new AbortController()

        const body = JSON.stringify({ "context": context })
        requestPostMethod("emotionColor", body, controller)
        .then(response => response.json())
            .then(response => {
                document.body.setAttribute('style', 'background-color:'+ response.response)
            }
        ).catch(e => {
            console.error('API call error :', e.name, e.message)
        })

    }, [context])

    return (
        <div className="h-full flex justify-center ">
            <div className="w-2/4 p-4 text-center text-gray-700">
                <Epub setInfos={setInfos} selections={selections} setSelections={setSelections} setPageContent={setPageContent}/>
            </div>
        </div>
    )
}
