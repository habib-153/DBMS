"use client";
import { Button } from "@nextui-org/button";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, SubmitHandler } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Card } from "@nextui-org/card";

import FXForm from "@/src/components/form/FXForm";
import FXInput from "@/src/components/form/FXInput";
import loginValidationSchema from "@/src/schema/loginSchema";
import { useUser } from "@/src/context/user.provider";
import { useUserLogin } from "@/src/hooks/auth.hook";

const DemoCredentials = () => (
  <Card className="mt-4 light:bg-gray-50 md:absolute md:top-0 md:right-1 lg:min-w-64 lg:right-5">
    {/* <CardHeader className="p-4 sm:p-6">
      <h2 className="text-base sm:text-lg">Demo Credentials</h2>
    </CardHeader>
    <CardBody className="p-4 sm:p-6">
      <div className="space-y-3 sm:space-y-4">
        <div>
          <h3 className="font-semibold">User:</h3>
          <div className="ml-2 sm:ml-4 space-y-1 text-xs sm:text-sm">
            <p>Email: user123@gmail.com</p>
            <p>Password: 123456</p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold">Admin:</h3>
          <div className="ml-2 sm:ml-4 space-y-1 text-xs sm:text-sm">
            <p>Email: admin@gmail.com</p>
            <p>Password: 123456</p>
          </div>
        </div>
      </div>
    </CardBody> */}
  </Card>
);

const LoginPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setIsLoading: userLoading } = useUser();

  const redirect = searchParams.get("redirect");

  const { mutate: handleUserLogin, isPending, isSuccess } = useUserLogin();

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    handleUserLogin(data);
    userLoading(true);
  };

  useEffect(() => {
    if (!isPending && isSuccess) {
      if (redirect) {
        router.push(redirect);
      } else {
        router.push("/");
      }
    }
  }, [isPending, isSuccess]);

  return (
    <div className="flex relative min-h-[calc(100vh-200px)] w-full flex-col items-center justify-center px-4 py-8">
      <h3 className="my-2 text-xl sm:text-2xl font-bold text-center">
        Login with Warden
      </h3>
      <p className="mb-4 text-sm sm:text-base text-center">
        Welcome Back! Let&lsquo;s Get Started
      </p>
      <div className="w-full max-w-[420px] md:w-[35%]">
        <DemoCredentials />
        <FXForm
          resolver={zodResolver(loginValidationSchema)}
          onSubmit={onSubmit}
        >
          <div className="py-2 sm:py-3">
            <FXInput label="Email" name="email" type="email" />
          </div>
          <div className="py-2 sm:py-3">
            <FXInput label="Password" name="password" type="password" />
          </div>
          <div className="flex items-center">
            <Link href={"/forgot-password"}>
              <button className="-mr-3 w-max" type="reset">
                <span className="text-xs sm:text-sm tracking-wide text-red-500">
                  Forgot password ?
                </span>
              </button>
            </Link>
          </div>
          <Button
            className="my-3 w-full rounded-md bg-brand-gradient font-semibold text-white text-sm sm:text-base"
            size="lg"
            type="submit"
          >
            Login
          </Button>
        </FXForm>
        <div className="text-center text-sm sm:text-base">
          Don&lsquo;t have account? <Link href={"/register"}>Register</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
