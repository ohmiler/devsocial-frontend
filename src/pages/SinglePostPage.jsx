import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import PostItem from '../components/posts/PostItem'

function SinglePostPage() {

    const { id } = useParams()
    const navigate = useNavigate()
    const [post, setPost] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true)
                const res = await axios.get(`/api/posts/${id}`)
                setPost(res.data)
            } catch(err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchPost()
    }, [id])

    const handlePostDeleted = () => {
        alert('Post removed!')
        navigate('/')
    }

    const handlePostUpdated = (updatedPost) => {
        setPost(updatedPost)
    }

    if (loading) return <p className='text-center'>Loading post...</p>
    if (!post) return <p className='text-center text-red-500'>Post not found...</p>

  return (
    <div className='text-white space-y-6'>
        <Link to='/' className='bg-gray-800 p-3 text-white rounded-md mb-3 inline-block'>Go back</Link>
        <PostItem 
            post={post}
            onPostUpdated={handlePostUpdated}
            onPostDeleted={handlePostDeleted}
            isSinglePostView={true}
        />
    </div>
  )
}

export default SinglePostPage