type MessageProps = {
    content:string,
    type:string
}
export default ({content, type}:MessageProps) => {
    if(type == "user"){
        return (
        <div className='w-full p-4 flex justify-end '>
            <div className='max-w-[70%] p-4 min-h-[3rem] bg-blue-400 rounded-lg'>
                <p className='w-full break-words whitespace-normal text-left text-white'>{content}</p>
            </div>
        </div>
        )
    }else {
        return (
        <div className='w-full p-4 flex justify-start'>
            <div className='max-w-[70%] p-4 min-h-[3rem] bg-gray-100 rounded-lg'>
                <p className='w-full break-words whitespace-normal text-left text-black'>{content}</p>    
            </div>
        </div>
        )
    } 
}