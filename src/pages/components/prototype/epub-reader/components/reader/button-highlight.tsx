import React from 'react';

type DefaultBackgroundProps = {
    nbReqLoading: number,
    displayHighlight: boolean,
    setDisplayHighlight: Function
}
export default ({ displayHighlight, nbReqLoading, setDisplayHighlight }: DefaultBackgroundProps) => {    
    return (
        <button className={(nbReqLoading>0 ? "cursor-not-allowed " : "") + (displayHighlight ? "bg-yellow-200 ring ring-yellow-300 hover:bg-yellow-300 ": "bg-slate-100 ring ring-slate-100 hover:bg-slate-200 ") + "h-8 w-8 ml-[14px] flex items-center justify-center rounded"}
                onClick={() => {
                    if(nbReqLoading<=0) setDisplayHighlight(!displayHighlight)
                }}>
            {
                nbReqLoading>0 ?
                <svg className="animate-spin h-full w-full text-yellow-900 p-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                : 
                <>🖊️</>
            }
        </button>
    )
}