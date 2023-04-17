import React, { useState, useEffect } from 'react'
import Epub from './components/epub'
import Widgets from './components/widgets'

export default () => {
    const [selections, setSelections] = useState<any[]>([])
    const [context, setContext] = useState<string|null>(null)
    const [infos, setInfos] = useState<any|null>(null)
    
    useEffect(() => {      
        let string = ""
        selections.forEach((item) => {string += item.text + " "})
        setContext(string)
    }, [selections])

    return (
        <div className="h-full flex md:flex-row">
            <div className="w-full md:w-3/6 p-4 text-center text-gray-700">
                <Epub setInfos={setInfos} selections={selections} setSelections={setSelections}/>
            </div>
            
            <div className="w-full md:w-3/6 pl-2 p-6 text-center text-gray-200 overflow-y-auto">
                <Widgets infos={infos} context={context}/>
            </div>
        </div>
    )
}
