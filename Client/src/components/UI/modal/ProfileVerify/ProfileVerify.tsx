import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Crown, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { PressEvent } from "@react-types/shared";

import { useUser } from "@/src/context/user.provider";
import { updateAccessTokenInCookies } from "@/src/utils/updateAccessToken";
import { useGetVerified } from "@/src/hooks/user.hook";

interface VerifyModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const VerifyModal = ({ isOpen, onOpenChange }: VerifyModalProps) => {
  const { updateProfile } = useUser();

  const handleSuccess = (data: any) => {
    toast.dismiss();
    // console.log(data?.data);
    if (data?.data?.payment?.result) {
      //toast.success("Subscribed to Premium plan successfully!");
      window.location.href = data?.data?.payment?.payment_url;
    }
    // console.log(data?.data?.data);
    updateProfile(data?.data?.result);
    updateAccessTokenInCookies(data.data?.result);
  };

  const { mutate: handleGetVerified } = useGetVerified(handleSuccess);

  const handlePayment = () => {
    try {
      const payload = {
        paymentStatus: "Pending",
        premiumStart: format(new Date(), "dd-MM-yyyy"),
        premiumEnd: format(
          new Date(new Date().setMonth(new Date().getMonth() + 1)),
          "dd-MM-yyyy"
        ),
        premiumCharge: 10,
      };

      toast.loading("Processing payment...");
     handleGetVerified(payload);
      onOpenChange(false);
    } catch (error) {
      toast.dismiss();
      toast.error("An error occurred while processing the payment");
      //console.error("Client Error:", error);
    }
  };

  const PlanFeature = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center space-x-2">
      <CheckCircle2 className="h-5 w-5 text-primary" />
      <span className="text-gray-600">{children}</span>
    </div>
  );

  return (
    <Modal 
      classNames={{
        body: "py-6",
        backdrop: "bg-[#292f46]/50 backdrop-opacity-40",
        base: "border-[#292f46] bg-white dark:bg-[#19172c] text-[#a8b0d3]",
        header: "border-b-[1px] border-[#292f46]",
        footer: "border-t-[1px] border-[#292f46]",
      }} 
      isOpen={isOpen}
      scrollBehavior="outside"
      size="3xl"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose: ((e: PressEvent) => void) | undefined) => (
          <>
            <ModalHeader className="flex flex-col gap-1 items-center justify-center">
              <Crown className="h-8 w-8 text-warning" />
              <h2 className="text-2xl font-bold text-gray-800">Premium Subscription Plan</h2>
            </ModalHeader>
            <ModalBody>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Premium Plan */}
                <Card className="p-6 border-primary">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-semibold text-center">Monthly</h3>
                    <div className="text-center">
                      <div className="flex justify-center items-start">
                        <span className="text-2xl font-semibold mt-2 text-primary">$</span>
                        <span className="text-6xl font-bold">10</span>
                      </div>
                      <span className="text-sm text-gray-500">per month</span>
                    </div>
                    <div className="space-y-2">
                      <PlanFeature>Unlock Exclusive Content</PlanFeature>
                      <PlanFeature>Profile Verification Badge</PlanFeature>
                      <PlanFeature>Access Premium Travel Tips</PlanFeature>
                    </div>
                  </div>
                </Card>

                {/* Free Plan */}
                <Card className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-semibold text-center">Free</h3>
                    <div className="text-center">
                      <div className="flex justify-center items-start">
                        <span className="text-2xl font-semibold mt-2">$</span>
                        <span className="text-6xl font-bold">0</span>
                      </div>
                      <span className="text-sm text-gray-500">forever</span>
                    </div>
                    <div className="space-y-2">
                      <PlanFeature>Create & Share Posts</PlanFeature>
                      <PlanFeature>Follow Travelers</PlanFeature>
                      <PlanFeature>Comment on Stories</PlanFeature>
                    </div>
                  </div>
                </Card>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button className="flex-1" color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button className="flex-1" color="primary" onPress={handlePayment}>
                Get Verified
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default VerifyModal;