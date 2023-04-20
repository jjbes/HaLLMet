import React from 'react'

import Card from './components/common/card'

import QA from './components/qa'
import Summary from './components/summary'
import Rephrase from './components/rephrase'
import Compression from './components/compression'
import Translation from './components/translation'
import Triples from './components/triples'
import TriplesEmoji from './components/triples_emoji'
import Highlight from './components/highlight'

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