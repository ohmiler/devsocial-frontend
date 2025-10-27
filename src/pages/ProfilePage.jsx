import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import PostItem from '../components/posts/PostItem'
import { AuthContext } from '../context/AuthContext'
import PostForm from '../components/posts/PostForm'
import { useInView } from 'react-intersection-observer'

function ProfilePage() {

    const { username } = useParams()
    const [profile, setProfile] = useState(null)
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const { user: loggedInUser, isAuthenticated } = useContext(AuthContext)
    const [file, setFile] = useState(null)

    const [page, setPage] = useState(1)
    const [loadingPosts, setLoadingPosts] = useState(false)
    const [hasMore, setHasMore] = useState(true)

    const { ref, inView } = useInView({
        threshold: 0
    })

    const onFileChange = (e) => {
        setFile(e.target.files[0])
    }

    const onUpload = async (e) => {
        e.preventDefault() 
        if (!file) {
            return alert('Please select a file to upload.')
        }
        const formData = new FormData()
        formData.append('avatar', file)

        try {
            const res = await axios.post('/api/users/me/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            setProfile({ ...profile, profilePicture: res.data.profilePicture })
            alert('Profile picture updated!')

        } catch(err) {
            console.error(err)
            alert(err.response?.data?.msg || 'Upload failed')
        }
    }

    const onDeletePicture = async () => {
        if (window.confirm('Are you sure you want to delete your profile picture?')) {
            try {
                await axios.delete('/api/users/me/avatar')
                setProfile({ ...profile, profilePicture: '' })
                alert('Profile picture removed!')
            } catch(err) {
                console.error(err)
                alert(err.response?.data?.msg || 'Failed to delete picture')
            }
        }
    }

    const fetchMorePosts = async () => {
        if (loadingPosts || !hasMore) return 
            setLoadingPosts(true)
            const res = await axios.get(`/api/users/${username}/posts?page=${page}&limit=5`)
        if (res.data.posts.length === 0) {
            setHasMore(false)
        } else {
            setPosts(prevPosts => [...prevPosts, ...res.data.posts])
            setPage(prevPage => prevPage + 1)
        }
        setLoadingPosts(false)
    }

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                 setLoading(true)
                 setLoadingPosts(true)
                 const profileRes = await axios.get(`/api/users/${username}`)
                 setProfile(profileRes.data)
            } catch(err) {
                console.error(err)
            } finally {
                setLoading(false)
                setLoadingPosts(false)
            }
        }
        fetchProfileData()
    }, [username])

    useEffect(() => {
        if (inView && hasMore) {
          fetchMorePosts()
        }
      }, [inView, hasMore])

    const handlePostUpdated = (updatedPost) => {
        setPosts(posts.map(p => (p._id === updatedPost._id ? updatedPost : p)))
    }

    const handlePostDeleted = (postId) => {
        setPosts(posts.filter(p => p._id !== postId))
    }

    const handleNewPost = (newPost) => {
        setPosts([newPost, ...posts])
    }

    if (loading) return <p>Loading profile...</p> 
    if (!profile) return <p>User not found.</p> 

  return (
    <div>
        <div className='bg-gray-800 text-white p-8 rounded-lg shadow-md mb-8 text-center'>
            
            <div className='w-32 h-32 bg-blue-500 rounded-full mx-auto mb-4'>
                {profile.profilePicture ? (
                    <img 
                        src={`${profile.profilePicture}`}
                        alt={profile.username}
                        className='w-full h-full rounded-full object-cover'
                    />
                ) : (
                    <div className='w-full h-full bg-blue-500 rounded-full flex items-center justify-center font-bold text-4xl'>
                        {profile.username.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>

            <h1 className='text-3xl font-bold'>{profile.username}</h1>
            <p className='text-gray-400'>{profile.email}</p>
            {loggedInUser && loggedInUser.username === profile.username && (
                <div>
                    <form onSubmit={onUpload} className='mt-4'>
                        <input type="file" onChange={onFileChange} className='bg-gray-300 text-black cursor-pointer text-sm border rounded-sm p-2' />
                        <button type='submit' className='bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 px-4 rounded-md ml-2'>
                            Upload
                        </button>
                    </form>

                    {profile.profilePicture && (
                        <button onClick={onDeletePicture} className='bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 px-4 mt-4 rounded-md'>
                            Delete Picture
                        </button>
                    )}
                </div>
            )}
        </div>

        {isAuthenticated && <PostForm onNewPost={handleNewPost} />}

        <h2 className='text-2xl font-bold mb-4'>Posts by {profile.username}</h2>
        <div className='text-white space-y-6'>
            {posts.map(post => (
                <PostItem key={post._id} post={post} onPostUpdated={handlePostUpdated} onPostDeleted={handlePostDeleted} />
            ))}
        </div>

        <div className='text-center mt-5'>
          {loadingPosts && <div>Loading more posts...</div>}
          {!hasMore && <div>No more posts to load.</div>}
          <div ref={ref} style={{ height: '1px'}}></div>
        </div>
    </div>
  )
}

export default ProfilePage