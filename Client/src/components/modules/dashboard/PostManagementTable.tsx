"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { User } from "@heroui/user";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Input } from "@heroui/input";
import { Pagination } from "@heroui/pagination";
import { Skeleton } from "@heroui/skeleton";
import { Select, SelectItem } from "@heroui/select";
import {
  MoreVertical,
  CheckCircle,
  XCircle,
  Trash2,
  Search,
  Eye,
  Filter,
} from "lucide-react";

import {
  useGetAllPosts,
  useUpdatePost,
  useDeletePost,
} from "@/src/hooks/post.hook";
import envConfig from "@/src/config/envConfig";
import { transformPostsData } from "@/src/utils/transformPostData";
import DeletePostModal from "@/src/components/UI/modal/DeletePostModal";

const PostManagementTable = () => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchInput);
      setPage(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchInput]);

  // Build API URL (like in posts page)
  const apiUrl = `${envConfig.baseApi}/posts?${new URLSearchParams({
    ...(debouncedSearchTerm && { searchTerm: debouncedSearchTerm }),
    ...(statusFilter !== "ALL" && { status: statusFilter }),
    page: page.toString(),
    limit: "10",
  }).toString()}`;

  const { data: postData, isLoading, refetch } = useGetAllPosts(apiUrl);
  const { mutate: updatePost, isPending: isUpdatingPost } = useUpdatePost();
  const { mutate: deletePost, isPending: isDeletingPost } = useDeletePost();

  // Transform posts data
  const posts = postData?.data ? transformPostsData(postData.data) : [];
  const totalPages = Math.ceil((postData?.meta?.total || 0) / 10);

  const handleApprovePost = (postId: string) => {
    const formData = new FormData();

    formData.append("data", JSON.stringify({ status: "APPROVED" }));

    updatePost(
      { id: postId, postData: formData },
      {
        onSuccess: () => {
          refetch(); // Refetch posts after update
        },
      }
    );
  };

  const handleRejectPost = (postId: string) => {
    const formData = new FormData();

    formData.append("data", JSON.stringify({ status: "REJECTED" }));

    updatePost(
      { id: postId, postData: formData },
      {
        onSuccess: () => {
          refetch(); // Refetch posts after update
        },
      }
    );
  };

  const handleDeleteClick = (postId: string, postTitle: string) => {
    setSelectedPost({ id: postId, title: postTitle });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedPost) {
      deletePost(
        { id: selectedPost.id },
        {
          onSuccess: () => {
            refetch(); // Refetch posts after delete
            setSelectedPost(null);
          },
        }
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "PENDING":
        return "warning";
      case "REJECTED":
        return "danger";
      default:
        return "default";
    }
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-3 p-4 border rounded-lg">
          <Skeleton className="w-12 h-12 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-3 w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          className="max-w-xs"
          placeholder="Search posts..."
          startContent={<Search className="w-4 h-4 text-gray-400" />}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />

        <Select
          className="max-w-xs"
          label="Filter by Status"
          labelPlacement="outside-left"
          selectedKeys={[statusFilter]}
          startContent={<Filter className="w-4 h-4" />}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <SelectItem key="ALL">All Status</SelectItem>
          <SelectItem key="PENDING">Pending</SelectItem>
          <SelectItem key="APPROVED">Approved</SelectItem>
          <SelectItem key="REJECTED">Rejected</SelectItem>
        </Select>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {/* Table */}
          <Table
            aria-label="Post management table"
            bottomContent={
              totalPages > 1 ? (
                <div className="flex w-full justify-center">
                  <Pagination
                    isCompact
                    showControls
                    showShadow
                    classNames={{
                      cursor: "bg-[#a50034] text-white",
                    }}
                    page={page}
                    total={totalPages}
                    onChange={(newPage) => setPage(newPage)}
                  />
                </div>
              ) : null
            }
            classNames={{
              wrapper:
                "border-2 border-gray-200 dark:border-gray-700 min-h-[400px]",
              th: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
            }}
          >
            <TableHeader>
              <TableColumn>POST</TableColumn>
              <TableColumn>AUTHOR</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>CRIME DATE</TableColumn>
              <TableColumn>VOTES</TableColumn>
              <TableColumn>CREATED</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody
              emptyContent={
                <div className="text-center py-12">
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    No posts found
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Try adjusting your search or filters
                  </p>
                </div>
              }
            >
              {posts.map((post: any) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {post.image && (
                        <img
                          alt={post.title}
                          className="w-12 h-12 rounded object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                          src={post.image}
                        />
                      )}
                      <div className="max-w-[200px]">
                        <p className="font-medium truncate">{post.title}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {post.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <User
                      avatarProps={{
                        src: post.author?.profilePhoto || "/default-avatar.png",
                        size: "sm",
                      }}
                      description={`@${post.author?.email?.split("@")[0] || "unknown"}`}
                      name={post.author?.name || "Unknown"}
                    />
                  </TableCell>

                  <TableCell>
                    <Chip
                      color={getStatusColor(post.status)}
                      size="sm"
                      variant="flat"
                    >
                      {post.status}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {new Date(post.crimeDate).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 text-sm font-medium">
                        ↑ {post.upVotes || 0}
                      </span>
                      <span className="text-red-600 text-sm font-medium">
                        ↓ {post.downVotes || 0}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          isIconOnly
                          isDisabled={isUpdatingPost || isDeletingPost}
                          size="sm"
                          variant="light"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Post actions">
                        <DropdownItem
                          key="view"
                          className="text-blue-600"
                          startContent={<Eye className="w-4 h-4" />}
                          onPress={() =>
                            window.open(`/posts/${post.id}`, "_blank")
                          }
                        >
                          View Post
                        </DropdownItem>
                        {post.status !== "APPROVED" ? (
                          <DropdownItem
                            key="approve"
                            className="text-green-600"
                            startContent={<CheckCircle className="w-4 h-4" />}
                            onPress={() => handleApprovePost(post.id)}
                          >
                            Approve
                          </DropdownItem>
                        ) : null}
                        {post.status !== "REJECTED" ? (
                          <DropdownItem
                            key="reject"
                            className="text-yellow-600"
                            startContent={<XCircle className="w-4 h-4" />}
                            onPress={() => handleRejectPost(post.id)}
                          >
                            Reject
                          </DropdownItem>
                        ) : null}
                        <DropdownItem
                          key="delete"
                          className="text-danger"
                          color="danger"
                          startContent={<Trash2 className="w-4 h-4" />}
                          onPress={() => handleDeleteClick(post.id, post.title)}
                        >
                          Delete Post
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}

      {/* Delete Post Modal */}
      {selectedPost && (
        <DeletePostModal
          isDeleting={isDeletingPost}
          isOpen={isDeleteModalOpen}
          postTitle={selectedPost.title}
          onConfirm={handleConfirmDelete}
          onOpenChange={setIsDeleteModalOpen}
        />
      )}
    </div>
  );
};

export default PostManagementTable;