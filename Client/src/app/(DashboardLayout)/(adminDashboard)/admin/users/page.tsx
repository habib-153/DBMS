"use client";
import { Chip } from "@heroui/chip";
import { User } from "@heroui/user";
import { useCallback } from "react";
import { Button } from "@heroui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { Tooltip } from "@heroui/tooltip";
import { Trash2, UserCog } from "lucide-react";
import { Spinner } from "@heroui/react";

import { useUser } from "@/src/context/user.provider";
import { useDeleteUser, useGetAllUsers, useUpdateUserRole } from "@/src/hooks/user.hook";
import { IUser } from "@/src/types";

const UserManagement = () => {
  const { data } = useGetAllUsers();
  const {mutate: deleteUser} = useDeleteUser();
  const { mutate: updateUserRole } = useUpdateUserRole();
  const { user } = useUser();

  const userData = data?.data;

  const columns = [
    { name: "NAME", uid: "name" },
    { name: "EMAIL", uid: "email" },
    { name: "ROLE", uid: "role" },
    { name: "STATUS", uid: "status" },
    { name: "ACTIONS", uid: "actions" },
  ];

  const handleUpdateUser = (userId: string, role: string) => {
    const payload = {
      role: role === "ADMIN" ? "USER" : "ADMIN",
    };

    updateUserRole({ payload, id: userId });
  }

    const handleDeleteUser = (userId: string) => {
        deleteUser({ id: userId });
    }

  const renderCell = useCallback(
    (singleUser: IUser, columnKey: React.Key) => {
      const cellValue = singleUser[columnKey as keyof IUser];

      switch (columnKey) {
        case "name":
          return (
            <User
              avatarProps={{ radius: "lg", src: singleUser.profilePhoto }}
              className=" text-xl"
              name={String(cellValue)}
            >
              <span className="text-lg">{singleUser.name}</span>
            </User>
          );
        case "email":
          return (
            <div className="flex flex-col">
              <p className=" text-sm">{String(cellValue)}</p>
            </div>
          );
        case "role":
          return (
            <div className="flex flex-col">
              <p className=" text-sm capitalize">{String(cellValue)}</p>
            </div>
          );
        case "status":
          return (
            <Chip
              className="capitalize"
              color={cellValue === "PREMIUM" ? "success" : "warning"}
              size="sm"
              variant="flat"
            >
              <span className="">{String(cellValue)}</span>
            </Chip>
          );
        case "actions":
          return (
            <div className="relative flex justify-center items-center gap-2">
              <Tooltip content={<span>Delete user</span>}>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={() => handleDeleteUser(singleUser?.id)}
                >
                  <Trash2 className="h-4 w-4 text-danger" />
                </Button>
              </Tooltip>

              <Tooltip
                content={
                  singleUser?.role === "ADMIN"
                    ? "Change to User"
                    : "Change to Admin"
                }
              >
                <Button
                  isIconOnly
                  isDisabled={user?.email === singleUser?.email}
                  size="sm"
                  variant="light"
                  onPress={() => handleUpdateUser(singleUser?.id, singleUser?.role)}
                >
                  <UserCog
                    className={`h-4 w-4 ${
                      singleUser.role === "ADMIN"
                        ? "text-warning"
                        : "text-primary"
                    }`}
                  />
                </Button>
              </Tooltip>
            </div>
          );

        default:
          return <span>{String(cellValue)}</span>;
      }
    },
    [user?.email]
  );

  return (
    <>
      <div className="">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-gray-500">Manage users and their roles</p>
        </div>
        <div className="overflow-x-auto">
          {userData?.length > 0 && user ? (
            <Table
              aria-label="Users table with custom cells"
              className="min-w-full"
            >
              <TableHeader columns={columns}>
                {(column) => (
                  <TableColumn
                    key={column.uid}
                    align={
                      column.uid === "name" || column.uid === "email"
                        ? "start"
                        : "center"
                    }
                  >
                    {column.name}
                  </TableColumn>
                )}
              </TableHeader>
              <TableBody items={userData}>
                {(item: IUser) => (
                  <TableRow key={item.id}>
                    {(columnKey) => (
                      <TableCell key={columnKey}>
                        {renderCell(item, columnKey)}
                      </TableCell>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          ) : (
            <Table aria-label="Example empty table">
              <TableHeader>
                <TableColumn>NAME</TableColumn>
                <TableColumn>ROLE</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTION</TableColumn>
              </TableHeader>
              <TableBody emptyContent={<Spinner />}>{[]}</TableBody>
            </Table>
          )}
        </div>
      </div>
    </>
  );
};

export default UserManagement;
