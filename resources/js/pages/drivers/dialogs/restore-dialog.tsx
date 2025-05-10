import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { useTranslation } from "@/utils/translation";
import { router } from "@inertiajs/react";
import { DriverResource } from "@/types";

interface RestoreDriverDialogProps {
  open: boolean;
  onOpenChange: () => void;
  driver: DriverResource;
}

export function RestoreDriverDialog({ open, onOpenChange, driver }: RestoreDriverDialogProps) {
  const { __ } = useTranslation();
  
  function handleRestore() {
    router.put(route("drivers.restore", { driver: driver.id }), {}, {
      onSuccess: () => {
        onOpenChange();
      }
    });
  }
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {__("drivers.restore.title")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {__("drivers.restore.description", { name: `${driver.surname} ${driver.firstname}` })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{__("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={handleRestore}>
            {__("common.restore")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 