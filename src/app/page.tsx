"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  fetchPosts,
  createPost,
  toggleLike,
  searchPosts,
  Post,
} from "@/lib/supabase";
import Header from "@/components/header";
import PostsContainer from "@/components/postcontainer";
import Pagination from "@/components/pagination";
import Modal from "@/components/modal";

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
  }, [currentPage, searchQuery]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setShowModal={setShowModal}
      />

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

          <PostsContainer
            posts={posts}
            likedPosts={likedPosts}
            onLike={handleLike}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <Modal
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
          submitting={submitting}
        />
      )}
    </div>
  );
};

export default HaloAkuYangDulu;
