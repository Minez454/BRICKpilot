import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function BrickChat() {
  return (
    <div className="min-h-screen bg-gray-50" data-testid="brick-chat-page">
      <div className="p-4">
        <h1>BRICK Chat (Under Construction)</h1>
        <Button onClick={() => toast.success("Feature coming soon!")}>
          Test Toast
        </Button>
      </div>
    </div>
  );
}
