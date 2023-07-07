import React from 'react'

import EpubReader from './prototype'

export default function Index() {
    return (
        <>
        <div className="h-full flex justify-center ">
            <div className="w-full text-center text-gray-700">
                <EpubReader/>
            </div>
        </div>
        </>
        
    )
}
