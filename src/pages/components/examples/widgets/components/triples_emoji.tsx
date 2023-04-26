import React, { useState, useEffect } from 'react'
import Loader from './common/loader'
import Alert from './common/alert'
import Graph from "react-graph-vis"
import requestPostMethod from '../../../../api'


let triplesController = new AbortController()
let emojiController = new AbortController()

type TriplesEmojiProps = {
    context:string|null
}
export default ({context}: TriplesEmojiProps) => {
    const [loading, setLoading] = useState<boolean>(false)
    const [graph, setGraph] = useState<{edges:Object[], nodes:Object[]}|null>(null)

    const options = {
        edges:{
          arrows: 'to',
          smooth: true,
        }
    }

    const uniq = (arr: any[], track = new Set()) => {
        return arr.filter(({ id }) => (track.has(id) ? false : track.add(id)))
    }   

    useEffect(() => {
        if(!context){
            return
        }
        setLoading(true)
        setGraph(null)

        if (triplesController) triplesController.abort()
        triplesController = new AbortController()

        const body = JSON.stringify({
            "context": context,
            "number":4
        })
        requestPostMethod("generate_triples", body, triplesController)
        .then(response => response.json())
            .then(response => {
                if (emojiController) emojiController.abort()
                emojiController = new AbortController()

                const bodyRes = JSON.stringify({
                    "triples": response.response
                })
                requestPostMethod("emojize", bodyRes, new AbortController())
                .then(response => response.json())
                    .then(response => {
                        let edges: Object[] = []
                        let nodes: Object[] = []
        
                        response.response.split("<|>").forEach((triple:string) => {
                            if( triple.split("|").length != 3) return
                            const [s,p,o] = triple.split("|")
            
                            edges.push({from:s, to:o, label:p, dashes: true})
                            nodes.push({id: s, label:s, color: "#ffffff"})
                            nodes.push({id: o, label:o, color: "#ffffff"})
                        })  
        
                        setGraph({
                            nodes: uniq(nodes),
                            edges: edges,
                        })
                        
                        setLoading(false)
                    })
                
            }
            
        ).catch(e => {
            console.error('API call error :', e.name, e.message)
        })
    }, [context])

    if (loading) return (
        <Loader/>
    )

    if (!graph || graph.edges.length == 0) return (
        <Alert content={"No triples extracted"}/>
    )

    return (
        <div className="h-full w-full bg-white">
            <Graph
                graph={graph}
                options={options}
            />
        </div>
    )
}