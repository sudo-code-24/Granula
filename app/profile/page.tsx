"use client";

import React from 'react';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';
import { SidebarLayout } from '@/app/components/SidebarLayout';
import UnauthorizedAccess from '@/app/components/UnauthorizedAccess';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useClientSide } from '@/hooks/use-client-side';

export default function ProfilePage() {
  const isClient = useClientSide();
  const { user, isLoading, isAuthorized } = useAuthGuard();

  if (!isClient) return <LoadingSpinner />;
  if (isLoading) return <LoadingSpinner />;
  if (!isAuthorized) return <UnauthorizedAccess />;

  return (
    <SidebarLayout>
      {/* {user.profile && (
        <div>
          <pre className="p-3 rounded">
            {JSON.stringify(user.profile, null, 2)}
          </pre>
        </div>
      )} */}
      <div className="flex  justify-center px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-sm ">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
            <CardAction>Card Action</CardAction>
          </CardHeader>
          <CardContent>
            <p>Card Content</p>
          </CardContent>
          <CardFooter>
            <p>Card Footer</p>
          </CardFooter>
        </Card>
      </div>
      {/* <div className="min-h-screen bg-gray-100">
        <div className="py-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                </div>

                {user.role && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <p className="mt-1 text-sm text-gray-900">{user.role.name}</p>
                  </div>
                )}

                {user.profile && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Profile Information
                    </label>
                    <div className="mt-1 text-sm text-gray-900">
                      <pre className="bg-gray-50 p-3 rounded">
                        {JSON.stringify(user.profile, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </SidebarLayout>
  );
}