"use client";

import React, { useState } from "react";
import { Avatar, Button, Textarea } from "@heroui/react";
import { format } from "date-fns";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { useUser } from "@/src/context/user.provider";
import { usePostAComment } from "@/src/hooks/comment.hook";
import CommentVoteButtons from "./CommentVoteButtons";
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
  maxDepth = 5, // Limit nesting depth for UI clarity
}) => {
  const { user } = useUser();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  // For nested threads, collapse replies by default (except top-level)
  const [showChildren, setShowChildren] = useState(level === 0);
  const { mutateAsync: postComment } = usePostAComment();

  const handleReply = async () => {
    if (!user) {
      toast.error("Please sign in to reply");
      return;
    }

    if (!replyContent.trim()) {
      return;
    }

    try {
      await postComment({
        postId,
        content: replyContent,
        parentId: comment.id
      });
      setReplyContent("");
      setIsReplying(false);
      toast.success("Reply posted successfully");
    } catch (error) {
      // Error handling done by the hook
    }
  };

  const indent = Math.min(level * 16, 96); // px

  return (
    <div style={{ paddingLeft: indent }}>
      <div
        className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group mb-3"
        style={{
          borderLeft: level > 0 ? '2px solid rgba(0,0,0,0.06)' : undefined,
          borderLeftColor: level > 0 ? undefined : undefined,
        }}
      >
        <div className="flex items-start gap-3">
          <Link href={`/profile/${comment.authorId}`}>
            <Avatar
              className="cursor-pointer hover:opacity-80 transition-opacity"
              name={comment.authorName}
              size="sm"
              src={comment.authorProfilePhoto}
            />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Link href={`/profile/${comment.authorId}`} className="hover:underline">
                <h4 className="font-medium">{comment.authorName}</h4>
              </Link>
              <span className="text-sm text-gray-500">
                {format(new Date(comment.createdAt), "PPp")}
              </span>
              <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <FollowButton
                  size="sm"
                  userId={comment.authorId}
                  userName={comment.authorName}
                  variant="light"
                />
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
            
            <div className="flex items-center gap-4 mt-2">
              <CommentVoteButtons
                commentId={comment.id}
                postId={postId}
                votes={comment.votes}
              />
              {level < maxDepth && (
                <Button
                  variant="light"
                  size="sm"
                  startContent={<MessageSquare size={14} />}
                  onClick={() => setIsReplying(!isReplying)}
                >
                  Reply
                </Button>
              )}
            </div>
          </div>
        </div>

        {isReplying && (
          <div className="mt-4 pl-8">
            <Textarea
              className="w-full mb-2"
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="light"
                size="sm"
                onClick={() => {
                  setIsReplying(false);
                  setReplyContent("");
                }}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                size="sm"
                onClick={handleReply}
                isDisabled={!replyContent.trim()}
              >
                Post Reply
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Replies */}
      {comment.children && comment.children.length > 0 && (
        <div className="mt-3">
          {/* collapsed control */}
          <div className="mb-2">
            {!showChildren ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChildren(true)}
              >
                View {comment.children.length} repl{comment.children.length > 1 ? 'ies' : 'y'}
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChildren(false)}
              >
                Hide replies
              </Button>
            )}
          </div>

          {showChildren && (
            <div className="space-y-3">
              {comment.children.map((child: any) => (
                <CommentTree
                  key={child.id}
                  comment={child}
                  postId={postId}
                  level={level + 1}
                  maxDepth={maxDepth}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentTree;