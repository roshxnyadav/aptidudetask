import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getRecentPosts } from '../../utils/recentPostsUtil';
import moment from 'moment';
import { 
  ClockIcon, 
  HandThumbUpIcon, 
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';

const RecentPostsSidebar = ({ className = '' }) => {
  const [recentPosts, setRecentPosts] = useState([]);

  useEffect(() => {
    // Load recent posts from local storage
    const posts = getRecentPosts();
    setRecentPosts(posts);
  }, []);

  return (
    <div className={`bg-base-200/50 rounded-lg shadow-md h-full min-h-[calc(100vh-10rem)] ${className}`}>
      <div className="p-4 border-b border-base-300">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <ClockIcon className="w-5 h-5 text-primary" />
          Recent Posts
        </h3>
      </div>
      
      <div className="max-h-[calc(100vh-10rem)] overflow-y-auto">
        {recentPosts.length > 0 ? (
          recentPosts.map((post) => (
            <Link 
              key={post._id} 
              to={`/discuss/${post._id}`}
              className="block hover:bg-base-300 transition-colors p-3 border-b border-base-300 last:border-b-0"
            >
              <h4 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors">
                {post.title}
              </h4>
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-base-content/70">
                  by {post.username}
                </div>
                <div className="text-xs text-base-content/70">
                  {moment(post.viewedAt).fromNow()}
                </div>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="badge badge-sm">{post.category}</span>
                <div className="flex items-center gap-1 text-xs text-base-content/70">
                  <HandThumbUpIcon className="w-3 h-3" />
                  <span>{post.likes}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-base-content/70">
                  <ChatBubbleLeftIcon className="w-3 h-3" />
                  <span>{post.replies}</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="p-4 text-center h-full flex flex-col justify-center items-center">
            <p className="text-sm text-base-content/70">
              Posts you view will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

RecentPostsSidebar.propTypes = {
  className: PropTypes.string
};

export default RecentPostsSidebar; 
