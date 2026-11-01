import axios from "axios"

const api = axios.create({
    baseUrl: "http://localhost:3000",
    withcredentials: true
})

export const sendMessage = async(formData)=> {
    const response = await api.post("/api/chat/message", formData)

    return response.data
}

export const askQuery = async({query})=> {
    const response = await api.post("/api/chat/ask", {
        query
    })

    return response.data
}

