import React, { useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { AuthContext } from '../../context/AuthContext'
import axios from 'axios'

const CommentItem = ({ comment, postId, onCommentUpdated, onCommentDeleted }) => {
    const { user: loggedInUser } = useContext(AuthContext)
    const [isEditing, setIsEditing] = useState(false)
    const [editedText, setEditedText] = useState(comment.text)
    const isAuthor = loggedInUser?._id === comment.author?._id

    const handleUpdate = async(e) => {
        e.preventDefault()

        try {
            const res = await axios.put(`/api/posts/${postId}/comments/${comment._id}`, { text: editedText })
            onCommentUpdated(res.data)
            setIsEditing(false)
        } catch(err) {
            console.error('Failed to update comment', err)
        }
    }

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            try {
                const res = await axios.delete(`/api/posts/${postId}/comments/${comment._id}`)
                onCommentDeleted(res.data)
            } catch(err) {
                console.error('Failed to delete comment', err)
            }
        }
    }

    return (
        <div>
            <div className='bg-gray-700 p-3 rounded-md w-full relative group'>
                {isAuthor && !isEditing && (
                    <div className='absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                        <button onClick={() => setIsEditing(true)} className='text-xs text-gray-400 hover:text-white'>✏️</button>
                        <button onClick={handleDelete} className='text-xs text-gray-400 hover:text-white'>🗑️</button>
                    </div>
                )}
                
                <Link to={`/${comment.author?.username}`} className='font-bold hover:underline text-sm'>{comment.author?.username}</Link>
                
                {isEditing ? (
                    <form onSubmit={handleUpdate} className='mt-2'>
                        <textarea 
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            className='w-full p-2 bg-gray-600 text-sm rounded-md focus:outline-none'
                        />
                        <div className='flex justify-end space-x-2 mt-1'>
                            <button type='button' onClick={() => setIsEditing(false)} className='text-xs text-gray-400 hover:text-white'>Cancel</button>
                            <button type='submit'className='text-xs text-blue-400 hover:text-blue-300 font-bold'>Save</button>
                        </div>
                    </form>
                ) : (
                    <p className='text-white mt-1'>{comment.text}</p>
                )}
            </div>
        </div>
    )
}

