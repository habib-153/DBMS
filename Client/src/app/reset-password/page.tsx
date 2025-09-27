"use client";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Spinner } from "@heroui/react";
import { ArrowLeft, Compass, Mail } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { SubmitHandler } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import FXInput from "@/src/components/form/FXInput";
import FXForm from "@/src/components/form/FXForm";
import { resetPassword } from "@/src/services/AuthService";

const ResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const defaultValues = {
    email: email,
  };

  const onSubmit: SubmitHandler<{ email: string; newPassword: string }> = async (data) => {
    setIsLoading(true);
    const toastId = toast.loading("Reset your password...");
    const res = await resetPassword(data, token as string);

    if(res?.success){
      setIsLoading(false);
      setIsSuccess(true);
      toast.success("Password reset successful.", {id: toastId});
    }else{
      setIsLoading(false);
      toast.error(res?.message, {id: toastId});
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-sky-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md mx-auto px-4">
        <CardHeader className="flex flex-col gap-2 items-center">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
            <Compass className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-2xl font-bold text-center">
            Lost Your Travel Compass?
          </h1>
          <p className="text-sm text-default-500 text-center">
            Don&apos;t worry, fellow traveler! We&apos;ll help you get back on
            track.
          </p>
        </CardHeader>
        <CardBody>
          {isSuccess ? (
            <div className="flex flex-col gap-4 items-center text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-teal-600" />
              </div>
              <h2 className="text-xl font-semibold">
                Password Reset Successful
              </h2>
              <p className="text-default-500">
                Your password has been reset. Now You can Login with your new
                password.
              </p>
              <Button
                as={Link}
                className="mt-4"
                color="primary"
                href="/login"
                startContent={<ArrowLeft size={16} />}
                variant="flat"
              >
                Back to Login
              </Button>
            </div>
          ) : (
            <FXForm defaultValues={defaultValues} onSubmit={onSubmit}>
              <div className="py-3">
                <FXInput
                  isRequired
                  label="Email"
                  name="email"
                  type="email"
                />
              </div>
              <div className="py-3">
                <FXInput
                  isRequired
                  label="New Password"
                  name="newPassword"
                  type="password"
                />
              </div>
              <div className="w-full text-center">
                <Button
                  className="mt-2"
                  color="primary"
                  isLoading={isLoading}
                  spinner={<Spinner color="white" size="sm" />}
                  type="submit"
                >
                  Reset Password
                </Button>
              </div>
            </FXForm>
          )}
        </CardBody>
      </Card>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-100 rounded-tr-full opacity-50" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-sky-100 rounded-bl-full opacity-50" />
    </div>
  );
};

export default ResetPassword;
