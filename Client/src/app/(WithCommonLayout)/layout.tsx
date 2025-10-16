import Footer from "@/src/components/modules/Shared/Footer";
import { Navbar } from "@/src/components/UI/Navbar/Navbar";
import NotificationToast from "@/src/components/UI/NotificationToast";

export default function layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative flex flex-col h-screen">
      <Navbar />
      <main className="container mx-auto max-w-7xl px-2 md:px-0 flex-grow">
        {children}
      </main>
      <Footer />
      <NotificationToast />
    </div>
  );
}
