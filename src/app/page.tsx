"use client";

import React, { useState, useEffect } from "react";
import {
  Heart,
  Search,
  Plus,
  X,
  User,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  fetchPosts,
  createPost,
  toggleLike,
  searchPosts,
  Post,
} from "@/lib/supabase";

interface FormData {
  name: string;
  anonymous: boolean;
  dari: string;
  untuk: string;
  pesan: string;
}

const HaloAkuYangDulu: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    anonymous: false,
    dari: "",
    untuk: "",
    pesan: "",
  });

  const postsPerPage = 30;
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  // Generate or get user session ID
  const getUserSession = (): string => {
    let sessionId = localStorage.getItem("user_session");
    if (!sessionId) {
      sessionId =
        "user_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("user_session", sessionId);
    }
    return sessionId;
  };

  // Load posts
  const loadPosts = async (page: number = 1, query: string = "") => {
    setLoading(true);
    try {
      const result = query.trim()
        ? await searchPosts(query, page, postsPerPage)
        : await fetchPosts(page, postsPerPage);

      if (result.error) {
        console.error("Error loading posts:", result.error);
        return;
      }

      setPosts(result.posts);
      setTotalPosts(result.totalCount);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load posts on mount and when page/search changes
  useEffect(() => {
    loadPosts(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  // Handle search with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        loadPosts(1, searchQuery);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Handle like toggle
  const handleLike = async (postId: number) => {
    try {
      const userSession = getUserSession();
      const result = await toggleLike(postId, userSession);

      if (result.error) {
        console.error("Error toggling like:", result.error);
        return;
      }

      // Update local state
      setLikedPosts((prev) => {
        const newSet = new Set(prev);
        if (result.liked) {
          newSet.add(postId);
        } else {
          newSet.delete(postId);
        }
        return newSet;
      });

      // Update post likes count
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, likes: result.liked ? post.likes + 1 : post.likes - 1 }
            : post
        )
      );
    } catch (error) {
      console.error("Error handling like:", error);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (
      !formData.name ||
      !formData.dari ||
      !formData.untuk ||
      !formData.pesan
    ) {
      alert("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createPost({
        name: formData.anonymous ? "Anonymous" : formData.name,
        is_anonymous: formData.anonymous,
        dari: formData.dari,
        untuk: formData.untuk,
        pesan: formData.pesan,
      });

      if (result.error) {
        console.error("Error creating post:", result.error);
        alert("Error creating post. Please try again.");
        return;
      }

      // Reset form and close modal
      setFormData({
        name: "",
        anonymous: false,
        dari: "",
        untuk: "",
        pesan: "",
      });
      setShowModal(false);

      // Refresh posts if on first page
      if (currentPage === 1) {
        loadPosts(1, searchQuery);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error creating post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Split posts into two rows for animation
  const topRowPosts = posts.filter((_, index) => index % 2 === 0);
  const bottomRowPosts = posts.filter((_, index) => index % 2 === 1);

  const PostCard: React.FC<{ post: Post }> = ({ post }) => {
    const isLiked = likedPosts.has(post.id);

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
                {post.dari} year old me → {post.untuk} year old me
              </p>
            </div>
          </div>
          <button
            onClick={() => handleLike(post.id)}
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-lg border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              HaloAkuYangDulu
            </h1>
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama atau pesan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-80 bg-white border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              {/* Add Button */}
              <button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                <span>Tambah</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center min-h-96">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : (
        <>
          {/* Posts Count */}
          <div className="text-center py-4">
            <p className="text-gray-600">
              {searchQuery
                ? `Menampilkan ${posts.length} dari ${totalPosts} hasil pencarian`
                : `Menampilkan ${posts.length} dari ${totalPosts} total posts`}
            </p>
          </div>

          {/* Animated Posts Container */}
          <div className="overflow-hidden py-8">
            {/* Top Row - Moving Left */}
            <div className="mb-8">
              <div className="flex animate-scroll-left">
                {/* Duplicate posts for seamless loop */}
                {[...topRowPosts, ...topRowPosts].map((post, index) => (
                  <PostCard key={`top-${post.id}-${index}`} post={post} />
                ))}
              </div>
            </div>

            {/* Bottom Row - Moving Right */}
            <div>
              <div className="flex animate-scroll-right">
                {/* Duplicate posts for seamless loop */}
                {[...bottomRowPosts, ...bottomRowPosts].map((post, index) => (
                  <PostCard key={`bottom-${post.id}-${index}`} post={post} />
                ))}
              </div>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 py-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white border border-purple-200 text-purple-600 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {[...Array(Math.min(5, totalPages))].map((_, index) => {
                const pageNum =
                  Math.max(1, Math.min(totalPages - 4, currentPage - 2)) +
                  index;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === pageNum
                        ? "bg-purple-600 text-white"
                        : "bg-white border border-purple-200 text-purple-600 hover:bg-purple-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white border border-purple-200 text-purple-600 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Tambah Surat Baru
              </h2>
              <button
                onClick={() => setShowModal(false)}
                disabled={submitting}
                className="text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama:
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  disabled={submitting}
                />
                <div className="mt-2">
                  <label className="flex items-center space-x-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={formData.anonymous}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          anonymous: e.target.checked,
                        })
                      }
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      disabled={submitting}
                    />
                    <span>Anonymous</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dari:
                  </label>
                  <input
                    type="text"
                    placeholder="contoh: 22 tahun"
                    value={formData.dari}
                    onChange={(e) =>
                      setFormData({ ...formData, dari: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Untuk:
                  </label>
                  <input
                    type="text"
                    placeholder="contoh: 16 tahun"
                    value={formData.untuk}
                    onChange={(e) =>
                      setFormData({ ...formData, untuk: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pesan:
                </label>
                <textarea
                  value={formData.pesan}
                  onChange={(e) =>
                    setFormData({ ...formData, pesan: e.target.value })
                  }
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Tulis pesanmu untuk diri masa lalu..."
                  required
                  disabled={submitting}
                />
                <div className="text-right mt-1">
                  <span className="text-sm text-gray-500">
                    {formData.pesan.length}/500 karakter
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <span>KIRIM SURAT</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HaloAkuYangDulu;
