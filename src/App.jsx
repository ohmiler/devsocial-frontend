import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import SinglePostPage from './pages/SinglePostPage'

function App() {

  return (
    <Router>
      <Navbar />

      <main className='container mx-auto p-8'>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/:username' element={<ProfilePage />} />
          <Route path='/post/:id' element={<SinglePostPage />} />
        </Routes>
      </main>
    </Router>
  )
}

export default App
