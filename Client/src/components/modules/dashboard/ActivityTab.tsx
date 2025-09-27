import { Avatar } from "@heroui/avatar";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Activity, Clock, FileText, TrendingUp, User } from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@heroui/table";

import { IUser } from "@/src/types";
import { IPost } from "@/src/types/post.types";

export const AllActivity = ({ chartData } : {chartData: any}) => {
    return (
      <div className="space-y-6">
        <div className="h-[300px] w-full">
          <ResponsiveContainer height="100%" width="100%">
            {/* <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line dataKey="usersCount" name="Users" stroke="#3b82f6" type="monotone" />
              <Line dataKey="postsCount" name="Posts" stroke="#22c55e" type="monotone" />
            </LineChart> */}
             <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line dataKey="userCount" stroke="#8884d8" type="monotone" />
            <Line dataKey="postCount" stroke="#82ca9d" type="monotone" />
          </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardBody>
              <h4 className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Latest Trends
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>User Growth Rate</span>
                  <Chip color="primary" variant="flat">+12.5%</Chip>
                </div>
                <div className="flex items-center justify-between">
                  <span>Post Engagement</span>
                  <Chip color="success" variant="flat">+8.3%</Chip>
                </div>
              </div>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <h4 className="mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>5 new users joined</span>
                  <span className="ml-auto text-sm text-gray-500">2h ago</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>10 new posts created</span>
                  <span className="ml-auto text-sm text-gray-500">4h ago</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  };
  
  // User Activity Tab Content
  export const UserActivity = ({ users } : {users: IUser[]}) => {

    return (
      <Table aria-label="User activity table">
        <TableHeader>
          <TableColumn>USER</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>JOINED</TableColumn>
          <TableColumn>POSTS</TableColumn>
        </TableHeader>
        <TableBody>
          {users.slice(0, 5).map((user, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar
                    fallback={<User className="h-5 w-5" />} 
                    src={user?.profilePhoto || `/api/placeholder/32/32`}
                  />
                  <div>
                    <p className="text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Chip 
                  color={user.status === 'PREMIUM' ? 'warning' : 'default'} 
                  variant="flat"
                >
                  {user.status}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(user?.createdAt as string).toLocaleDateString()}</span>
                </div>
              </TableCell>
              <TableCell>{user?.postCount || 0}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };
  
  // Post Activity Tab Content
  export const PostActivity = ({ posts }: {posts: IPost[]}) => {
    return (
      <Table aria-label="Post activity table">
        <TableHeader>
          <TableColumn>TITLE</TableColumn>
          <TableColumn>AUTHOR</TableColumn>
          <TableColumn>CREATED</TableColumn>
          <TableColumn>STATUS</TableColumn>
        </TableHeader>
        <TableBody>
          {posts.slice(0, 5).map((post, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">{post?.title}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar 
                    fallback={<User className="h-5 w-5" />}
                    src={post?.author?.profilePhoto || `/api/placeholder/32/32`}
                  />
                  <span>{post?.author?.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {/* <Clock className="h-4 w-4" />
                  <span>{new Date(post?.createdAt as string).toLocaleDateString()}</span> */}
                </div>
              </TableCell>
              <TableCell>
                <Chip 
                  color={post?.status === 'PENDING' ? 'success' : 'warning'} 
                  variant="flat"
                >
                  {post.status}
                </Chip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };
  
  // Updated Tab Content
//   const ActivityTabs = ({ chartData, users, posts }) => {
//     return (
//       <Tabs aria-label="Activity options">
//         <Tab key="all" title="All Activity">
//           <AllActivity chartData={chartData} />
//         </Tab>
//         <Tab key="users" title="User Activity">
//           <UserActivity users={users} />
//         </Tab>
//         <Tab key="posts" title="Post Activity">
//           <PostActivity posts={posts} />
//         </Tab>
//       </Tabs>
//     );
//   };
  
//   export default ActivityTabs;