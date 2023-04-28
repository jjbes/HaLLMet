import React, { useRef, useState, useEffect, MutableRefObject } from 'react'
import { ReactReader } from 'react-reader'
import requestPostMethod from '../../../../api'

let excerptList: string[] = []

type ReaderProps = {
    file: Blob | MediaSource
    currentLocation:MutableRefObject<any>
    setPageContent:Function
    setExcerpt:Function
}

export default ({ file, currentLocation, setPageContent, setExcerpt}: ReaderProps) => {
    const [url, _] = useState(URL.createObjectURL(file))
    const [location, setLocation] = useState<string>("0")
    const [hlLoading, setHlLoading] = useState<boolean>(false)
    const renditionRef = useRef<any>(null)

    const locationChanged = (epubcifi: string) => {
        setLocation(epubcifi)
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

    const stringToChunks = (string: string, chunkSize: number) => {
        const chunks = [];
        while (string.length > 0) {
            chunks.push(string.substring(0, chunkSize));
            string = string.substring(chunkSize, string.length);
        }
        return chunks
    }

    //Save current location
    useEffect(()=>{
        if(!location) return
        if(!location.includes("epubcfi")) return

        const start = renditionRef.current.currentLocation().start
        if(!start) return
        const section = renditionRef.current.book.spine.get(start.cfi)
        
        currentLocation.current = {
            section:section.canonical,
            page:location
        }
    }, [location])

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
    }, [location])

    //Set Highlights
    useEffect(() => {
        if(!location) return
        if(!location.includes("epubcfi")) return

        const start = renditionRef.current.currentLocation().start
        if(!start) return

        const section = renditionRef.current.book.spine.get(start.cfi)
        if (excerptList.includes(section.canonical)) return
        excerptList.push(section.canonical)
        setHlLoading(true)

        stringToChunks(section.contents.textContent, 1500).forEach((context)=>{
            const body = JSON.stringify({ "context": context })           

            requestPostMethod("excerpt", body, null)
            .then(response => response.json())
                .then(response => {
                    const highlights = response.response.split("|")
                    
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
                                    ()=>{ setExcerpt(highlight) },
                                    'highlight',
                                    null
                                )
                                break
                            }
                        }
                    })
                    setHlLoading(false)
                }
            ).catch(e => {
                console.error('API call error :', e.name, e.message)
            })
        })
        
    }, [location])

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
            {
                hlLoading ?
                <div className='absolute top-[10px] right-0 z-50'>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div> : 
                <></>
            }
        </div>
       
    )
}
