"use client";

import { Avatar } from "@heroui/avatar";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { useUser } from "@/src/context/user.provider";
import { logout } from "@/src/services/AuthService";
import { IUser } from "@/src/types";
import { protectedRoutes } from "@/src/constant";
import { clearTokens } from "@/src/utils/tokenStorage";

interface IProps {
  user: IUser;
}

export default function NavbarDropdown({ user }: IProps) {
  const router = useRouter();
  const { setIsLoading: userLoading } = useUser();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    clearTokens(); // Clear client-side tokens
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
          <DropdownItem
            key="my-profile"
            onClick={() => handleNavigation("/profile")}
          >
            My Profile
          </DropdownItem>
          {user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" ? (
            <DropdownItem
              key="dashboard"
              onClick={() => handleNavigation("/admin")}
            >
              Dashboard
            </DropdownItem>
          ) : null}

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
