import React, { useState } from 'react'
import api from '../lib/api'

export default function Login(){
  const [email,setEmail] = useState('admin@example.com')
  const [password,setPassword] = useState('admin123')
  const [msg,setMsg] = useState('')

  const submit = async (e)=>{
    e.preventDefault()
    setMsg('')
    try{
      const {data} = await api.post('/api/auth/login',{email,password})
      localStorage.setItem('token', data.token)
      setMsg('Logged in! Go to Teams page.')
    }catch(e){
      setMsg(e?.response?.data?.message || 'Login failed')
    }
  }

  return (
    <form onSubmit={submit} style={{display:'grid', gap:8, maxWidth:320}}>
      <h3>Login</h3>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email"/>
      <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" type="password"/>
      <button>Login</button>
      <div>{msg}</div>
    </form>
  )
}
