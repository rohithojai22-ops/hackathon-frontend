import axios from 'axios'

const api = axios.create({
  baseURL: import.meta?.env?.VITE_API_URL || process.env.VITE_API_URL || 'http://localhost:5000'
})

api.interceptors.request.use((config)=>{
  const token = (typeof localStorage!=='undefined') ? localStorage.getItem('token') : null
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
