import React, {ReactNode} from 'react'
import QA from './components/qa'
import Summary from './components/summary'
import Rephrase from './components/rephrase'
import Compression from './components/compression'
import Translation from './components/translation'
import Triples from './components/triples'
import TriplesEmoji from './components/triples_emoji'
import Highlight from './components/highlight'

type CardProps = {
    title:string
    content:ReactNode 
}
const Card = ({ title, content }: CardProps) => { 
    return (
        <div className="w-1/2 px-2 h-full">
        <div className="h-full py-2">
            <div className="h-1/12 bg-blue-500 text-white text-xs font-bold rounded-t px-2 py-1">
                {title}
            </div>
            <div className='h-11/12'>
                {content}
            </div>
        </div>
    </div>
    )
}

type ExampleProps = {
    infos:any|null
    context:string|null
}
export default ({infos, context}: ExampleProps) => {
    return (
        <div className='h-full'>
            <div className="px-2 h-1/2">
                <div className="flex -mx-2 h-full">
                    <Card title={"Question-Answering"} content={<QA context={context}></QA>}></Card>
                    <Card title={"Highlight"} content={<Highlight context={context}></Highlight>}></Card>
                </div>
            </div>

            <div className="px-2 h-1/2">
                <div className="flex -mx-2 h-full">
                    <Card title={"Triples"} content={<Triples context={context}></Triples>}></Card>
                    <Card title={"Triples Emoji"} content={<TriplesEmoji context={context}></TriplesEmoji>}></Card>
                </div>
            </div>

            <div className="px-2 h-1/2">
                <div className="flex -mx-2 h-full">
                    <Card title={"Summary"} content={<Summary infos={infos} context={context}></Summary>}></Card>
                    <Card title={"Compression"} content={<Compression context={context}></Compression>}></Card>
                </div>
            </div>
           
            <div className="px-2 h-1/2">
                <div className="flex -mx-2 h-full">
                    <Card title={"Rephrasing"} content={<Rephrase context={context}></Rephrase>}></Card>
                    <Card title={"Translation"} content={<Translation context={context}></Translation>}></Card>
                </div>
            </div>
        </div>
    )
}