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
import { Select, SelectItem } from "@heroui/select";
import {
  MoreVertical,
  Shield,
  Ban,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  Filter,
} from "lucide-react";

import {
  useGetAllUsers,
  useUpdateUserRole,
  useUpdateUserStatus,
  useDeleteUser,
} from "@/src/hooks/user.hook";
import DeleteUserModal from "@/src/components/UI/modal/DeleteUserModal";

const UserManagementTable = () => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchInput);
      setPage(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchInput]);

  // Build query string
  const buildQuery = () => {
    const params = [];

    if (roleFilter !== "ALL") params.push(`role=${roleFilter}`);
    if (statusFilter !== "ALL") params.push(`status=${statusFilter}`);
    if (debouncedSearchTerm) params.push(`searchTerm=${debouncedSearchTerm}`);
    params.push(`page=${page}`);
    params.push(`limit=10`);

    return params.join("&");
  };

  const { data, isLoading, refetch } = useGetAllUsers(buildQuery());
  const { mutate: updateRole, isPending: isUpdatingRole } = useUpdateUserRole();
  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdateUserStatus();
  const { mutate: deleteUser, isPending: isDeletingUser } = useDeleteUser();

  const users = data?.data || [];
  const totalPages = Math.ceil((data?.meta?.total || 0) / 10);

  const handleRoleChange = (userId: string, newRole: string) => {
    updateRole(
      { payload: { role: newRole }, id: userId },
      {
        onSuccess: () => {
          refetch();
        },
      }
    );
  };

  const handleToggleBlock = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "BLOCKED" ? "ACTIVE" : "BLOCKED";

    updateStatus(
      { payload: { status: newStatus }, id: userId },
      {
        onSuccess: () => {
          refetch();
        },
      }
    );
  };

  const handleDeleteClick = (
    userId: string,
    userName: string,
    userEmail: string
  ) => {
    setSelectedUser({ id: userId, name: userName, email: userEmail });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedUser) {
      deleteUser(
        { id: selectedUser.id },
        {
          onSuccess: () => {
            refetch();
            setSelectedUser(null);
          },
        }
      );
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "secondary";
      case "ADMIN":
        return "primary";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "BLOCKED":
        return "danger";
      case "PREMIUM":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          className="max-w-xs"
          placeholder="Search users..."
          startContent={<Search className="w-4 h-4 text-gray-400" />}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />

        <Select
          className="max-w-xs"
          label="Filter by Role"
          labelPlacement="outside-left"
          selectedKeys={[roleFilter]}
          startContent={<Filter className="w-4 h-4" />}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
        >
          <SelectItem key="ALL">All Roles</SelectItem>
          <SelectItem key="USER">User</SelectItem>
          <SelectItem key="ADMIN">Admin</SelectItem>
          <SelectItem key="SUPER_ADMIN">Super Admin</SelectItem>
        </Select>

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
          <SelectItem key="ACTIVE">Active</SelectItem>
          <SelectItem key="BLOCKED">Blocked</SelectItem>
        </Select>
      </div>

      {/* Table */}
      <Table
        aria-label="User management table"
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
          <TableColumn>USER</TableColumn>
          <TableColumn>EMAIL</TableColumn>
          <TableColumn>ROLE</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>VERIFIED</TableColumn>
          <TableColumn>JOINED</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody
          emptyContent={
            <div className="text-center py-12">
              <p className="text-lg text-gray-600 dark:text-gray-400">
                No users found
              </p>
            </div>
          }
          isLoading={isLoading}
        >
          {users.map((user: any) => (
            <TableRow key={user.id}>
              <TableCell>
                <User
                  avatarProps={{
                    src: user.profilePhoto || "/default-avatar.png",
                    size: "sm",
                  }}
                  description={`@${user.email.split("@")[0]}`}
                  name={user.name}
                />
              </TableCell>
              <TableCell>
                <span className="text-sm">{user.email}</span>
              </TableCell>
              <TableCell>
                <Chip color={getRoleColor(user.role)} size="sm" variant="flat">
                  {user.role}
                </Chip>
              </TableCell>
              <TableCell>
                <Chip
                  color={getStatusColor(user.status)}
                  size="sm"
                  variant="flat"
                >
                  {user.status}
                </Chip>
              </TableCell>
              <TableCell>
                {user.isVerified ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-400" />
                )}
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </TableCell>
              <TableCell>
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      isIconOnly
                      isDisabled={
                        isUpdatingRole || isUpdatingStatus || isDeletingUser
                      }
                      size="sm"
                      variant="light"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="User actions">
                    {/* Change Role - Using onPress for each role */}
                    {(() => {
                      const isUser = user.role === "USER";
                      const isAdmin = user.role === "ADMIN";
                      const isSuper = user.role === "SUPER_ADMIN";

                      return (
                        <>
                          <DropdownItem
                            key="role-user"
                            aria-disabled={isUser}
                            className={
                              isUser
                                ? "text-gray-400 opacity-60 pointer-events-none"
                                : "text-blue-600"
                            }
                            startContent={<Shield className="w-4 h-4" />}
                            onPress={
                              isUser
                                ? undefined
                                : () => handleRoleChange(user.id, "USER")
                            }
                          >
                            Change to User
                          </DropdownItem>

                          <DropdownItem
                            key="role-admin"
                            aria-disabled={isAdmin}
                            className={
                              isAdmin
                                ? "text-gray-400 opacity-60 pointer-events-none"
                                : "text-blue-600"
                            }
                            startContent={<Shield className="w-4 h-4" />}
                            onPress={
                              isAdmin
                                ? undefined
                                : () => handleRoleChange(user.id, "ADMIN")
                            }
                          >
                            Change to Admin
                          </DropdownItem>
                        </>
                      );
                    })()}

                    {/* Block/Unblock */}
                    <DropdownItem
                      key="block"
                      className="text-yellow-600"
                      startContent={<Ban className="w-4 h-4" />}
                      onPress={() => handleToggleBlock(user.id, user.status)}
                    >
                      {user.status === "BLOCKED"
                        ? "Unblock User"
                        : "Block User"}
                    </DropdownItem>

                    {/* Delete */}
                    <DropdownItem
                      key="delete"
                      className="text-danger"
                      color="danger"
                      startContent={<Trash2 className="w-4 h-4" />}
                      onPress={() =>
                        handleDeleteClick(user.id, user.name, user.email)
                      }
                    >
                      Delete User
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Delete User Modal */}
      {selectedUser && (
        <DeleteUserModal
          isDeleting={isDeletingUser}
          isOpen={isDeleteModalOpen}
          userEmail={selectedUser.email}
          userName={selectedUser.name}
          onConfirm={handleConfirmDelete}
          onOpenChange={setIsDeleteModalOpen}
        />
      )}
    </div>
  );
};

export default UserManagementTable;
