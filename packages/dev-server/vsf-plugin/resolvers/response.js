export const handleResponse = obj => {
    return {
        code: 200,
        result: obj
    }
}

// TODO: handle error
export const handleError = err => {
    throw err
}
