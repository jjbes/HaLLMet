//TODO: Allow failed excerpts request to be retried

import React, { useRef, useState, useEffect } from 'react'
import { ReactReader } from 'react-reader'
import { get_encoding } from "@dqbd/tiktoken"

import ButtonHighlight from './reader/button-highlight'
import HighlightPanel from './reader/highlight-panel'
import Background from './reader/background'

let excerptList: string[] = []

type ReaderProps = {
    file: Blob | MediaSource
}

export default ({file}: ReaderProps) => {
    const url = useRef(URL.createObjectURL(file))
    const renditionRef = useRef<any>(null)
    const currentLocation = useRef<any>(null)

    const [sectionCanonical, setSectionCanonical] = useState<string|null>(null)
    const [location, setLocation] = useState<string>("0")
    const [pageContent, setPageContent] = useState<string|null>()
    const [annotations, _] = useState<any>({})

    const [nbReqLoading, setNbReqLoading] = useState<number>(0)
    const [toggleHighlights, setToggleHighlights] = useState<boolean>(true)
    const [highlights, setHighlights] = useState<Object>({})
    const [highlightedCfi, setHighlightedCfi] = useState<string|null>(null)
    const [showPanel, setShowPanel] = useState<boolean>(false)

    const getExcerpt = async (context: string) => {
        return fetch("http://127.0.0.1:8000/excerpt", {
            method : "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "context": context })
        })
        .then(response => response.json())
        .then(response => response.response)
    }

    const highlightOne = async (section:any, context:string, indexHighlight:number) => {
        const excerpts = await getExcerpt(context)
        .finally(()=>{
            setNbReqLoading((val) => val - 1)
        })
        .catch(e => {
            console.error('API call error :', e.name, e.message)
            console.log("retry?")
        })
        if(!excerpts) return

        excerpts.replace(/(\d.\s)/g, "|")
        .replaceAll("\n", '')
        .split("|")

        const chunkHighlights = excerpts.replace(/(\d.\s)/g, "|")
                            .replaceAll("\n", '')
                            .split("|")

        chunkHighlights.forEach((highlight: string, highlightIndex:number) => {
            if(!highlight) return
            //Remove trailing spaces and quotes
            highlight = highlight.trim().replace(/^"(.*)"$/, '$1')
            
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
                        ()=>{ highlightCfi(cfi) },
                        'highlight',
                        null
                    )

                    /* Highlights follow this object format:
                    Object {
                        "/OEBPS/6600632123799531513_11-h-0.htm.xhtml": Object {
                            0: Object { 
                                0: Object { 
                                    content: "Content 1", href: "epubcfi(/6/4!/4/2[pg-header]/4,/1:1,/1:155)" 
                                }
                                1: Object { 
                                    content: "Content 2", 
                                    href: "epubcfi(/6/4!/4/2[pg-header]/4,/1:156,/3:1)" 
                                }
                            },
                            1: Object{...}
                        }
                        "/OEBPS/6600632123799531513_11-h-1.htm.xhtml": {…}
                    }
                    */
                    setHighlights((highlights: any) => ({
                        ...highlights,
                        [section.canonical]: {
                            ...highlights[section.canonical],
                            [indexHighlight]: {
                                ...(highlights[section.canonical]?highlights[section.canonical][indexHighlight] : {}),
                                [highlightIndex]: {
                                    content:highlight,
                                    href:cfi,
                                },
                                context:context
                            }
                        }
                    }))
                    break
                }
            }
        })
    }

    //TODO: 
    //- Ensure one error in promise is not blocking for too long
    //- Notify other batch is waiting
    //- Prompts
    const highlightAll = async(section:any, contexts:Array<string>, batchSize:number) => {
        let position = 0
        while (position < contexts.length) {
            const batch = contexts.slice(position, position + batchSize)
            await Promise.all(batch.map((context, indexBatch) => {
                if(context.length < 10) return              
                const indexHighlight = indexBatch+position
                //No API call if the highlights are already loaded
                if (excerptList.includes(section.canonical+indexHighlight)) return
                excerptList.push(section.canonical+indexHighlight)

                setNbReqLoading((val) => val + 1)
                setHighlights((highlights: any) => ({
                    ...highlights,
                    [section.canonical]: {
                        ...highlights[section.canonical],
                        [indexHighlight]: {}
                    }
                }))
                return highlightOne(section, context, indexHighlight)
            }))
            position += batchSize
        }
    }

    const retryHighlight = (index:number) => {
        const start = renditionRef.current.currentLocation().start
        const section = renditionRef.current.book.spine.get(start.cfi)
        const pageNumber = start.displayed.total
        const contexts = splitSectionContext(section.contents.textContent, pageNumber)
        setNbReqLoading((val) => val + 1)
        highlightOne(section, contexts[index], index)
    }

    const locationChanged = (epubcifi: string) => {
        setLocation(epubcifi)
    }

    const flattenWhiteSpaces = (text: string) =>  text.replace(/\s/g,' ').replace(/\s{2,}/g, ' ')

    const findInString = (query: string, text: string) => {
        //Replace all special characters to prevent errors between characters such as “|"
        //or ? characters in regex
        const specialChars = /[^\w&^\s]/gm
        query = query.replace(specialChars, "_")
        text = text.replace(specialChars, "_")
        //Replace the query spaces by \s* to match whitespace-independant patterns.
        const re = new RegExp(query.replace(/\s/g,'\\s*'), "gmi")
        const match = re.exec(text) //Only one match, could be multiple
        return match ? match.index : -1
    }
    
    const searchInNestedNodes = (node: Node, target: number) => {
        //TODO: Fix whitespace in calcultations
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

    const splitSectionContext = (string: string, chunkNumber: number) => {
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

    const highlightCfi = async (cfiRange:string) => {
        setHighlightedCfi(cfiRange)
        document.getElementById(cfiRange)?.scrollIntoView()
    }

    //Save current location, set section and page content
    useEffect(() => {
        if(!location) return
        if(!location.includes("epubcfi")) return
        const start = renditionRef.current.currentLocation().start
        const end = renditionRef.current.currentLocation().end
        if(!start || !end) return
        const section = renditionRef.current.book.spine.get(start.cfi)

        //Save location
        currentLocation.current = {
            sectionCanonical:section.canonical,
            page:location
        }
        //Set current section
        setSectionCanonical(section.canonical)
        //Get page content
        const splitCfi = start.cfi.split('/')
        const baseCfi = splitCfi[0] + '/' + splitCfi[1] + '/' + splitCfi[2] + '/' + splitCfi[3]
        const startCfi = start.cfi.replace(baseCfi, '')
        const endCfi = end.cfi.replace(baseCfi, '')
        const rangeCfi = [baseCfi, startCfi, endCfi].join(',')
        const pageContent = renditionRef.current.getRange(rangeCfi).toString().replace(/\s/g,' ')
        const pageContentClean = pageContent.replace(/\s/g,' ').replace(/\s{2,}/g, ' ')
        setPageContent(pageContentClean)
    }, [location])

    //Set Highlights
    useEffect(() => {
        if(nbReqLoading>0) return
        if(!toggleHighlights) return
        if(!location) return
        if(!location.includes("epubcfi")) return
        const start = renditionRef.current.currentLocation().start
        if(!start) return

        //Handling large sections. LIMITATIONS: Cannot get proper page content yet
        const section = renditionRef.current.book.spine.get(start.cfi)
        const pageNumber = start.displayed.total
        const contexts = splitSectionContext(section.contents.textContent, pageNumber)
        const batchSize = 5
        highlightAll(section, contexts, batchSize)

    }, [location, toggleHighlights])

    //Show/Hide higlights
    useEffect(() => {
        if(!renditionRef.current) return
        if(!toggleHighlights){
            Object.keys(renditionRef.current.annotations._annotations).forEach(key=>{
                const annotation = renditionRef.current.annotations._annotations[key]
                annotations[key] = renditionRef.current.annotations._annotations[key]
                renditionRef.current.annotations.remove(annotation.cfiRange, annotation.type)
            })
        } else {
            Object.keys(annotations).forEach(key=>{
                const annotation = annotations[key]
                renditionRef.current.annotations.add(
                    annotation.type,
                    annotation.cfiRange,
                    annotation.data,
                    annotation.cb,
                    annotation.className,
                    annotation.styles
                )
            })
        }        
    }, [toggleHighlights])

    //Change color of highlight when selected
    useEffect(() => {
        if(!highlightedCfi) return
        if(!renditionRef.current) return
        renditionRef.current.display(highlightedCfi)

        if(toggleHighlights){
            Object.keys(renditionRef.current.annotations._annotations).forEach(key=>{
                const annotation = renditionRef.current.annotations._annotations[key]
                annotations[key] = renditionRef.current.annotations._annotations[key]
                renditionRef.current.annotations.remove(annotation.cfiRange, annotation.type)
            })
            Object.keys(annotations).forEach(key=>{
                const annotation = annotations[key]
                renditionRef.current.annotations.add(
                    annotation.type,
                    annotation.cfiRange,
                    annotation.data,
                    annotation.cb,
                    highlightedCfi == annotation.cfiRange ? "highlighted":"highlight",
                    annotation.styles
                )
            })
        }
    }, [highlightedCfi])

    useEffect(() => {
        if(Object.keys(highlights).length) setShowPanel(true)
    },[highlights])

    return (
        <div className='h-full w-full flex relative'>
            <div className={`h-full ${showPanel?"w-2/3":"w-full"} pt-8 transition-all duration-500 flex flex-row relative justify-center`}>
                <Background currentPage={currentLocation.current ? currentLocation.current.page : null} context={pageContent??""}/>
                <div className='h-full w-[38rem] relative'>
                    <ReactReader
                        location={location}
                        locationChanged={locationChanged}
                        url={url.current}
                        epubInitOptions={{
                            openAs: 'epub'
                        }}
                        getRendition={rendition => {
                            renditionRef.current = rendition
                        }}
                    />
                    <div className="top-[10px] right-[10px] z-50 absolute flex">
                    <ButtonHighlight 
                        nbReqLoading={nbReqLoading} 
                        toggleHighlights={toggleHighlights} 
                        setToggleHighlights={setToggleHighlights}/>
                    </div>
                </div>
            </div>
            <div className={`h-full ${showPanel?"w-1/3":"w-0"} transition-all duration-500 bg-white`}>
                <HighlightPanel 
                    sectionCanonical={sectionCanonical?sectionCanonical:''}
                    highlights={highlights}
                    highlightedCfi={highlightedCfi}
                    setHighlightedCfi={setHighlightedCfi}
                    isLoading={nbReqLoading>0?true:false}
                    retryHighlight={retryHighlight}
                    />
            </div>
        </div>
            
    )
}
