import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import {
    getQuestionDiscussions,
    createDiscussion,
    addReply,
    likeDiscussion,
    dislikeDiscussion,
    searchUsers,
    getDiscussionCount,
    getAllDiscussions,
    getDiscussionById,
    incrementViewCount,
    getQuestionSolutions,
    editDiscussion,
    deleteDiscussion
} from '../controllers/discussionController.js'

const router = express.Router()

// Get all discussions with filters
router.get('/', getAllDiscussions)

// Get discussions for a question
router.get('/question/:questionId', getQuestionDiscussions)

// Get solutions for a question
router.get('/question/:questionId/solutions', getQuestionSolutions)

// Get discussion count for a question
router.get('/question/:questionId/count', getDiscussionCount)

// Search users for mentions
router.get('/users/search', searchUsers)

// Get a single discussion
router.get('/:id', getDiscussionById)

// Create a new discussion
router.post('/', protect, createDiscussion)

// Add a reply to a discussion
router.post('/:discussionId/reply', protect, addReply)

// Like a discussion or reply
router.post('/:discussionId/like', protect, likeDiscussion)

// Dislike a discussion or reply
router.post('/:discussionId/dislike', protect, dislikeDiscussion)

// Edit a discussion
router.patch('/:discussionId', protect, editDiscussion)

// Delete a discussion
router.delete('/:discussionId', protect, deleteDiscussion)

// Increment view count - moved to match frontend URL pattern
router.post('/view/:id', incrementViewCount)

export default router 
