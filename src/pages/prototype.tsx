import React, { useState, useRef } from 'react'

import EpubReader from './components/prototype/epub-reader'

export default () => {
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
