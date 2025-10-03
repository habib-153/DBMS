"use client";

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Spinner,
} from "@heroui/react";
import { format } from "date-fns";
import { CheckCircle, XCircle, Flag, AlertTriangle } from "lucide-react";

import { useGetPendingReports, useReviewReport } from "@/src/hooks/admin.hook";

interface Report {
  id: string;
  postId: string;
  userId: string;
  reason: string;
  description?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  userName: string;
  userEmail: string;
  userProfilePhoto?: string;
  postTitle?: string;
  postVerificationScore?: number;
}

const reasonLabels: Record<string, string> = {
  spam: "Spam",
  inappropriate: "Inappropriate Content",
  violence: "Violence or Harmful Content",
  harassment: "Harassment or Bullying",
  false_info: "False Information",
  other: "Other",
};

const reasonColors: Record<string, "danger" | "warning" | "default"> = {
  spam: "warning",
  inappropriate: "danger",
  violence: "danger",
  harassment: "danger",
  false_info: "warning",
  other: "default",
};

export default function AdminReportsPage() {
  const { data: reports, isLoading } = useGetPendingReports();
  const { mutate: reviewReport, isPending } = useReviewReport();

  const handleApprove = (reportId: string) => {
    reviewReport({ reportId, action: "APPROVE" });
  };

  const handleReject = (reportId: string) => {
    reviewReport({ reportId, action: "REJECT" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Report Management</h1>
        <p className="text-default-500">
          Review and moderate user reports on posts
        </p>
      </div>

      {reports?.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <Flag className="mx-auto mb-4 text-default-300" size={48} />
            <p className="text-xl font-semibold mb-2">No Pending Reports</p>
            <p className="text-default-500">
              All reports have been reviewed. Great job!
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports?.map((report: Report) => (
            <Card key={report.id} className="border-l-4 border-l-warning">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Chip
                      color={reasonColors[report.reason]}
                      size="sm"
                      variant="flat"
                    >
                      {reasonLabels[report.reason] || report.reason}
                    </Chip>
                    <Chip size="sm" variant="flat">
                      {format(new Date(report.createdAt), "MMM dd, yyyy")}
                    </Chip>
                  </div>
                  <h3 className="text-lg font-semibold mb-1">
                    {report.postTitle || "Post"}
                  </h3>
                  <p className="text-sm text-default-500">
                    Reported by: {report.userName} ({report.userEmail})
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    color="success"
                    isLoading={isPending}
                    size="sm"
                    startContent={<CheckCircle size={16} />}
                    onPress={() => handleApprove(report.id)}
                  >
                    Approve
                  </Button>
                  <Button
                    color="danger"
                    isLoading={isPending}
                    size="sm"
                    startContent={<XCircle size={16} />}
                    variant="flat"
                    onPress={() => handleReject(report.id)}
                  >
                    Reject
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                {report.description && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold mb-1">Description:</p>
                    <p className="text-sm text-default-600">
                      {report.description}
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="text-warning" size={16} />
                    <span className="font-semibold">Verification Score:</span>
                    <span
                      className={
                        (report.postVerificationScore ?? 0) >= 40
                          ? "text-success"
                          : (report.postVerificationScore ?? 0) >= 20
                            ? "text-warning"
                            : "text-danger"
                      }
                    >
                      {report.postVerificationScore ?? 0}
                    </span>
                  </div>
                  <div className="text-default-500">
                    Approving will reduce score by 5 points
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
