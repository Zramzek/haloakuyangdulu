import React from "react";
import { Post } from "@/lib/supabase";
import PostCard from "@/components/postcard";

interface PostsContainerProps {
  posts: Post[];
  likedPosts: Set<number>;
  onLike: (postId: number) => void;
}

const PostsContainer: React.FC<PostsContainerProps> = ({
  posts,
  likedPosts,
  onLike,
}) => {
  // Split posts into two rows for animation
  const topRowPosts = posts.filter((_, index) => index % 2 === 0);
  const bottomRowPosts = posts.filter((_, index) => index % 2 === 1);

  return (
    <div className="overflow-hidden py-8">
      {/* Top Row - Moving Left */}
      <div className="mb-8">
        <div className="flex animate-scroll-left">
          {/* Duplicate posts for seamless loop */}
          {[...topRowPosts, ...topRowPosts].map((post, index) => (
            <PostCard
              key={`top-${post.id}-${index}`}
              post={post}
              isLiked={likedPosts.has(post.id)}
              onLike={onLike}
            />
          ))}
        </div>
      </div>

      {/* Bottom Row - Moving Right */}
      <div>
        <div className="flex animate-scroll-right">
          {/* Duplicate posts for seamless loop */}
          {[...bottomRowPosts, ...bottomRowPosts].map((post, index) => (
            <PostCard
              key={`bottom-${post.id}-${index}`}
              post={post}
              isLiked={likedPosts.has(post.id)}
              onLike={onLike}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostsContainer;
