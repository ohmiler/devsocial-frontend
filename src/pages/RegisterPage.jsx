import React, { useState } from 'react'
import axios from 'axios'

function RegisterPage() {

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    })

    const { username, email, password } = formData

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const onSubmit = async (e) => {
        e.preventDefault()

        try {
            const res = await axios.post('/api/auth/register', formData)
            console.log(res.data)
            alert('Registration successful! Please log in.')

            setFormData({
                username: '',
                email: '',
                password: ''
            })

        } catch(err) {
            console.error(err.response.data)
            alert(err.response.data.msg)
        }
    }

  return (
    <div className='flex flex-col items-center justify-center mt-10'>
        <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-md p-8">
            <h1 className='text-3xl text-white font-bold text-center mb-6'>Create Account</h1>
            <form onSubmit={onSubmit} className='space-y-6'>
                <div>
                    <input 
                        type="text"
                        placeholder='Username'
                        name="username"
                        value={username}
                        onChange={onChange}
                        required
                        className="w-full text-white p-3 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <input 
                        type="email"
                        placeholder='Email Address'
                        name="email"
                        value={email}
                        onChange={onChange}
                        required
                        className="w-full text-white p-3 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <input 
                        type="password"
                        placeholder='Password'
                        name="password"
                        value={password}
                        onChange={onChange}
                        minLength={6}
                        required
                        className="w-full text-white p-3 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <input type="submit" value="Register" className='w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md cursor-pointer transition-colors' />
            </form>
        </div>
    </div>
  )
}

export default RegisterPage