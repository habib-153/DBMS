import { Button } from '@nextui-org/button';
import { Card, CardBody, CardFooter, CardHeader } from '@nextui-org/card';
import { Skeleton } from '@nextui-org/skeleton';
import React from 'react';

export default function PostCardSkeleton() {
  return (
    <Card className="w-full space-y-5 p-4" radius="lg">
      <CardHeader className="justify-between">
        <div className="flex gap-3">
          <Skeleton className="rounded-full w-12 h-12"/>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-24 rounded-lg"/>
            <Skeleton className="h-3 w-16 rounded-lg"/>
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="w-20 h-8 rounded-lg"/>
          <Skeleton className="w-8 h-8 rounded-lg"/>
        </div>
      </CardHeader>

      <CardBody className="px-3 py-0 space-y-3">
        <Skeleton className="w-3/4 rounded-lg">
          <div className="h-6 rounded-lg bg-default-200" />
        </Skeleton>
        
        <Skeleton className="rounded-lg">
          <div className="h-[370px] rounded-lg bg-default-300" />
        </Skeleton>
        
        <div className="space-y-3">
          <Skeleton className="w-full rounded-lg">
            <div className="h-4 w-full rounded-lg bg-default-200" />
          </Skeleton>
          <Skeleton className="w-5/6 rounded-lg">
            <div className="h-4 w-full rounded-lg bg-default-200" />
          </Skeleton>
          <Skeleton className="w-4/6 rounded-lg">
            <div className="h-4 w-full rounded-lg bg-default-200" />
          </Skeleton>
        </div>
      </CardBody>

      <CardFooter className="gap-3">
        <Skeleton className="rounded-lg">
          <Button className="w-24" size="md">Button</Button>
        </Skeleton>
        <Skeleton className="rounded-lg">
          <Button className="w-24" size="md">Button</Button>
        </Skeleton>
      </CardFooter>
    </Card>
  );
}