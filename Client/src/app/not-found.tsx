'use client';
import { Button } from "@nextui-org/button";
import { FileQuestion } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="container px-4 mx-auto">
        <div className="max-w-lg mx-auto text-center">
          <FileQuestion className="mx-auto mb-4 w-24 h-24 text-gray-400" />

          <h1 className="mb-3 text-4xl font-bold text-gray-800 dark:text-gray-200">
            Page Not Found
          </h1>

          <p className="mb-6 text-lg text-gray-500 dark:text-gray-400">
            Oops! The page you&apos;re looking for seems to have vanished into
            thin air.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              className="font-semibold"
              color="primary"
              size="lg"
              variant="solid"
              onClick={() => router.push("/")}
            >
              Go Home
            </Button>

            <Button
              className="font-semibold"
              color="default"
              size="lg"
              variant="bordered"
              onClick={() => router.back()}
            >
              Go Back
            </Button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Need assistance?{" "}
            <Button
              className="font-medium"
              color="primary"
              variant="light"
              onClick={() => router.push("/contact")}
            >
              Contact Support
            </Button>
          </p>
        </div>
      </div>

      {/* Optional: Animated background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute left-[calc(50%-4rem)] top-10 -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:left-48 lg:top-[calc(50%-30rem)] xl:left-[calc(50%-24rem)]"
        >
          <div
            className="aspect-[1108/632] w-[69.25rem] bg-gradient-to-r from-primary-200 to-primary-500 opacity-20"
            style={{
              clipPath:
                "polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
