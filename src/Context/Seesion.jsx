import { createContext, useEffect, useState } from 'react'
import { getRequest } from '../Helpers/index'

export const SessionContext = createContext(null)

export const SessionProvider = ({ children }) => {
  const [currentSession, setCurrentSession] = useState(null)
  const [sessionsList, setSessionsList] = useState([])
  const [sessionsList1, setSessionsList1] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await getRequest('sessions?isCurrent=true&isPagination=false')
        const sessions = res?.data?.data?.sessions || []

        setSessionsList(sessions)

        const activeSession = sessions.find((s) => s.isCurrent)
        setCurrentSession(activeSession || null)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    const fetchSession1 = async () => {
      try {
        const res = await getRequest('sessions?isPagination=false')
        const sessions = res?.data?.data?.sessions || []

        setSessionsList1(sessions)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchSession1()
    fetchSession()
  }, [])

  return (
    <SessionContext.Provider value={{ currentSession, sessionsList, loading, sessionsList1 }}>
      {children}
    </SessionContext.Provider>
  )
}
