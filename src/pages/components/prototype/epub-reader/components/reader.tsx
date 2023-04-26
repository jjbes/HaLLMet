import React, { useRef, useState, useEffect, MutableRefObject } from 'react'
import { ReactReader } from 'react-reader'
import requestPostMethod from '../../../../api'

let excerptList: {[k: string]: any} = {}

let highlightController = new AbortController()

type ReaderProps = {
    file: Blob | MediaSource
    currentPage:MutableRefObject<any>
    setPageContent:Function
    setExplanation:Function
}

export default ({ file, currentPage, setPageContent, setExplanation}: ReaderProps) => {
    const [url, _] = useState(URL.createObjectURL(file))
    const [location, setLocation] = useState<string>("0")
    const [context, setContext] = useState<string|null>()
    const renditionRef = useRef<any>(null)

    const locationChanged = (epubcifi: string) => {
        setLocation(epubcifi)

        if(epubcifi.includes("epubcfi")) {
            currentPage.current = epubcifi
        }
    }

    const findInString = (query: string, text: string) => {
        query = query.toLowerCase()
        text = text.toLowerCase()
        query = query.replace(/\s/g,' ')
        text = text.replace(/\s/g,' ')
        query = query.replaceAll("“", ' ').replaceAll("”", ' ').replaceAll('"', ' ')
        text = text.replaceAll("“", ' ').replaceAll("”", ' ').replaceAll('"', ' ')
        if(text.indexOf(query) == -1){
            query = query.replace(/\s{2,}/g, ' ')
            text = text.replace(/\s{2,}/g, ' ')
        }
        return text.indexOf(query)
    }
    
    const searchInNestedNodes = (node: Node, target: number) => {
        const recursor = (node: Node) => {
            let a: any[] = []
            if(target<0){
                return a
            }
            if (node.nodeType == 3) {
                target = target - (node.textContent?.length ?? 0)
                a.push(node)
    
            } else {
                for (const[_, childNode] of Object.entries(node.childNodes)){
                    a = a.concat(recursor(childNode))
                }
            }
            return a
        }
        return recursor(node)
    }

    //Get current page content
    useEffect(() => {
        if(!location) return
        if(!location.includes("epubcfi")) return

        const start = renditionRef.current.currentLocation().start
        const end = renditionRef.current.currentLocation().end

        if(!start || !end) return
        
        const splitCfi = start.cfi.split('/')
        const baseCfi = splitCfi[0] + '/' + splitCfi[1] + '/' + splitCfi[2] + '/' + splitCfi[3]
        const startCfi = start.cfi.replace(baseCfi, '')
        const endCfi = end.cfi.replace(baseCfi, '')
        const rangeCfi = [baseCfi, startCfi, endCfi].join(',');

        const pageContent = renditionRef.current.getRange(rangeCfi).toString().replace(/\s/g,' ')
        const pageContentClean = pageContent.replace(/\s/g,' ').replace(/\s{2,}/g, ' ')

        setPageContent(pageContentClean)
        setContext(pageContentClean)

    }, [location])

    //Get Highlight
    useEffect(() => {
        if(!location) return
        if(!location.includes("epubcfi")) return
        if(!renditionRef.current.currentLocation().start) return
        if(!context) return

        const startCfi = renditionRef.current.currentLocation().start.cfi
        if(startCfi in excerptList) return

        if (highlightController) highlightController.abort()
        highlightController = new AbortController()

        const body = JSON.stringify({ "context": context })
        requestPostMethod("excerpt", body, highlightController)
        .then(response => response.json())
            .then(response => {
                const highlights = response.response.split("|")
                const section = renditionRef.current.book.spine.get(startCfi)
                excerptList[startCfi] = highlights
                
                highlights.forEach((highlight: string) => {
                    let paragraphs = section.contents.children[1].childNodes
                    
                    for (const[_, paragraph] of Object.entries<Node>(paragraphs)){
                        if(!paragraph.textContent) return

                        const pos = findInString(highlight, paragraph.textContent)
                        if (pos != -1){
                            const range = section.document.createRange()
                            
                            //setStart loop
                            let nodes = searchInNestedNodes(paragraph, pos)
                            let sum = 0
                            nodes.forEach((node) => {
                                sum += node.textContent.length
                            })

                            range.setStart(nodes[nodes.length-1], nodes[nodes.length-1].textContent.length - (sum-pos))
                            
                            //setEnd loop
                            nodes = searchInNestedNodes(paragraph, pos + highlight.length)
                            sum = 0
                            nodes.forEach((node) => {
                                sum += node.textContent.length
                            })
                            range.setEnd(nodes[nodes.length-1], nodes[nodes.length-1].textContent.length - (sum-(pos + highlight.length)))

                            const cfi = section.cfiFromRange(range)

                            renditionRef.current.annotations.add(
                                'highlight',
                                cfi,
                                {},
                                ()=>{ setExplanation(highlight) },
                                'hl',
                                { fill: 'grey', 'fill-opacity': '0.2', 'mix-blend-mode': 'multiply' }
                            )
                            break
                        }
                    }
                })
            }
        ).catch(e => {
            console.error('API call error :', e.name, e.message)
        })

    }, [context])

    return (
        <div className='h-full w-full flex flex-row relative'>
            <div className='h-full w-full'>
                <ReactReader
                    location={location}
                    locationChanged={locationChanged}
                    url={url}
                    epubInitOptions={{
                        openAs: 'epub'
                    }}
                    getRendition={rendition => {
                        renditionRef.current = rendition
                    }}
                />
            </div>
        </div>
    )
}
