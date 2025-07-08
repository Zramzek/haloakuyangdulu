import React from "react";
import { Heart, User } from "lucide-react";
import { Post } from "@/lib/supabase";

interface PostCardProps {
  post: Post;
  isLiked: boolean;
  onLike: (postId: number) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, isLiked, onLike }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 min-w-80 mx-3 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">
              {post.is_anonymous ? "Anonymous" : post.name}
            </h3>
            <p className="text-sm text-gray-500">
              {post.dari} y.o. me → {post.untuk} y.o. me
            </p>
          </div>
        </div>
        <button
          onClick={() => onLike(post.id)}
          className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-all duration-200 ${
            isLiked
              ? "bg-red-100 text-red-600 hover:bg-red-200"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
          <span className="text-sm font-medium">{post.likes}</span>
        </button>
      </div>
      <p className="text-gray-700 leading-relaxed">{post.pesan}</p>
    </div>
  );
};

export default PostCard;
