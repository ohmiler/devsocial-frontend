import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext'
import PostForm from '../components/posts/PostForm'
import PostItem from '../components/posts/PostItem'
import { useInView } from 'react-intersection-observer'

function HomePage() {

  const [posts, setPosts] = useState([])
  const { isAuthenticated } = useContext(AuthContext)

  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const { ref, inView } = useInView({
    threshold: 0
  })

  const fetchMorePosts = async () => {
    if (loading || !hasMore) return 
    setLoading(true)
    const res = await axios.get(`/api/posts?page=${page}&limit=5`)
    if (res.data.posts.length === 0) {
      setHasMore(false)
    } else {
      setPosts(prevPosts => [...prevPosts, ...res.data.posts])
      setPage(prevPage => prevPage + 1)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (inView && hasMore) {
      fetchMorePosts()
    }
  }, [inView, hasMore])

  const handleNewPost = (newPost) => {
    setPosts([newPost, ...posts])
  }

  const handlePostUpdated = (updatedPost) => {
    setPosts(posts.map(p => (p._id === updatedPost._id ? updatedPost : p)))
  }

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(p => p._id !== postId))
  }

  return (
    <div>
        <h1 className='text-4xl font-bold mb-6'>Developer Feed</h1>
        {isAuthenticated && <PostForm onNewPost={handleNewPost} />}
       
        <div className='text-white space-y-6'>
          {posts.map((post) => (
            <PostItem 
              key={post._id} 
              post={post} 
              onPostUpdated={handlePostUpdated}
              onPostDeleted={handlePostDeleted}
            />
          ))}
        </div>

        <div className='text-center mt-5'>
          {loading && <div>Loading more posts...</div>}
          {!hasMore && <div>No more posts to load.</div>}
          <div ref={ref} style={{ height: '1px'}}></div>
        </div>

    </div>
  )
}

export default HomePage