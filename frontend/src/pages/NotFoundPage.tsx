import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileQuestion, ArrowLeft } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center p-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400 mb-4 shadow-inner">
        <FileQuestion size={32} />
      </div>
      <h1 className="text-2xl font-bold text-neutral-100 mb-2">Page Not Found</h1>
      <p className="text-sm text-neutral-400 max-w-md mb-6">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Button asChild className="bg-blue-600 hover:bg-blue-500 text-white">
        <Link to="/">
          <ArrowLeft size={16} className="mr-2" />
          Back to Overview
        </Link>
      </Button>
    </div>
  );
}

export default NotFoundPage;
