import React, { useState, useEffect } from 'react'
import requestPostMethod from '../../../api'
import ExcerptLoader from './components/excerpt-loader'
import ExplanationLoader from './components/explanation-loader'

let explainController = new AbortController()

let explanationList: {[k: string]: any} = {}

type ExplanationProps = {
    excerpt: string|null
    context: string|null
    currentSection: string|null
}

export default ({excerpt, context, currentSection}: ExplanationProps) => {
    const [explanation, setExplanation] = useState<string[]|null>(null)
    const [loading, setLoading] = useState<boolean>(false)

    //Get explanation
    useEffect(() => {
        if(!excerpt || !context) return

        if(currentSection && currentSection in explanationList) {
            if(excerpt in explanationList[currentSection]){
                setExplanation([excerpt, explanationList[currentSection][excerpt]])
                return
            }
        }

        if (explainController) explainController.abort()
        explainController = new AbortController()

        setLoading(true)
        const body = JSON.stringify({
            "context": context,
            "sentence": excerpt 
        })
        requestPostMethod("explain", body, explainController)
        .then(response => response.json())
            .then(response => {
                setExplanation([excerpt, response.response])
                if(currentSection && !explanationList[currentSection]) explanationList[currentSection] = {}
                if(currentSection) explanationList[currentSection][excerpt] = response.response
                setLoading(false)
            }
        ).catch(e => {
            console.error('API call error :', e.name, e.message)
        })

    }, [excerpt])

    if(!context || !excerpt) return <></>

    return (
        <div className="w-1/4 p-4 absolute right-3">
            <div className="h-full p-4 text-center text-gray-700 bg-white rounded">
                <div>
                    {
                        loading ? 
                        <ExcerptLoader /> :
                        <p className="italic text-base text-left mb-4 font-serif">{explanation? explanation[0] : null}</p>
                    }
                    {
                        loading ? 
                        <ExplanationLoader /> :
                        <p className="text-sm text-left ">{explanation? explanation[1] : null}</p>
                    }
                </div>
            </div>
        </div>
    )
}