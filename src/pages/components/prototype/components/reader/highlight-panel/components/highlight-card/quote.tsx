import React from 'react'

type QuoteProps = {
    content: string
    href: string
    highlightedCfi:string|null
    setHighlightedCfi:Function
}
export default ({ content, href, highlightedCfi, setHighlightedCfi }: QuoteProps) => {
    const eventClick = (cfiRange: string) => {
        setHighlightedCfi(cfiRange)
    }

    return (
    <div id={href} className="mt-4">
        <blockquote className={`p-4 border-l-4 ${href==highlightedCfi?"border-yellow-300 bg-yellow-50":"border-slate-300 bg-slate-100"} cursor-pointer`} onClick={() => {eventClick(href)}}>
            <svg aria-hidden="true" className="w-4 h-4 text-slate-400" viewBox="0 0 24 27" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.017 18L14.017 10.609C14.017 4.905 17.748 1.039 23 0L23.995 2.151C21.563 3.068 20 5.789 20 8H24V18H14.017ZM0 18V10.609C0 4.905 3.748 1.038 9 0L9.996 2.151C7.563 3.068 6 5.789 6 8H9.983L9.983 18L0 18Z" fill="currentColor"/></svg>
            <p className="italic text-sm text-left mb-4 font-serif pr-4">{content}</p>
        </blockquote>
    </div>
    )
}