import { ArrowLeft } from "lucide-react";
import ConfirmationDialog from "./ConfirmationDialog";

interface LeaveGameConfirmProps {
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
}

function LeaveGameConfirm({
  onCancel,
  onConfirm,
  open,
}: LeaveGameConfirmProps) {
  return (
    <ConfirmationDialog
      cancelLabel="Stay"
      confirmIcon={<ArrowLeft className="h-4 w-4" strokeWidth={2.35} />}
      confirmLabel="Leave"
      description="Current moves and timers will be lost."
      id="leave-game-confirm-title"
      kicker="Leave game"
      onCancel={onCancel}
      onConfirm={onConfirm}
      open={open}
      title="Go back to setup?"
    />
  );
}

export default LeaveGameConfirm;
