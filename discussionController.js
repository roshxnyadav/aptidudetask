import Discussion from '../models/Discussion.js'
import User from '../models/User.js'

// Get discussions for a question
export const getQuestionDiscussions = async (req, res) => {
    try {
        const { questionId } = req.params
        const discussions = await Discussion.find({ 
            questionId: Number(questionId),
            category: { $ne: 'Solutions' } // Exclude Solutions category
        })
            .populate('userId', 'username profilePicture')
            .populate('mentions', 'username')
            .populate('replies.userId', 'username profilePicture')
            .populate('replies.mentions', 'username')
            .sort('-createdAt')

        res.json(discussions)
    } catch (error) {
        res.status(500).json({ message: 'Error fetching discussions', error: error.message })
    }
}

// Create a new discussion
export const createDiscussion = async (req, res) => {
    try {
        const { title, content, questionId, category, tags, approach } = req.body;
        const userId = req.user._id;

        // Extract mentions from content
        const mentions = [];
        const mentionRegex = /@(\w+)/g;
        let match;
        while ((match = mentionRegex.exec(content)) !== null) {
            const username = match[1];
            const mentionedUser = await User.findOne({ username });
            if (mentionedUser) {
                mentions.push(mentionedUser._id);
            }
        }

        const discussionData = {
            title,
            content,
            category,
            userId,
            mentions,
            tags
        };

        // Only add questionId if it's provided
        if (questionId) {
            discussionData.questionId = Number(questionId);
        }

        // Only add approach if category is Solutions
        if (category === 'Solutions') {
            if (!approach) {
                return res.status(400).json({ message: 'Approach is required for solutions' });
            }
            discussionData.approach = approach;
        }

        const discussion = new Discussion(discussionData);
        await discussion.save();
        
        const populatedDiscussion = await Discussion.findById(discussion._id)
            .populate('userId', 'username profilePicture')
            .populate('mentions', 'username');

        res.status(201).json(populatedDiscussion);
    } catch (error) {
        res.status(500).json({ message: 'Error creating discussion', error: error.message });
    }
};

// Add a reply to a discussion
export const addReply = async (req, res) => {
    try {
        const { discussionId } = req.params
        const { content, parentId } = req.body
        const userId = req.user._id

        // Extract mentions from content
        const mentions = []
        const mentionRegex = /@(\w+)/g
        let match
        while ((match = mentionRegex.exec(content)) !== null) {
            const username = match[1]
            const mentionedUser = await User.findOne({ username })
            if (mentionedUser) {
                mentions.push(mentionedUser._id)
            }
        }

        const discussion = await Discussion.findById(discussionId)
        if (!discussion) {
            return res.status(404).json({ message: 'Discussion not found' })
        }

        const newReply = {
            content,
            userId,
            mentions,
            replies: []
        }

        if (parentId) {
            // Find the parent reply and add this as a nested reply
            const parentReply = discussion.replies.id(parentId)
            if (!parentReply) {
                return res.status(404).json({ message: 'Parent reply not found' })
            }
            if (!parentReply.replies) {
                parentReply.replies = []
            }
            parentReply.replies.push(newReply)
        } else {
            // Add as a top-level reply
            discussion.replies.push(newReply)
        }

        await discussion.save()
        
        const updatedDiscussion = await Discussion.findById(discussionId)
            .populate('userId', 'username profilePicture')
            .populate('mentions', 'username')
            .populate('replies.userId', 'username profilePicture')
            .populate('replies.mentions', 'username')
            .populate('replies.replies.userId', 'username profilePicture')
            .populate('replies.replies.mentions', 'username')

        res.json(updatedDiscussion)
    } catch (error) {
        console.error('Server Error:', error)
        res.status(500).json({ message: 'Error adding reply', error: error.message })
    }
}

