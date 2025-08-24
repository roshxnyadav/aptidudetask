import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import axios from '../../api/axios'
import { 
    PencilIcon, 
    TagIcon, 
    ChatBubbleBottomCenterTextIcon,
    XMarkIcon,
    ArrowUturnLeftIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline'
import OptimizedImage from '../../components/common/OptimizedImage'

const NewDiscussion = () => {
    const navigate = useNavigate()
    const { user } = useContext(AuthContext)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'General',
        tags: []
    })
    const [newTag, setNewTag] = useState('')

    const categories = [
        'General',
        'Study',
        'Exams',
        'Career',
        'Feedback',
        'Other'
    ]

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (formData.tags.length === 0) {
            setError('Please add at least one tag')
            return
        }
        setLoading(true)
        setError('')

        try {
            const token = localStorage.getItem('authToken')
            if (!token) {
                throw new Error('No auth token found. Please log in again.')
            }

            await axios.post('/api/discussions', formData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            navigate('/discuss')
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    const handleAddTag = (e) => {
        e.preventDefault()
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            if (formData.tags.length >= 5) {
                setError('Maximum 5 tags allowed')
                return
            }
            if (newTag.length > 20) {
                setError('Tag must be less than 20 characters')
                return
            }
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()]
            }))
            setNewTag('')
            setError('')
        }
    }

    const removeTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }))
    }

    return (
        <div className="container mx-auto px-4 py-4 max-w-4xl mt-16">
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body p-4 sm:p-6">
                    <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <OptimizedImage 
                                src={user?.profilePicture || '/default-avatar.png'} 
                                alt="User Avatar" 
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold">Create New Discussion</h1>
                                <p className="hidden sm:block text-sm sm:text-base text-base-content/70">Share your thoughts with the community</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => navigate('/discuss')} 
                            className="btn btn-ghost gap-1 sm:gap-2 shrink-0"
                        >
                            <ArrowUturnLeftIcon className="w-5 h-5" />
                            <span className="hidden sm:inline">Back to Discussions</span>
                            <span className="sm:hidden">Back</span>
                        </button>
                    </div>

                    {error && (
                        <div className="alert alert-error mb-6 shadow-lg">
                            <InformationCircleIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                            <span className="text-sm sm:text-base">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6">
                            <div className="form-control sm:col-span-3">
                                <label className="label">
                                    <span className="label-text font-semibold flex items-center gap-2">
                                        <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                        Title
                                    </span>
                                </label>
                                <input 
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    className="input input-bordered w-full focus:input-primary h-12"
                                    placeholder="Enter a descriptive title"
                                    required
                                />
                            </div>

                            <div className="form-control sm:col-span-1">
                                <label className="label">
                                    <span className="label-text font-semibold flex items-center gap-2">
                                        <ChatBubbleBottomCenterTextIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                        Category
                                    </span>
                                </label>
                                <div className="dropdown dropdown-bottom w-full">
                                    <label 
                                        tabIndex={0} 
                                        className="btn btn-ghost border border-base-300 w-full h-12 flex justify-between items-center"
                                    >
                                        <div className="flex-1 text-left truncate">
                                            {formData.category}
                                        </div>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </label>
                                    <ul tabIndex={0} className="dropdown-content z-30 menu p-2 shadow bg-base-100 rounded-lg w-full mt-1 border border-base-300">
                                        {categories.map(category => (
                                            <li key={category}>
                                                <a 
                                                    className={formData.category === category ? 'active bg-base-200' : ''}
                                                    onClick={() => setFormData({...formData, category: category})}
                                                >
                                                    {category}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold flex items-center gap-2">
                                    <TagIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                    Tags
                                </span>
                                <span className="label-text-alt text-xs sm:text-sm">Maximum 5 tags, 20 characters each</span>
                            </label>
                            <div className="relative">
                                <div className="input input-bordered min-h-[3rem] flex flex-wrap items-center gap-2 p-2 focus-within:input-primary">
                                    {formData.tags.map(tag => (
                                        <div key={tag} 
                                            className="badge badge-primary gap-1 sm:gap-2 py-3 text-xs sm:text-sm"
                                        >
                                            {tag}
                                            <button 
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="btn btn-ghost btn-xs btn-circle"
                                            >
                                                <XMarkIcon className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    <input
                                        type="text"
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        className="flex-1 bg-transparent border-none outline-none min-w-[120px] sm:min-w-[200px] focus:outline-none text-sm sm:text-base"
                                        placeholder={formData.tags.length === 0 ? "Add tags (press Enter)" : ""}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                handleAddTag(e)
                                            }
                                        }}
                                    />
                                </div>
                                <button 
                                    type="button"
                                    onClick={handleAddTag}
                                    className="btn btn-primary btn-sm absolute right-2 top-1/2 -translate-y-1/2"
                                    disabled={!newTag.trim()}
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold flex items-center gap-2">
                                    <ChatBubbleBottomCenterTextIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                    Content
                                </span>
                            </label>
                            <textarea 
                                value={formData.content}
                                onChange={(e) => setFormData({...formData, content: e.target.value})}
                                className="textarea textarea-bordered min-h-[170px] focus:textarea-primary text-sm sm:text-base"
                                placeholder="Write your discussion content here..."
                                required
                            />
                        </div>

                        <div className="card-actions justify-end pt-4 border-t gap-2">
                            <button 
                                type="button" 
                                className="btn btn-ghost h-12"
                                onClick={() => navigate('/discuss')}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className={`btn btn-primary h-12 ${loading ? 'loading' : ''}`}
                                disabled={loading}
                            >
                                {loading ? 'Creating...' : 'Create Discussion'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default NewDiscussion
