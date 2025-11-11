import React, { useEffect, useState } from 'react'
import api from '../lib/api'

export default function Teams(){
  const [count,setCount] = useState(null)
  const [list,setList] = useState([])
  const [name,setName] = useState('')
  const [inst,setInst] = useState('')
  const [code,setCode] = useState('')
  const [msg,setMsg] = useState('')

  const load = async ()=>{
    try{
      const { data } = await api.get('/api/teams')
      setList(data)
      try{
        const c = await api.get('/api/teams/count')
        setCount(c.data.total)
      }catch(e){
        setCount('admin only')
      }
    }catch(e){
      setMsg('Failed to load teams')
    }
  }

  useEffect(()=>{ load() },[])

  const createTeam = async (e)=>{
    e.preventDefault()
    setMsg('')
    try{
      const {data} = await api.post('/api/teams',{name, institute: inst})
      setMsg('Team created: '+data.name+' (code: '+data.code+')')
      setName(''); setInst('')
      load()
    }catch(e){
      setMsg(e?.response?.data?.message || 'Create failed')
    }
  }

  const join = async (e)=>{
    e.preventDefault()
    setMsg('')
    try{
      await api.post('/api/teams/join',{code})
      setMsg('Joined team!')
      setCode(''); load()
    }catch(e){
      setMsg(e?.response?.data?.message || 'Join failed')
    }
  }

  return (
    <div style={{display:'grid', gap:16}}>
      <h3>Teams</h3>
      <div>Total teams: {count===null?'...':count}</div>

      <details open>
        <summary>Create Team</summary>
        <form onSubmit={createTeam} style={{display:'grid', gap:8, maxWidth:360}}>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Team name" required/>
          <input value={inst} onChange={e=>setInst(e.target.value)} placeholder="Institute (optional)"/>
          <button>Create</button>
        </form>
      </details>

      <details>
        <summary>Join Team by Code</summary>
        <form onSubmit={join} style={{display:'grid', gap:8, maxWidth:360}}>
          <input value={code} onChange={e=>setCode(e.target.value)} placeholder="e.g. T-CW1234" required/>
          <button>Join</button>
        </form>
      </details>

      <h4>All Teams</h4>
      <ul>
        {list.map(t=> <li key={t._id}>{t.name} — {t.institute || 'n/a'} — status: {t.status} — code: {t.code}</li>)}
      </ul>

      <div>{msg}</div>
    </div>
  )
}