// Like a discussion or reply
export const likeDiscussion = async (req, res) => {
    try {
        const { discussionId } = req.params
        const userId = req.user._id
        const { replyId, nestedReplyId } = req.query

        const discussion = await Discussion.findById(discussionId)
        if (!discussion) {
            return res.status(404).json({ message: 'Discussion not found' })
        }

        if (replyId) {
            const reply = discussion.replies.id(replyId)
            if (!reply) {
                return res.status(404).json({ message: 'Reply not found' })
            }

            if (nestedReplyId) {
                // Handle nested reply like
                const nestedReply = reply.replies.id(nestedReplyId)
                if (!nestedReply) {
                    return res.status(404).json({ message: 'Nested reply not found' })
                }

                const likeIndex = nestedReply.likes.indexOf(userId)
                const dislikeIndex = nestedReply.dislikes.indexOf(userId)

                if (likeIndex === -1) {
                    nestedReply.likes.push(userId)
                    if (dislikeIndex !== -1) {
                        nestedReply.dislikes.splice(dislikeIndex, 1)
                    }
                } else {
                    nestedReply.likes.splice(likeIndex, 1)
                }
            } else {
                // Handle reply like
                const likeIndex = reply.likes.indexOf(userId)
                const dislikeIndex = reply.dislikes.indexOf(userId)

                if (likeIndex === -1) {
                    reply.likes.push(userId)
                    if (dislikeIndex !== -1) {
                        reply.dislikes.splice(dislikeIndex, 1)
                    }
                } else {
                    reply.likes.splice(likeIndex, 1)
                }
            }
        } else {
            // Handle discussion like
            const likeIndex = discussion.likes.indexOf(userId)
            const dislikeIndex = discussion.dislikes.indexOf(userId)

            if (likeIndex === -1) {
                discussion.likes.push(userId)
                if (dislikeIndex !== -1) {
                    discussion.dislikes.splice(dislikeIndex, 1)
                }
            } else {
                discussion.likes.splice(likeIndex, 1)
            }
        }

        await discussion.save()
        
        const updatedDiscussion = await Discussion.findById(discussionId)
            .populate('userId', 'username profilePicture')
            .populate('mentions', 'username')
            .populate('replies.userId', 'username profilePicture')
            .populate('replies.mentions', 'username')
            .populate('replies.replies.userId', 'username profilePicture')
            .populate('replies.replies.mentions', 'username')

        res.json(updatedDiscussion)
    } catch (error) {
        res.status(500).json({ message: 'Error liking discussion', error: error.message })
    }
}

// Dislike a discussion or reply
export const dislikeDiscussion = async (req, res) => {
    try {
        const { discussionId } = req.params
        const userId = req.user._id
        const { replyId, nestedReplyId } = req.query

        const discussion = await Discussion.findById(discussionId)
        if (!discussion) {
            return res.status(404).json({ message: 'Discussion not found' })
        }

        if (replyId) {
            const reply = discussion.replies.id(replyId)
            if (!reply) {
                return res.status(404).json({ message: 'Reply not found' })
            }

            if (nestedReplyId) {
                // Handle nested reply dislike
                const nestedReply = reply.replies.id(nestedReplyId)
                if (!nestedReply) {
                    return res.status(404).json({ message: 'Nested reply not found' })
                }

                const likeIndex = nestedReply.likes.indexOf(userId)
                const dislikeIndex = nestedReply.dislikes.indexOf(userId)

                if (dislikeIndex === -1) {
                    nestedReply.dislikes.push(userId)
                    if (likeIndex !== -1) {
                        nestedReply.likes.splice(likeIndex, 1)
                    }
                } else {
                    nestedReply.dislikes.splice(dislikeIndex, 1)
                }
            } else {
                // Handle reply dislike
                const likeIndex = reply.likes.indexOf(userId)
                const dislikeIndex = reply.dislikes.indexOf(userId)

                if (dislikeIndex === -1) {
                    reply.dislikes.push(userId)
                    if (likeIndex !== -1) {
                        reply.likes.splice(likeIndex, 1)
                    }
                } else {
                    reply.dislikes.splice(dislikeIndex, 1)
                }
            }
        } else {
            // Handle discussion dislike
            const likeIndex = discussion.likes.indexOf(userId)
            const dislikeIndex = discussion.dislikes.indexOf(userId)

            if (dislikeIndex === -1) {
                discussion.dislikes.push(userId)
                if (likeIndex !== -1) {
                    discussion.likes.splice(likeIndex, 1)
                }
            } else {
                discussion.dislikes.splice(dislikeIndex, 1)
            }
        }

        await discussion.save()
        
        const updatedDiscussion = await Discussion.findById(discussionId)
            .populate('userId', 'username profilePicture')
            .populate('mentions', 'username')
            .populate('replies.userId', 'username profilePicture')
            .populate('replies.mentions', 'username')
            .populate('replies.replies.userId', 'username profilePicture')
            .populate('replies.replies.mentions', 'username')

        res.json(updatedDiscussion)
    } catch (error) {
        res.status(500).json({ message: 'Error disliking discussion', error: error.message })
    }
}

// Search users for mentions
export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query
        if (!query) {
            return res.json([])
        }

        const users = await User.find({
            username: { $regex: query, $options: 'i' }
        })
        .select('username profilePicture')
        .limit(5)

        res.json(users)
    } catch (error) {
        res.status(500).json({ message: 'Error searching users', error: error.message })
    }
}

// Get discussion count for a question
export const getDiscussionCount = async (req, res) => {
    try {
        const { questionId } = req.params
        const count = await Discussion.countDocuments({ 
            questionId: Number(questionId),
            category: { $ne: 'Solutions' }
        })
        res.json({ count })
    } catch (error) {
        res.status(500).json({ message: 'Error fetching discussion count', error: error.message })
    }
}

