import React, { useRef, useState, useEffect, MutableRefObject } from 'react'
import { ReactReader } from 'react-reader'
import requestPostMethod from '../../../../api'
import { get_encoding } from "@dqbd/tiktoken"
import ButtonHighlight from './reader/button-highlight'


let excerptList: string[] = []

type ReaderProps = {
    file: Blob | MediaSource
    currentLocation:MutableRefObject<any>
    setPageContent:Function
    setSectionContent:Function
    setHighlightExcerpt:Function
}

export default ({ file, currentLocation, setPageContent, setSectionContent, setHighlightExcerpt}: ReaderProps) => {
    const [url, _] = useState(URL.createObjectURL(file))
    const [location, setLocation] = useState<string>("0")
    const [nbReqLoading, setNbReqLoading] = useState<number>(0)
    const [displayHighlight, setDisplayHighlight] = useState<boolean>(false)
    const renditionRef = useRef<any>(null)

    const locationChanged = (epubcifi: string) => {
        setLocation(epubcifi)
    }

    const flattenWhiteSpaces = (text: string) =>  text.replace(/\s/g,' ').replace(/\s{2,}/g, ' ')

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

    const splitbyChunkNumber = (string: string, chunkNumber: number) => {
        let chunks = []
        const enc = get_encoding("cl100k_base")

        //Not perfect because chunks will be slightly different than pages
        const encoded = enc.encode(flattenWhiteSpaces(string))
        const chunkSize = Math.ceil(encoded.length/chunkNumber)

        for(let i=0; i<encoded.length; i=i+chunkSize){
            chunks.push(encoded.subarray(i, i+chunkSize))
        }
        
        chunks = chunks.map((chunk) => {
            return new TextDecoder().decode(enc.decode(chunk))
        })
        enc.free()
        return chunks
    }

    //Get a context window based on the current page
    const getContextWindow = (renditionRef: MutableRefObject<any>) =>{
        const start = renditionRef.current.currentLocation().start
        if(!start) return

        const section = renditionRef.current.book.spine.get(start.cfi)
        const currPage = start.displayed.page - 1
        const pageNumber = start.displayed.total
        const chunks = splitbyChunkNumber(section.contents.textContent, pageNumber)
        
        const textWindow = [chunks[currPage-1], chunks[currPage], chunks[currPage+1]]
                                .filter(Boolean).join(" ");
        return textWindow
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
        setSectionContent(getContextWindow(renditionRef))
    }, [location])

    //Set Highlights
    useEffect(() => {
        if(!displayHighlight) return

        if(!location) return
        if(!location.includes("epubcfi")) return

        const start = renditionRef.current.currentLocation().start
        if(!start) return

        const section = renditionRef.current.book.spine.get(start.cfi)
        if (excerptList.includes(section.canonical)) return
        excerptList.push(section.canonical)
        
        const pageNumber = start.displayed.total
        const chunks = splitbyChunkNumber(section.contents.textContent, pageNumber)

        chunks.forEach((context)=>{
            const body = JSON.stringify({ "context": context })                   
            
            setNbReqLoading((val) => val + 1)

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
                                ()=>{ setHighlightExcerpt(highlight) },
                                'highlight',
                                null
                            )
                            break
                        }
                    }
                })
            }).finally(()=>{
                setNbReqLoading((val) => val - 1)
            }).catch(e => {
                console.error('API call error :', e.name, e.message)
            })
        })
        
    }, [location, displayHighlight])

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
            <div className="top-[10px] right-[10px] z-50 absolute flex">
                <ButtonHighlight nbReqLoading={nbReqLoading} displayHighlight={displayHighlight} setDisplayHighlight={setDisplayHighlight}/>
            </div>
        </div>
       
    )
}
