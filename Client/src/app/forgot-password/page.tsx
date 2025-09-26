'use client';
import { useState } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader,
  Input,
  Button,
  Link,
  Spinner
} from "@heroui/react";
import { Compass, Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { forgotPassword } from '@/src/services/AuthService';



export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading("Sending recovery instructions...");
    const userData = {email: email};

    const res = await forgotPassword(userData);

    if(res?.err){
        setIsLoading(false);
        toast.error(res?.message, {id: toastId});
    }else{
        setIsSuccess(true);
        setIsLoading(false);
        setEmail("");
        toast.success("Recovery instructions sent successfully.", {id: toastId})
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-sky-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md mx-auto">
        <CardHeader className="flex flex-col gap-2 items-center">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
            <Compass className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-2xl font-bold text-center">Lost Your Travel Compass?</h1>
          <p className="text-sm text-default-500 text-center">
            Don&apos;t worry, fellow traveler! We&apos;ll help you get back on track.
          </p>
        </CardHeader>
        <CardBody>
          {isSuccess ? (
            <div className="flex flex-col gap-4 items-center text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-teal-600" />
              </div>
              <h2 className="text-xl font-semibold">Check Your Email</h2>
              <p className="text-default-500">
                We&apos;ve sent recovery instructions to your email. 
                They&apos;re on their way faster than a direct flight!
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
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <Input
                label="Email Address"
                labelPlacement="outside"
                placeholder="adventurer@email.com"
                startContent={<Mail className="text-default-400" size={16} />}
                type="email"
                value={email}
                onValueChange={setEmail}
              />
              <Button
                className="mt-2"
                color="primary"
                isLoading={isLoading}
                spinner={<Spinner color="white" size="sm" />}
                type="submit"
              >
                Reset Password
              </Button>
              <div className="flex justify-center mt-4">
                <Button
                  as={Link}
                  color="primary"
                  href="/login"
                  variant="light"
                >
                  Back to Login
                </Button>
              </div>
            </form>
          )}
        </CardBody>
      </Card>
      
      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-100 rounded-tr-full opacity-50" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-sky-100 rounded-bl-full opacity-50" />
    </div>
  );
}