// Get all discussions with filters
export const getAllDiscussions = async (req, res) => {
    try {
        const { filter, category, search } = req.query;
        let pipeline = [];

        // Match stage for filtering
        let match = {
            questionId: { $exists: false } // Only get discussions without questionId
        };

        // Apply category filter if provided
        if (category) {
            match.category = category;
        }

        // Apply search filter if provided
        if (search) {
            match.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }

        pipeline.push({ $match: match });

        // Add fields for sorting and calculating reply count
        pipeline.push({
            $addFields: {
                likesCount: { $size: { $ifNull: ['$likes', []] } },
                replyCount: { $size: { $ifNull: ['$replies', []] } }
            }
        });

        // Apply sort based on filter
        switch (filter) {
            case 'trending':
                pipeline.push({ $sort: { views: -1, createdAt: -1 } });
                break;
            case 'newest':
                pipeline.push({ $sort: { createdAt: -1 } });
                break;
            case 'oldest':
                pipeline.push({ $sort: { createdAt: 1 } });
                break;
            case 'most-liked':
                pipeline.push({ $sort: { likesCount: -1, createdAt: -1 } });
                break;
            default:
                pipeline.push({ $sort: { views: -1, createdAt: -1 } });
        }

        // Limit results
        pipeline.push({ $limit: 50 });

        // Execute the pipeline
        const discussions = await Discussion.aggregate(pipeline)
            .exec();

        // Populate the results
        await Discussion.populate(discussions, [
            { path: 'userId', select: 'username profilePicture' },
            { path: 'mentions', select: 'username' }
        ]);

        res.json(discussions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching discussions', error: error.message });
    }
};

// Get a single discussion by ID
export const getDiscussionById = async (req, res) => {
    try {
        const { id } = req.params
        const discussion = await Discussion.findById(id)
            .populate('userId', 'username profilePicture')
            .populate('mentions', 'username')
            .populate('replies.userId', 'username profilePicture')
            .populate('replies.mentions', 'username')
            .populate('replies.replies.userId', 'username profilePicture')
            .populate('replies.replies.mentions', 'username')

        if (!discussion) {
            return res.status(404).json({ message: 'Discussion not found' })
        }

        res.json(discussion)
    } catch (error) {
        console.error('Server Error:', error)
        res.status(500).json({ message: 'Error fetching discussion', error: error.message })
    }
}

// Increment view count
export const incrementViewCount = async (req, res) => {
    try {
        const { id } = req.params
        const discussion = await Discussion.findByIdAndUpdate(
            id,
            { $inc: { views: 1 } },
            { new: true }
        )

        if (!discussion) {
            return res.status(404).json({ message: 'Discussion not found' })
        }

        res.json({ success: true, views: discussion.views })
    } catch (error) {
        res.status(500).json({ message: 'Error updating view count', error: error.message })
    }
}

// Get solutions for a question
export const getQuestionSolutions = async (req, res) => {
    try {
        const { questionId } = req.params
        const solutions = await Discussion.find({ 
            questionId: Number(questionId),
            category: 'Solutions'
        })
            .populate('userId', 'username profilePicture')
            .populate('mentions', 'username')
            .populate('replies.userId', 'username profilePicture')
            .populate('replies.mentions', 'username')
            .sort('-createdAt')

        res.json(solutions)
    } catch (error) {
        res.status(500).json({ message: 'Error fetching solutions', error: error.message })
    }
}

// Edit a discussion
export const editDiscussion = async (req, res) => {
    try {
        const { discussionId } = req.params
        const { title, content, approach } = req.body
        const userId = req.user._id

        const discussion = await Discussion.findById(discussionId)
        if (!discussion) {
            return res.status(404).json({ message: 'Discussion not found' })
        }

        // Check if user is the owner
        if (discussion.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to edit this discussion' })
        }

        discussion.title = title
        discussion.content = content
        if (discussion.category === 'Solutions') {
            discussion.approach = approach
        }

        await discussion.save()
        
        const updatedDiscussion = await Discussion.findById(discussionId)
            .populate('userId', 'username profilePicture')
            .populate('mentions', 'username')
            .populate('replies.userId', 'username profilePicture')
            .populate('replies.mentions', 'username')

        res.json(updatedDiscussion)
    } catch (error) {
        res.status(500).json({ message: 'Error editing discussion', error: error.message })
    }
}

// Delete a discussion
export const deleteDiscussion = async (req, res) => {
    try {
        const { discussionId } = req.params
        const userId = req.user._id

        const discussion = await Discussion.findById(discussionId)
        if (!discussion) {
            return res.status(404).json({ message: 'Discussion not found' })
        }

        // Check if user is the owner
        if (discussion.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this discussion' })
        }

        await Discussion.findByIdAndDelete(discussionId)
        res.json({ message: 'Discussion deleted successfully' })
    } catch (error) {
        res.status(500).json({ message: 'Error deleting discussion', error: error.message })
    }
}
