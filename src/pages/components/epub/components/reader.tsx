import React, { useRef, useState, useEffect } from 'react'
import { ReactReader } from 'react-reader'

type ReaderProps = {
    setInfos:Function
    selections: any
    setSelections: Function
    file: Blob | MediaSource
}
export default ({setInfos, selections, setSelections, file }: ReaderProps) => {
    const [url, _] = useState(URL.createObjectURL(file))
    const [location, setLocation] = useState<string>("0")

    const renditionRef = useRef<any>(null)

    const locationChanged = (epubcifi: string) => {
        setLocation(epubcifi)
    }

    useEffect(() => {
        
        if (renditionRef.current) {
            (async () => {
                setInfos(await renditionRef.current.book.loaded.metadata)
            })()

            const removeMark = (cfirange:any, data:any, _:any) => {
                if(Date.now() - data.timestamp < 200) return;
                renditionRef.current.annotations.remove(cfirange, "highlight")
                setSelections(selections.filter((item: { cfiRange: string }) => item.cfiRange !== cfirange))
            }

            const setRenderSelection = (cfiRange: any) => {
                setSelections(
                    selections.concat({
                        text: renditionRef.current.getRange(cfiRange).toString(),
                        cfiRange
                    })
                )
                renditionRef.current.annotations.add(
                    'highlight',
                    cfiRange,
                    {"timestamp":Date.now()},
                    null,
                    'hl',
                    { fill: 'yellow', 'fill-opacity': '0.5', 'mix-blend-mode': 'multiply' }
                )
                const iframe = document.querySelectorAll("[id^='epubjs-container-']")[0].getElementsByTagName('iframe')[0]
                iframe.contentDocument!.getSelection()!.removeAllRanges()
            }

            const originalValue = { 
                curRange: '',
                mouseDown: 0,
            }
        
            let currentValue = new Proxy(originalValue, {
                set: (target, prop, value) => {
                    if(prop=="mouseDown" && value == 0){
                        if(target["curRange"] != ""){
                            setRenderSelection(target["curRange"])
                            target["curRange"]=""
                        }
                        target[prop] = value
                        return true
                    }
                    if(prop=="curRange" && value != "" && target["mouseDown"] == 0){
                        setRenderSelection(value)
                        target["curRange"]=""
                        return true
                    }
                    target[prop as keyof typeof prop] = value
                    return true
                }
            })

            renditionRef.current.on("mousedown", () => {
                currentValue.mouseDown = 1
            })
            renditionRef.current.on("mouseup", () => {
                currentValue.mouseDown = 0
            })
            
            const storeText = (cfiRange: string) => {
                currentValue.curRange = cfiRange
            }
            renditionRef.current.on("selected", storeText) 
            renditionRef.current.on("markClicked", removeMark) 

            return () => {
                renditionRef.current.off('selected', storeText)
                renditionRef.current.off('markClicked', removeMark)
            }
        }
    }, [setSelections, selections])

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
                        renditionRef.current.themes.default({
                        '::selection': {
                            background: 'yellow'
                        }
                        })
                        setSelections([])
                    }}
                />
            </div>
            
            <div className='h-full absolute h-full -right-5 overflow-y-hidden'>
                <ul>
                    {
                        selections.map(({ cfiRange }: any, i: React.Key | null | undefined) => (
                            <li key={i}>
                                <button className='bookmark'
                                    onClick={() => {
                                        renditionRef.current.display(cfiRange)
                                    }}
                                ></button>
                            </li>
                        ))
                    }
                </ul>
            </div>
        </div>
    )
}
