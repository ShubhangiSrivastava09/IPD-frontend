import React, { useEffect, useState, useContext } from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components'
import { getRequest } from '../Helpers'
import { useNavigate } from 'react-router-dom'
import { deleteCookie } from '../Hooks/cookie'
import { AppContext } from '../Context/AppContext'
import { useRoles } from '../Context/AuthContext'
import { useSelector } from 'react-redux'

const DefaultLayout = () => {
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const { setRole } = useRoles()
  const { setUser } = useContext(AppContext)
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)

  // Sidebar width: 256px expanded, 56px collapsed/unfoldable
  const sidebarWidth = !sidebarShow ? 0 : unfoldable ? 56 : 256

  useEffect(() => {
    const savedUser = localStorage.getItem('IPD')
    const parsedUser = savedUser ? JSON.parse(savedUser) : null
    setUserData(parsedUser)

    getRequest('users/me')
      .then((res) => {
        const profile = res?.data?.data
        setUser(profile)
        setRole(profile?.role)
      })
      .catch((error) => {
        if (error.response?.status === 401) {
          deleteCookie('IPD')
          deleteCookie('UserId')
          navigate('/login')
        } else {
          console.error('API Error:', error)
        }
      })
  }, [navigate, setUser])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f2f5' }}>

      {/* ── Sidebar: fixed, left ── */}
      <AppSidebar userData={userData} />

      {/* ── Right side: everything beside the sidebar ── */}
      <div
        style={{
          // marginLeft: sidebarWidth,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          transition: 'margin-left 0.3s ease',
          minWidth: 0,
        }}
      >
        {/* ── Header: spans full width of the right panel ── */}
        <AppHeader userData={userData} />

        {/* ── Page content ── */}
        <div style={{ flex: 1, padding: '0px', overflowY: 'auto' }}>
          <AppContent userData={userData} />
        </div>

        <AppFooter userData={userData} />
      </div>
    </div>
  )
}

export default DefaultLayout