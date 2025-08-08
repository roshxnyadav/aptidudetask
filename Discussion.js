import mongoose from 'mongoose'

const replySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    dislikes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    mentions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
})

// Make the schema recursive for nested replies
replySchema.add({
    replies: [replySchema]
})

const discussionSchema = new mongoose.Schema({
    questionId: {
        type: Number,
        required: false
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Questions', 'Solutions', 'General', 'Exams', 'Study', 'Career', 'Feedback', 'Other'],
        default: 'General'
    },
    approach: {
        type: String,
        enum: ['Logic', 'Stepwise', 'Formula', 'Shortcut', 'Other'],
        required: function() {
            return this.category === 'Solutions';
        }
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: 20
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    dislikes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    mentions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    replies: [replySchema],
    isPinned: {
        type: Boolean,
        default: false
    },
    views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
})

// Add comprehensive indexes for better query performance
// Basic lookup indexes
discussionSchema.index({ questionId: 1 }); // For finding discussions related to a question
discussionSchema.index({ userId: 1 }); // For finding user's discussions
discussionSchema.index({ category: 1 }); // For filtering by category
discussionSchema.index({ createdAt: -1 }); // For sorting by newest
discussionSchema.index({ views: -1 }); // For sorting by popularity
discussionSchema.index({ isPinned: -1, createdAt: -1 }); // For getting pinned discussions first

// Compound indexes for common query patterns
discussionSchema.index({ category: 1, createdAt: -1 }); // For category filtering + sorting
discussionSchema.index({ 
    questionId: 1, 
    createdAt: -1 
}); // For question discussions sorted by date
discussionSchema.index({ 
    category: 1, 
    views: -1 
}); // For popular discussions in a category

// Enhanced text search
discussionSchema.index({ 
    title: 'text', 
    content: 'text', 
    tags: 'text' 
}, {
    weights: {
        title: 10,
        content: 7,
        tags: 3
    },
    name: 'discussion_search_index'
});

const Discussion = mongoose.model('Discussion', discussionSchema)

export default Discussion
