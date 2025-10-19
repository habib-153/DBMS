"use client";

import React, { useState } from "react";
import {
  Avatar,
  Button,
  Textarea,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { format } from "date-fns";
import {
  MessageSquare,
  MoreHorizontal,
  Edit2,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import CommentVoteButtons from "./CommentVoteButtons";

import { useUser } from "@/src/context/user.provider";
import {
  usePostAComment,
  useUpdateComment,
  useDeleteComment,
} from "@/src/hooks/comment.hook";
import { FollowButton } from "@/src/components/modules/Shared";

interface CommentProps {
  comment: any;
  postId: string;
  level?: number;
  maxDepth?: number;
}

const CommentTree: React.FC<CommentProps> = ({
  comment,
  postId,
  level = 0,
  maxDepth = 5,
}) => {
  const { user } = useUser();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [editContent, setEditContent] = useState(comment.content);
  const [replyImage, setReplyImage] = useState<File | null>(null);
  const [replyImagePreview, setReplyImagePreview] = useState<string | null>(
    null
  );
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [showChildren, setShowChildren] = useState(level === 0);

  const { mutateAsync: postComment } = usePostAComment();
  const { mutateAsync: updateComment } = useUpdateComment();
  const { mutateAsync: deleteComment } = useDeleteComment();

  const isAuthor = user?.id === comment.authorId;

  const handleReplyImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");

      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");

      return;
    }

    setReplyImage(file);
    const reader = new FileReader();

    reader.onloadend = () => {
      setReplyImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");

      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");

      return;
    }

    setEditImage(file);
    const reader = new FileReader();

    reader.onloadend = () => {
      setEditImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleReply = async () => {
    if (!user) {
      toast.error("Please sign in to reply");

      return;
    }

    if (!replyContent.trim()) {
      return;
    }

    try {
      const formData = new FormData();

      formData.append("postId", postId);
      formData.append("content", replyContent);
      formData.append("parentId", comment.id);
      if (replyImage) {
        formData.append("image", replyImage);
      }

      await postComment(formData);
      setReplyContent("");
      setReplyImage(null);
      setReplyImagePreview(null);
      setIsReplying(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) {
      toast.error("Comment cannot be empty");

      return;
    }

    try {
      const formData = new FormData();

      formData.append("content", editContent);
      if (editImage) {
        formData.append("image", editImage);
      }

      await updateComment({
        commentId: comment.id,
        payload: formData,
        postId,
      });

      setIsEditing(false);
      setEditImage(null);
      setEditImagePreview(null);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      await deleteComment({
        commentId: comment.id,
        postId,
      });
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
    setEditImage(null);
    setEditImagePreview(null);
  };

  const indent = Math.min(level * 24, 96);

  return (
    <div className="pl-0 sm:pl-6" style={{ paddingLeft: `${indent}px` }}>
      <div className="group mb-4">
        {/* Modern Comment Card */}
        <div className="relative bg-white dark:bg-gray-800/50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700/50">
          {/* Left Border Accent */}
          {level > 0 && (
            <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-gradient-to-b from-brand-primary/40 to-transparent rounded-full" />
          )}

          <div className="flex gap-3">
            {/* Avatar */}
            <Link href={`/profile/${comment.authorId}`}>
              <Avatar
                className="cursor-pointer ring-2 ring-white dark:ring-gray-800 hover:ring-brand-primary/50 transition-all flex-shrink-0"
                name={comment.authorName}
                size="sm"
                src={comment.authorProfilePhoto}
              />
            </Link>

            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    className="font-semibold text-gray-900 dark:text-gray-100 hover:text-brand-primary transition-colors"
                    href={`/profile/${comment.authorId}`}
                  >
                    {comment.authorName}
                  </Link>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {format(
                      new Date(comment.createdAt),
                      "MMM d, yyyy · h:mm a"
                    )}
                  </span>
                  {comment.createdAt !== comment.updatedAt && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                      (edited)
                    </span>
                  )}
                </div>

                {/* Action Menu */}
                <div className="flex items-center gap-1">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <FollowButton
                      size="sm"
                      userId={comment.authorId}
                      userName={comment.authorName}
                      variant="light"
                    />
                  </div>

                  {isAuthor && (
                    <Dropdown placement="bottom-end">
                      <DropdownTrigger>
                        <Button
                          isIconOnly
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          size="sm"
                          variant="light"
                        >
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Comment actions">
                        <DropdownItem
                          key="edit"
                          startContent={<Edit2 size={14} />}
                          onPress={() => setIsEditing(true)}
                        >
                          Edit
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          className="text-danger"
                          color="danger"
                          startContent={<Trash2 size={14} />}
                          onPress={handleDelete}
                        >
                          Delete
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  )}
                </div>
              </div>

              {/* Content */}
              {isEditing ? (
                <div className="space-y-3 mt-2">
                  <Textarea
                    className="w-full"
                    minRows={2}
                    placeholder="Edit your comment..."
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />

                  {/* Edit Image Upload */}
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 cursor-pointer border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <ImageIcon size={14} />
                      Change Image
                      <input
                        accept="image/*"
                        className="hidden"
                        type="file"
                        onChange={handleEditImageChange}
                      />
                    </label>
                    {editImage && (
                      <span className="text-xs text-gray-500">
                        {editImage.name}
                      </span>
                    )}
                  </div>

                  {/* Edit Image Preview */}
                  {(editImagePreview || comment.image) && (
                    <div className="relative inline-block">
                      <img
                        alt="Preview"
                        className="max-w-xs rounded-lg border border-gray-300 dark:border-gray-600"
                        src={editImagePreview || comment.image}
                      />
                      {editImagePreview && (
                        <button
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                          type="button"
                          onClick={() => {
                            setEditImage(null);
                            setEditImagePreview(null);
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="light"
                      onPress={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-brand-primary text-white"
                      isDisabled={!editContent.trim()}
                      size="sm"
                      onPress={handleEdit}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {comment.content}
                  </p>

                  {/* Comment Image */}
                  {comment.image && (
                    <div className="mt-3">
                      <a
                        className="inline-block"
                        href={comment.image}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <img
                          alt="Comment attachment"
                          className="max-w-sm rounded-xl cursor-pointer hover:opacity-90 transition-opacity border border-gray-200 dark:border-gray-700 shadow-sm"
                          src={comment.image}
                        />
                      </a>
                    </div>
                  )}
                </>
              )}

              {/* Actions Bar */}
              {!isEditing && (
                <div className="flex items-center gap-4 mt-3">
                  <CommentVoteButtons
                    commentId={comment.id}
                    postId={postId}
                    votes={comment.votes}
                  />
                  {level < maxDepth && (
                    <Button
                      className="text-gray-600 dark:text-gray-400 hover:text-brand-primary dark:hover:text-brand-primary"
                      size="sm"
                      startContent={<MessageSquare size={14} />}
                      variant="light"
                      onClick={() => setIsReplying(!isReplying)}
                    >
                      Reply
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reply Form */}
        {isReplying && (
          <div className="mt-3 ml-12 bg-gray-50 dark:bg-gray-800/30 rounded-xl p-4 border border-gray-200 dark:border-gray-700/50">
            <div className="space-y-3">
              <Textarea
                className="w-full"
                minRows={2}
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
              />

              {/* Reply Image Upload */}
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 cursor-pointer border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <ImageIcon size={14} />
                  Add Image
                  <input
                    accept="image/*"
                    className="hidden"
                    type="file"
                    onChange={handleReplyImageChange}
                  />
                </label>
                {replyImage && (
                  <span className="text-xs text-gray-500">
                    {replyImage.name} ({(replyImage.size / 1024).toFixed(1)} KB)
                  </span>
                )}
              </div>

              {/* Reply Image Preview */}
              {replyImagePreview && (
                <div className="relative inline-block">
                  <img
                    alt="Reply preview"
                    className="max-w-xs rounded-lg border border-gray-300 dark:border-gray-600"
                    src={replyImagePreview}
                  />
                  <button
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                    type="button"
                    onClick={() => {
                      setReplyImage(null);
                      setReplyImagePreview(null);
                    }}
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="light"
                  onClick={() => {
                    setIsReplying(false);
                    setReplyContent("");
                    setReplyImage(null);
                    setReplyImagePreview(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-brand-primary text-white"
                  isDisabled={!replyContent.trim()}
                  size="sm"
                  onClick={handleReply}
                >
                  Post Reply
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Nested Replies */}
        {comment.children && comment.children.length > 0 && (
          <div className="mt-3">
            <div className="mb-2">
              {!showChildren ? (
                <Button
                  className="text-xs text-gray-600 dark:text-gray-400"
                  size="sm"
                  variant="light"
                  onClick={() => setShowChildren(true)}
                >
                  View {comment.children.length}{" "}
                  {comment.children.length > 1 ? "replies" : "reply"}
                </Button>
              ) : (
                <Button
                  className="text-xs text-gray-600 dark:text-gray-400"
                  size="sm"
                  variant="light"
                  onClick={() => setShowChildren(false)}
                >
                  Hide replies
                </Button>
              )}
            </div>

            {showChildren && (
              <div className="space-y-0">
                {comment.children.map((child: any) => (
                  <CommentTree
                    key={child.id}
                    comment={child}
                    level={level + 1}
                    maxDepth={maxDepth}
                    postId={postId}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentTree;