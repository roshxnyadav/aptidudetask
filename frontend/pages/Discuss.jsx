import { useState, useEffect, useContext, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import axios from '../../api/axios'
import moment from 'moment'
import { DiscussionSkeleton } from '../../components/skeletons/DiscussionSkeletons'
import RecentPostsSidebar from '../../components/discuss/RecentPostsSidebar'
import { 
    PlusIcon, 
    HandThumbUpIcon,
    HandThumbDownIcon,
    ChatBubbleLeftIcon,
    MapPinIcon,
    EyeIcon,
    MagnifyingGlassIcon,
    ChevronUpDownIcon,
    AdjustmentsHorizontalIcon,
    ClockIcon
} from '@heroicons/react/24/outline'
import { HandThumbUpIcon as HandThumbUpIconSolid } from '@heroicons/react/24/solid'
import { HandThumbDownIcon as HandThumbDownIconSolid } from '@heroicons/react/24/solid'
import OptimizedImage from '../../components/common/OptimizedImage'

// Static loading skeleton component for internal use
const DiscussLoadingSkeleton = () => {
    return (
        <>
            {/* Discussion List with skeleton items */}
            <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                    <DiscussionSkeleton key={index} />
                ))}
            </div>
        </>
    )
}

// Static sidebar component for loading state
const StaticSidebar = () => {
    return (
        <div className="bg-base-200/50 rounded-lg shadow-md h-full min-h-[calc(100vh-10rem)]">
            <div className="p-4 border-b border-base-300">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-primary" />
                    Recent Posts
                </h3>
            </div>
            
            <div className="p-4 text-center h-full flex flex-col justify-center items-center">
                <p className="text-sm text-base-content/70">
                    Posts you view will appear here.
                </p>
            </div>
        </div>
    )
}

