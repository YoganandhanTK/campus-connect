import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./styles/commentSection.css";
import { FiSend } from "react-icons/fi";
import BASE_URL from "../config";

const CommentSection = ({ noticeId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState("");
    const bottomRef = useRef(null);

    // 🔁 Fetch comments
    const loadComments = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/Comments/notice/${noticeId}`);
            setComments(res.data);
        } catch (err) {
            console.error("Failed to fetch comments:", err);
            setToast("Failed to fetch comments");
        }
    };

    // 🎯 Initial load + when noticeId changes
    useEffect(() => {
        loadComments();
    }, [noticeId]);

    // 🔽 Scroll to latest comment
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [comments]);

    // ✅ Show toast
    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(""), 3000);
    };

    // ➕ Post comment
    const handlePostComment = async () => {
        if (!newComment.trim()) return;

        const commentData = {
            content: newComment,
            noticeId: noticeId,
        };

        try {
            setLoading(true);
            await axios.post(`${BASE_URL}/Comments`, commentData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setNewComment("");
            await loadComments();
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.response?.data ||
                "Failed to post comment";
            showToast(message);
        } finally {
            setLoading(false);
        }
    };

    // 🧠 Highlight @mentions
    const renderContent = (content) => {
        const parts = content.split(/(@\w+)/g);
        return parts.map((part, i) =>
            part.startsWith("@") ? (
                <span key={i} style={{ color: "#2563eb", fontWeight: "bold" }}>
                    {part}
                </span>
            ) : (
                part
            )
        );
    };

    return (
        <div className="comment-section">
            <h4>Comments</h4>

            <div className="comment-input">
                <input
                    type="text"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />
                <button onClick={handlePostComment} disabled={loading}>
                    <FiSend /> Post
                </button>
            </div>

            <div className="comment-list">
                {comments.length === 0 ? (
                    <p>No comments yet.</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="comment-item">
                            <div className="comment-header">
                                <strong>{comment.author}</strong>
                                <span className={`role-badge ${comment.role.toLowerCase()}`}>
                                    {comment.role}
                                </span>
                                <button
                                    className="reply-btn"
                                    onClick={() => setNewComment(`@${comment.author} `)}
                                >
                                    Reply
                                </button>
                            </div>
                            <p>{renderContent(comment.content)}</p>
                            <small>{new Date(comment.createdAt).toLocaleString()}</small>
                        </div>
                    ))
                )}
                <div ref={bottomRef} />
            </div>

            {toast && <div className="comment-toast">{toast}</div>}
        </div>
    );
};

export default CommentSection;
