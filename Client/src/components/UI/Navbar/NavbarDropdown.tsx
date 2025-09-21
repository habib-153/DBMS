"use client";

import { Avatar } from "@nextui-org/avatar";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/dropdown";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { useUser } from "@/src/context/user.provider";
import { logout } from "@/src/services/AuthService";
import { IUser } from "@/src/types";
import { protectedRoutes } from "@/src/constant";

interface IProps {
  user: IUser;
}

export default function NavbarDropdown({ user }: IProps) {
  const router = useRouter();
  const { setIsLoading: userLoading } = useUser();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    userLoading(true);

    if (protectedRoutes.some((route) => pathname.match(route))) {
      router.push("/");
    }

    toast.success("Logged out successfully");
  };

  const handleNavigation = (pathname: string) => {
    router.push(pathname);
  };

  return (
    <div className="flex items-center gap-4">
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Avatar
            isBordered
            as="button"
            className="transition-transform"
            size="md"
            src={user?.profilePhoto}
          />
        </DropdownTrigger>
        <DropdownMenu aria-label="Profile Actions" variant="flat">
          <DropdownItem
            key="profile"
            className="h-14 gap-2"
            textValue={`Signed in as ${user.email}`}
          >
            <p className="font-semibold">Signed in as</p>
            <p className="font-semibold">{user.email}</p>
          </DropdownItem>
          <DropdownItem onClick={() => handleNavigation("/profile")}>
            My Profile
          </DropdownItem>
          <DropdownItem
            onClick={() =>
              handleNavigation(
                user?.role === "ADMIN" ? "/admin" : "/user"
              )
            }
          >
            Dashboard
          </DropdownItem>
          <DropdownItem
            key="logout"
            color="danger"
            textValue="Log Out"
            onClick={() => handleLogout()}
          >
            Log Out
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}
