const requestPostResource = (resource:string , body:string, controller:AbortController) => {
    
    return fetch("http://127.0.0.1:8000/" + resource, {
        signal : controller ? controller.signal : null,
        method : "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body : body
    })
}

export default requestPostResource