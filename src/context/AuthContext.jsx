import React, { createContext, useState, useContext, useEffect } from 'react'
import { authAPI, userAPI } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const response = await userAPI.getCurrentUser()
        if (response.data.success) {
          setUser(response.data.data)
        }
      } catch (error) {
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      if (response.data.success) {
        const { token, ...userData } = response.data.data
        localStorage.setItem('token', token)
        
        // Fetch complete user data to ensure all fields including employeeId
        try {
          const userResponse = await userAPI.getCurrentUser()
          if (userResponse.data.success) {
            setUser(userResponse.data.data)
            return { success: true, data: userResponse.data.data }
          }
        } catch (error) {
          // Fallback to userData from login response
          setUser(userData)
          return { success: true, data: userData }
        }
        
        setUser(userData)
        return { success: true, data: userData }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const signup = async (userData) => {
    try {
      const response = await authAPI.signup(userData)
      if (response.data.success) {
        const { token, ...user } = response.data.data
        localStorage.setItem('token', token)
        
        // Fetch complete user data to ensure all fields including employeeId
        try {
          const userResponse = await userAPI.getCurrentUser()
          if (userResponse.data.success) {
            setUser(userResponse.data.data)
            return { success: true, data: userResponse.data.data }
          }
        } catch (error) {
          // Fallback to user data from signup response
          setUser(user)
          return { success: true, data: user }
        }
        
        setUser(user)
        return { success: true, data: user }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Signup failed' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    setUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
