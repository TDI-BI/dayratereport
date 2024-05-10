export const getPort = () => {
    if (process.env.NODE_ENV=='development') return '3000'
    return '8080'
}