function PostItem({ post, onPostUpdated, onPostDeleted, isSinglePostView = false }) {

    const { user: loggedInUser, isAuthenticated } = useContext(AuthContext)
    const [likes, setLikes] = useState(post.likes)
    const [comments, setComments] = useState(post.comments)
    const [commentText, setCommentText] = useState('')
    const [showComments, setShowComments] = useState(false)

    // State for edit mode
    const [isEditing, setIsEditing] = useState(false)
    const [editedContent, setEditedContent] = useState(post.content)
    const [editedCode, setEditedCode] = useState(post.codeSnippet?.code || '')
    const isAuthor = loggedInUser?._id === post.author?._id

    const hasLiked = loggedInUser && likes.includes(loggedInUser._id)

    const handleLike = async () => {
        if (!isAuthenticated) return alert('Please log in to like a post')
        try {
            const res = await axios.put(`/api/posts/${post._id}/like`)
            setLikes(res.data)
        } catch(err) {
            console.error(err)
        }
    }

    const handleCommentSubmit = async (e) => {
        e.preventDefault()
        if (!isAuthenticated) return alert('Please login to comment')
        try {
            const res = await axios.post(`/api/posts/${post._id}/comment`, { text: commentText })
            setComments(res.data)
            setCommentText('')
            
        } catch(err) {
            console.error(err)
        }
    }
    
    const handleUpdate = async(e) => {
        e.preventDefault()

        const updatedPostData = {
            content: editedContent,
            codeSnippet: {
                ...post.codeSnippet,
                code: editedCode
            }
        }

        try {
            const res = await axios.put(`/api/posts/${post._id}`, updatedPostData)
            onPostUpdated(res.data)
            setIsEditing(false)

        } catch(err) {
            console.error(err)
            alert('Could not update post.')
        }
    }

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await axios.delete(`/api/posts/${post._id}`)
                onPostDeleted(post._id)
            } catch(err) {
                console.error(err)
                alert('Could not delete post')
            }
        }
    }

  return (
    <div className='bg-gray-800 p-6 rounded-lg shadow-md relative'>

        {isAuthor && (
            <div className='absolute top-4 right-4 flex space-x-2'>
                <button onClick={() => setIsEditing(!isEditing)} className='text-gray-400 hover:text-white'>✏️</button>
                <button onClick={handleDelete} className='text-gray-400 hover:text-white'>🗑️</button>
            </div>
        )}

        <div className="flex items-center mb-4">
            {/* --- Author Section --- */}

            <Link to={`/${post.author?.username}`} className='w-12 h-12 rounded-full mr-4 flex-shrink-0'>
                {post.author?.profilePicture ? (
                    <img 
                        src={`http://localhost:5000/${post.author.profilePicture}`}
                        alt={post.author.username}
                        className='w-full h-full rounded-full object-cover'
                    />
                ) : (
                    <div className="w-12 h-12 bg-blue-500 rounded-full mr-4 flex items-center justify-center font-bold text-xl">
                        {post.author?.username?.charAt(0).toUpperCase()}
                    </div>
                )}
            </Link>
            
            <div>
                <Link to={`/${post.author?.username}`} className='font-bold hover:underline'>{post.author.username}</Link>
                {isSinglePostView ? (
                    <p className='text-gray-400 text-sm'>
                        Posted on {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                ) : (
                    <p>
                    <Link to={`/post/${post._id}`} className='text-gray-400 text-sm hover:underline'>
                        Posted on {new Date(post.createdAt).toLocaleDateString()}
                    </Link>
                    </p>
                )}
                
            </div>
        </div>

        {isEditing ? (
            <form onSubmit={handleUpdate} className='mt-4 space-y-4'>
                <textarea 
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className='w-full p-3 bg-gray-700 rounded-md focus:outline-non focus:ring-2 focus:ring-blue-500'
                    rows="3"
                />
                <textarea 
                    value={editedCode}
                    onChange={(e) => setEditedCode(e.target.value)}
                    className='w-full p-3 bg-gray-700 font-mono text-sm rounded-md focus:outline-non focus:ring-2 focus:ring-blue-500'
                    rows="5"
                />
                <div className='flex justify-end space-x-2'>
                    <button type='button' onClick={() => setIsEditing(false)} className='bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md'>Cancel</button>
                    <button type='submit' className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md'>Save</button>
                </div>
            </form>
        ) : (
            <>
                {/* --- Content Section --- */}
                <p className='mb-4 whitespace-pre-wrap'>{post.content}</p>

                {post.codeSnippet && post.codeSnippet.code && (
                    <div className='mb-4'>
                        <SyntaxHighlighter language={post.codeSnippet.language} style={atomDark}>
                            {post.codeSnippet.code}
                        </SyntaxHighlighter>
                    </div>
                )}
            </>
        )}

        

        {/* --- Interaction Section --- */}
        <div className="flex items-center space-x-4 text-gray-400">
            <button onClick={handleLike} className={`flex items-center space-x-1 hover:text-white transition-colors ${hasLiked ? 'text-blue-400' : ''}`}>
                <span>👍</span>
                <span>{likes.length} Likes</span>
            </button>
            {!isSinglePostView && (
                <button onClick={() => setShowComments(!showComments)} className='flex items-center space-x-1 hover:text-blue-400'>
                    <span>💬</span>
                    <span>{comments.length} Comments</span>
                </button>
            )}
        </div>

        {/* --- Comments Section --- */}
        {(showComments || isSinglePostView) && (
            <div className='mt-4 pt-4 border-t border-gray-700'>
                {isAuthenticated && (
                    <form onSubmit={handleCommentSubmit} className='flex space-x-2 mb-4'>
                        <input 
                            type="text" 
                            value={commentText} 
                            onChange={e => setCommentText(e.target.value)} 
                            placeholder='Add a comment...' 
                            className='w-full p-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                        <button type='submit' className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md'>Post</button>
                    </form>
                )}
                <div className='space-y-3'>
                    {comments.map((comment) => (
                        <CommentItem 
                            key={comment._id}
                            comment={comment}
                            postId={post._id}
                            onCommentUpdated={setComments}
                            onCommentDeleted={setComments}
                        />
                    ))}
                </div>
            </div>
        )}

    </div>
  )
}

export default PostItem