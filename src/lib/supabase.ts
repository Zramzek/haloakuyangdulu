import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface Post {
  id: number;
  name: string;
  is_anonymous: boolean;
  dari: string;
  untuk: string;
  pesan: string;
  likes: number;
  created_at: string;
  updated_at: string;
}

export interface PostLike {
  id: number;
  post_id: number;
  user_session: string;
  created_at: string;
}

// Database Functions
export const fetchPosts = async (page: number = 1, limit: number = 30) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("posts")
    .select(
      `
      *,
      post_likes(count)
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching posts:", error);
    return { posts: [], totalCount: 0, error };
  }

  // Transform data to include like count
  const postsWithLikes =
    data?.map((post) => ({
      ...post,
      likes: post.post_likes?.[0]?.count || 0,
    })) || [];

  return {
    posts: postsWithLikes,
    totalCount: count || 0,
    error: null,
  };
};

export const createPost = async (postData: {
  name: string;
  is_anonymous: boolean;
  dari: string;
  untuk: string;
  pesan: string;
}) => {
  const { data, error } = await supabase
    .from("posts")
    .insert([postData])
    .select()
    .single();

  if (error) {
    console.error("Error creating post:", error);
    return { post: null, error };
  }

  return { post: data, error: null };
};

export const toggleLike = async (postId: number, userSession: string) => {
  // Check if user already liked this post
  const { data: existingLike, error: checkError } = await supabase
    .from("post_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_session", userSession)
    .single();

  if (checkError && checkError.code !== "PGRST116") {
    console.error("Error checking like:", checkError);
    return { error: checkError, liked: false };
  }

  if (existingLike) {
    // Remove like
    const { error: deleteError } = await supabase
      .from("post_likes")
      .delete()
      .eq("id", existingLike.id);

    if (deleteError) {
      console.error("Error removing like:", deleteError);
      return { error: deleteError, liked: true };
    }

    return { error: null, liked: false };
  } else {
    // Add like
    const { error: insertError } = await supabase
      .from("post_likes")
      .insert([{ post_id: postId, user_session: userSession }]);

    if (insertError) {
      console.error("Error adding like:", insertError);
      return { error: insertError, liked: false };
    }

    return { error: null, liked: true };
  }
};

export const searchPosts = async (
  query: string,
  page: number = 1,
  limit: number = 30
) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("posts")
    .select(
      `
      *,
      post_likes(count)
    `,
      { count: "exact" }
    )
    .or(`name.ilike.%${query}%,pesan.ilike.%${query}%`)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error searching posts:", error);
    return { posts: [], totalCount: 0, error };
  }

  const postsWithLikes =
    data?.map((post) => ({
      ...post,
      likes: post.post_likes?.[0]?.count || 0,
    })) || [];

  return {
    posts: postsWithLikes,
    totalCount: count || 0,
    error: null,
  };
};
