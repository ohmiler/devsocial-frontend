import React, { createContext, useEffect, useReducer } from 'react'
import axios from 'axios'

const AuthContext = createContext()

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            return { ...state, ...action.payload, isAuthenticated: true, loading: false, }
        case 'USER_LOADED':
            return { ...state, isAuthenticated: true, loading: false, user: action.payload }
        case 'AUTH_ERROR':
        case 'LOGOUT':
            localStorage.removeItem('token')
            return { ...state, token: null, isAuthenticated: false, loading: false, user: null }
        default:
            return state
    }
}

 const setAuthToken = (token) => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
        delete axios.defaults.headers.common['Authorization']
    }
}

const AuthProvider = ({ children }) => {
    const initialState = {
        token: localStorage.getItem('token'),
        isAuthenticated: null,
        loading: true,
        user: null
    }

    const [state, dispatch] = useReducer(authReducer, initialState)

    console.log(state)

    const loadUser = async () => {
        if (localStorage.token) {
            setAuthToken(localStorage.token)
        }
        try {
            const res = await axios.get('/api/auth')
            dispatch({ type: 'USER_LOADED', payload: res.data })
        } catch(err) {
            console.error(err.message)
            dispatch({ type: 'AUTH_ERROR' })
        }
    }

    useEffect(() => {
        loadUser()
    }, [])

    const login = async (formData) => {
        try {

            const res = await axios.post('/api/auth/login', formData)
            const { token } = res.data

            localStorage.setItem('token', token)
            setAuthToken(token)

            dispatch({ type: 'LOGIN_SUCCESS', payload: res.data })
            loadUser()

        } catch(err) {
            dispatch({ type: 'AUTH_ERROR' })
            alert(err.response.data.msg)
        }
    }

    const logout = () => {
        dispatch({ type: 'LOGOUT' })
        setAuthToken(null)
    }

    return (
        <AuthContext.Provider
            value={{
                ...state,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export { AuthProvider, AuthContext }