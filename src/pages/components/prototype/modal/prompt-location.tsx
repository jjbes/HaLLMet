import React, { useEffect, useState } from 'react'
import Modal from 'react-modal'

type ModalProps = {
    prompt: string
    context: string|null
}

export default ({prompt, context}: ModalProps) => {
    const [modalIsOpen, setIsOpen] = React.useState(false)

    const openModal = () => {
        setIsOpen(true)
    }

    const closeModal = () =>{
        setIsOpen(false)
    }

    return (
    <div>
        <button style={{"zIndex":"9999999"}} className='absolute bottom-5 right-5 h-[20px] w-[20px] text-xs text-slate-400 border-slate-400 rounded-full border-dotted border-2' onClick={openModal}>?</button>
        <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            contentLabel="Example Modal"
            >
            <button className="absolute top-0 right-0 h-[30px] w-[30px] bg-white rounded-full p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500" 
                onClick={() => {closeModal()}}>✕</button>
            <div className="relative h-full pt-4 flex flex-row">
                <div className='h-full w-1/2'>
                    <div className='mb-2'>Prompt</div>
                    <div className="h-[calc(100%-24px)] text-sm p-4 font-mono text-left text-white whitespace-pre-wrap overflow-auto bg-slate-800 rounded">
                        {prompt}
                    </div> 
                </div>
                <div className='h-full w-1/2 ml-4'>
                    <div className='mb-2'>Context</div>
                    <div className="h-[calc(100%-24px)] text-sm tracking-wide p-4 font-serif text-left text-gray-700 whitespace-pre-wrap overflow-auto bg-slate-100 rounded">
                        {context?context:"empty context"}
                    </div>  
                </div>
            </div>
        </Modal>
    </div>
    )
}