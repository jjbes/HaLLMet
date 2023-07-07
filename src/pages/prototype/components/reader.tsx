import React, { useRef, useState, useEffect } from 'react'
import { ReactReader } from 'react-reader'
import { get_encoding } from "@dqbd/tiktoken"

import ButtonHighlight from './reader/button-highlight'
import HighlightPanel from './reader/highlight-panel'

let excerptList: string[] = []

type ReaderProps = {
    file: Blob
}

const Reader = ({file}: ReaderProps) => {
    //Handle different screen sizes
    const [fontSize, setFontSize] = useState(100)
    useEffect(() => {
        if (window.screen.availHeight > 800) {
            setFontSize(130)
        }
    }, [])

    const blob = new Blob([file])
    const url = useRef<string>(URL.createObjectURL(blob))
    const renditionRef = useRef<any>(null)
    const currentLocation = useRef<any>(null)

    const [sectionCanonical, setSectionCanonical] = useState<string|null>(null)
    const [location, setLocation] = useState<string>("0")
    const [annotations, _] = useState<any>({})

    const [nbReqLoading, setNbReqLoading] = useState<number>(0)
    const [isLoadingMoreBatch, setIsLoadingMoreBatch] = useState<boolean>(false)
    const [toggleHighlights, setToggleHighlights] = useState<boolean>(true)
    const [highlights, setHighlights] = useState<Object>({})
    const [highlightedCfi, setHighlightedCfi] = useState<string|null>(null)
    const [showPanel, setShowPanel] = useState<boolean>(false)

    const [sectionAccuracies, setSectionAccuracies] = useState<Object>({})
    const getExcerpt = async (context: string) => {
        return fetch(`${process.env.NEXT_PUBLIC_API_URL}/excerpt`, {
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

    const findInString = (query: string, text: string) => {
        const specialChars = /[\p{P}\p{S}]/gu
        const whitespace = /\s/g
        const re = new RegExp(query
            .replaceAll(specialChars, '[\\s\\S]?')
            .replaceAll(whitespace, '\\s*'), "gmi")
        const match = re.exec(text)
        return match
    }

    const highlightOne = async (section:any, context:string, indexHighlight:number) => {
        const excerpts = await getExcerpt(context)
        .finally(()=>{
            setNbReqLoading((val) => val - 1)
        })
        .catch(e => {
            console.error('API call error :', e.name, e.message)
        })
        if(!excerpts) return

        const chunkHighlights = excerpts.replace(/(\d\.\s)/g, "|")
                            .replaceAll("\n", '')
                            .split("|")
                            .filter((element:any) => element != "")

        setSectionAccuracies((sectionAccuracies: any) => ({
            ...sectionAccuracies,
            [section.canonical]: {
                ...sectionAccuracies[section.canonical],
                total: sectionAccuracies[section.canonical].total + (chunkHighlights.length??0)
            }
        }))                    

        chunkHighlights.forEach((highlight: string, chunkIndex:number) => {
            if(!highlight) return
            //Remove trailing spaces and quotes
            highlight = highlight.trim().replace(/^"(.*)"$/, '$1')

            renditionRef.current.book.loaded.spine.then((spine:any) => {
                const textContent = spine.get(section.href).contents.lastElementChild.textContent

                const match = findInString(highlight, textContent)
                
                const getCfi = (match:any) => {
                    if(match){
                        const originalText = textContent?.substring(match.index, match.index+match[0].length)
                        let foundExcerpt = section.find(originalText)

                        if(!foundExcerpt.length){
                            //Slower than find(), only when text is not in a single node; 
                            //look for the text in 5 sequential nodes
                            foundExcerpt = section.search(originalText, 5)
                        }
                        if(foundExcerpt.length) return foundExcerpt[0].cfi
                    }
                    return null
                }
                const cfi = getCfi(match)

                if(cfi){
                    renditionRef.current.annotations.add(
                        'highlight',
                        cfi,
                        {},
                        ()=>{ highlightCfi(cfi) },
                        'highlight',
                        null
                    )

                    setHighlights((highlights: any) => ({
                        ...highlights,
                        [section.canonical]: {
                            ...highlights[section.canonical],
                            [indexHighlight]: {
                                ...highlights[section.canonical][indexHighlight],
                                highlights: {
                                    ...highlights[section.canonical][indexHighlight].highlights,
                                    [chunkIndex]:{
                                        content:highlight,
                                        href:cfi
                                    }
                                },
                                context:context

                            }
                        }
                    }))
                    setSectionAccuracies((sectionAccuracies: any) => ({
                        ...sectionAccuracies,
                        [section.canonical]: {
                            ...sectionAccuracies[section.canonical],
                            correct:sectionAccuracies[section.canonical].correct + 1
                        }
                    }))
                }  
            })
            

        })
    }

    //TODO: 
    //- Prompts
    const highlightAll = async(section:any, contexts:Array<string>, batchSize:number) => {
        let position = 0
        setIsLoadingMoreBatch(true)

        if(!(section.canonical in sectionAccuracies)) {
            setSectionAccuracies((sectionAccuracies: any) => ({
                ...sectionAccuracies,
                [section.canonical]: {
                    correct: 0,
                    total: 0
                }
            }))
        }

        while (position < contexts.length) {

            if((position + batchSize)>=contexts.length){
                setIsLoadingMoreBatch(false)
            }

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
    }, [location])

    //Set Highlights
    useEffect(() => {
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

    const showHighlights = () => {
        if(!Object.keys(highlights).length) return
        if(nbReqLoading>0) return
        setShowPanel(!showPanel)
        setToggleHighlights(!toggleHighlights)
    }

    return (
        <div className='h-full w-full flex relative overflow-hidden'>
            <div className={`h-full ${showPanel?"w-2/3":"w-full"} pt-[2.5%] transition-all duration-500 flex flex-row relative justify-center`}>
<               div className='h-full w-[38rem] relative'>
                    <ReactReader
                        location={location}
                        locationChanged={locationChanged}
                        url={url.current}
                        epubInitOptions={{
                            openAs: 'epub'
                        }}
                        getRendition={rendition => {
                            renditionRef.current = rendition
                            renditionRef.current.themes.fontSize(`${fontSize}%`)
                        }}
                    />
                    <div 
                        className="top-[10px] right-[10px] z-50 absolute flex"
                        onClick={() => showHighlights()}>
                        <ButtonHighlight 
                            nbReqLoading={nbReqLoading} 
                            toggleHighlights={toggleHighlights}/>
                    </div>
                </div>
            </div>
            <div className={`h-full ${showPanel?"w-1/3":"w-0"} transition-all duration-500 bg-slate-50`}>
                <HighlightPanel 
                    sectionCanonical={sectionCanonical?sectionCanonical:''}
                    highlights={highlights}
                    highlightedCfi={highlightedCfi}
                    setHighlightedCfi={setHighlightedCfi}
                    isLoadingBatch={nbReqLoading>0?true:false}
                    isLoadingMoreBatch={isLoadingMoreBatch}
                    retryHighlight={retryHighlight}
                    sectionAccuracies={sectionAccuracies}
                    />
            </div>
        </div>
            
    )
}

export default Reader