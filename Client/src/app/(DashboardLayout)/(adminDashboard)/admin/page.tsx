'use client';
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Tab, Tabs } from "@heroui/tabs";
import { CreditCard, Users } from "lucide-react";

import { useGetAllUsers } from "@/src/hooks/user.hook";
import { UserActivity } from "@/src/components/modules/dashboard/ActivityTab";

const AdminDashboard = () => {
    const { data: AllUsers, isLoading: allUsersLoading } = useGetAllUsers();
    const { data: PremiumUsers, isLoading: premiumUsersLoading } = useGetAllUsers(
      `status=PREMIUM&role=USER`
    );
 
    const allUsersCount = AllUsers?.data?.length || 0;
    const premiumUsersCount = PremiumUsers?.data?.length || 0;
  
  
    const stats = [
      {
        title: "Total Users",
        value: allUsersCount,
        icon: <Users className="h-5 w-5 text-blue-500" />,
        loading: allUsersLoading,
      },
      {
        title: "Premium Users",
        value: premiumUsersCount,
        icon: <CreditCard className="h-5 w-5 text-purple-500" />,
        loading: premiumUsersLoading,
      },
    ];
  
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
          <p className="light:text-gray-500">Monitor your website&apos;s key metrics</p>
        </div>
  
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, index) => (
            <Card key={index} className="border-none bg-white/60 dark:bg-default-100/50">
              <CardBody className="flex flex-row items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  {stat.loading ? (
                    <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
                  ) : (
                    <p className="text-2xl font-semibold">{stat.value}</p>
                  )}
                </div>
                <div className="rounded-full bg-gray-100 p-3">{stat.icon}</div>
              </CardBody>
            </Card>
          ))}
        </div>
  
        <Card className="border-none">
          <CardHeader>
            <h3 className="text-lg font-semibold">Activity Overview</h3>
          </CardHeader>
          <CardBody>
            <Tabs aria-label="Activity options">
              <Tab key="all" title="All Activity" />
              <Tab key="users" title="User Activity">
                <UserActivity users={AllUsers?.data} />
              </Tab>
              <Tab key="posts" title="Post Activity" />
            </Tabs>
          </CardBody>
        </Card>
      </div>
    );
  };

  export default AdminDashboard;