const Discuss = () => {
    const { user } = useContext(AuthContext)
    const [discussions, setDiscussions] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('trending')
    const [category, setCategory] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [searchTimeout, setSearchTimeout] = useState(null)
    const navigate = useNavigate()
    
    // Add refs for the dropdown containers
    const sortMenuRef = useRef(null)
    const filterMenuRef = useRef(null)

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = () => {
            // We don't need the click outside handler for daisyUI dropdowns
            // DaisyUI handles this automatically with tabIndex
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const categories = [
        'General', 'Study', 'Exams', 'Career', 'Feedback', 'Other'
    ]

    const sortOptions = [
        { value: 'trending', label: 'Trending' },
        { value: 'newest', label: 'Newest First' },
        { value: 'oldest', label: 'Oldest First' },
        { value: 'most-liked', label: 'Most Liked' }
    ]

    const fetchDiscussions = useCallback(async () => {
        try {
            const params = {
                filter,
                category: category || undefined,
                search: searchQuery || undefined
            }

            const response = await axios.get('/api/discussions', { 
                params: Object.fromEntries(
                    Object.entries(params).filter(([, value]) => value !== undefined)
                )
            })
            setDiscussions(response.data)
        } catch (error) {
            console.error('Error fetching discussions:', error)
        } finally {
            setLoading(false)
        }
    }, [filter, category, searchQuery])

    useEffect(() => {
        fetchDiscussions()
    }, [fetchDiscussions])

    const handleLike = async (discussionId) => {
        try {
            const token = localStorage.getItem('authToken')
            await axios.post(`/api/discussions/${discussionId}/like`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            fetchDiscussions()
        } catch (error) {
            console.error('Error liking discussion:', error)
        }
    }

    const handleDislike = async (discussionId) => {
        try {
            const token = localStorage.getItem('authToken')
            await axios.post(`/api/discussions/${discussionId}/dislike`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            fetchDiscussions()
        } catch (error) {
            console.error('Error disliking discussion:', error)
        }
    }

    const handleSearchChange = (e) => {
        const query = e.target.value
        setSearchQuery(query)
        
        if (searchTimeout) {
            clearTimeout(searchTimeout)
        }

        const timeoutId = setTimeout(() => {
            setLoading(true)
            fetchDiscussions()
        }, 300)

        setSearchTimeout(timeoutId)
    }

    const handleDiscussionClick = (discussionId) => {
        navigate(`/discuss/${discussionId}`)
    }

    return (
        <div className="container mx-auto px-4 py-8 mt-16">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col lg:flex-row">
                    {/* Main content column */}
                    <div className="flex-1 lg:pr-4 min-w-0">
                        <div className="flex flex-wrap gap-2 mb-6">
                            <div className="flex gap-1 sm:gap-2">
                                <div className="dropdown dropdown-bottom sm:dropdown-end" ref={sortMenuRef}>
                                    <label
                                        tabIndex={0}
                                        className="btn btn-ghost gap-1 sm:gap-2 min-w-0 sm:min-w-[140px] border border-base-300 h-12"
                                    >
                                        <ChevronUpDownIcon className="w-5 h-5" />
                                        <span className="hidden sm:inline">
                                            {sortOptions.find(opt => opt.value === filter)?.label || 'Sort By'}
                                        </span>
                                    </label>
                                    <ul tabIndex={0} className="dropdown-content z-30 menu p-2 shadow bg-base-100 rounded-lg w-48 mt-2 border border-base-300">
                                        {sortOptions.map((option) => (
                                            <li key={option.value}>
                                                <a 
                                                    className={filter === option.value ? 'active bg-base-200' : ''}
                                                    onClick={() => {
                                                        setFilter(option.value)
                                                    }}
                                                >
                                                    {option.label}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="dropdown dropdown-bottom sm:dropdown-end" ref={filterMenuRef}>
                                    <label
                                        tabIndex={0}
                                        className="btn btn-ghost gap-1 sm:gap-2 min-w-0 sm:min-w-[140px] border border-base-300 h-12"
                                    >
                                        <AdjustmentsHorizontalIcon className="w-5 h-5" />
                                        <span className="hidden sm:inline">
                                            {category || 'All Categories'}
                                        </span>
                                    </label>
                                    <ul tabIndex={0} className="dropdown-content z-30 menu p-2 shadow bg-base-100 rounded-lg w-48 mt-2 border border-base-300">
                                        <li>
                                            <a 
                                                className={!category ? 'active bg-base-200' : ''}
                                                onClick={() => {
                                                    setCategory('')
                                                }}
                                            >
                                                All Categories
                                            </a>
                                        </li>
                                        {categories.map((cat) => (
                                            <li key={cat}>
                                                <a 
                                                    className={category === cat ? 'active bg-base-200' : ''}
                                                    onClick={() => {
                                                        setCategory(cat)
                                                    }}
                                                >
                                                    {cat}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="flex flex-1 gap-1 sm:gap-4 min-w-0">
                                <div className="relative flex-1 min-w-0">
                                    <input
                                        type="text"
                                        placeholder="Search discussions..."
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        className="input input-bordered w-full pr-10 h-12 text-sm sm:text-base"
                                    />
                                    <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-base-content/70" />
                                </div>

                                {user && (
                                    <Link to="/discuss/new" className="btn btn-primary gap-1 sm:gap-2 min-w-fit h-12">
                                        <PlusIcon className="w-5 h-5" />
                                        <span className="hidden sm:inline">New Discussion</span>
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Updated Loading State */}
                        {loading ? (
                            <DiscussLoadingSkeleton />
                        ) : (
                            <div className="space-y-4">
                                {discussions.map((discussion) => (
                                    <div 
                                        key={discussion._id} 
                                        className="card bg-base-100 shadow hover:shadow-lg transition-all duration-300 cursor-pointer"
                                        onClick={() => handleDiscussionClick(discussion._id)}
                                    >
                                        <div className="card-body p-4">
                                            <div className="flex items-start gap-3">
                                                <OptimizedImage 
                                                    src={(discussion.userId && discussion.userId.profilePicture) || '/default-avatar.png'} 
                                                    alt={discussion.userId?.username || 'User'} 
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            {discussion.isPinned && (
                                                                <div className="badge badge-primary badge-sm gap-1">
                                                                    <MapPinIcon className="w-3 h-3" />
                                                                    Pinned
                                                                </div>
                                                            )}
                                                            <h2 className="text-lg font-bold hover:text-primary transition-colors truncate">
                                                                {discussion.title}
                                                            </h2>
                                                        </div>
                                                        <div className="badge badge-ghost badge-sm shrink-0">{discussion.category}</div>
                                                    </div>
                                                    
                                                    <p className="text-sm text-base-content/70">
                                                        Posted by {discussion.userId?.username || 'Deleted User'} • {moment(discussion.createdAt).fromNow()}
                                                    </p>
                                                    
                                                    <p className="line-clamp-1 text-base-content/80 mt-1">{discussion.content}</p>

                                                    <div className="flex items-center gap-4 mt-2" onClick={e => e.stopPropagation()}>
                                                        <button 
                                                            className="btn btn-ghost btn-xs gap-1"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleLike(discussion._id);
                                                            }}
                                                        >
                                                            {discussion.likes.includes(user?._id) ? (
                                                                <HandThumbUpIconSolid className="w-4 h-4 text-primary" />
                                                            ) : (
                                                                <HandThumbUpIcon className="w-4 h-4" />
                                                            )}
                                                            <span>{discussion.likes.length}</span>
                                                        </button>
                                                        <button 
                                                            className="btn btn-ghost btn-xs gap-1"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDislike(discussion._id);
                                                            }}
                                                        >
                                                            {discussion.dislikes.includes(user?._id) ? (
                                                                <HandThumbDownIconSolid className="w-4 h-4 fill-current text-error" />
                                                            ) : (
                                                                <HandThumbDownIcon className="w-4 h-4" />
                                                            )}
                                                            <span>{discussion.dislikes.length}</span>
                                                        </button>
                                                        <div className="flex items-center gap-1">
                                                            <ChatBubbleLeftIcon className="w-4 h-4" />
                                                            <span className="text-xs">{discussion.replyCount || discussion.replies?.length || 0}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <EyeIcon className="w-4 h-4" />
                                                            <span className="text-xs">{discussion.views || 0}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent posts sidebar - only visible on larger screens */}
                    <div className="hidden lg:block w-64 xl:w-72 flex-shrink-0 sticky top-24 self-start">
                        {loading ? <StaticSidebar /> : <RecentPostsSidebar />}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Discuss
