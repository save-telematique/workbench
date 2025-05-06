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

interface Driver {
  id: string;
  surname: string;
  firstname: string;
}

interface DeleteDriverDialogProps {
  open: boolean;
  onOpenChange: () => void;
  driver: Driver;
}

export function DeleteDriverDialog({ open, onOpenChange, driver }: DeleteDriverDialogProps) {
  const { __ } = useTranslation();
  
  function handleDelete() {
    router.delete(route("drivers.destroy", driver.id), {
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
            {__("drivers.delete.title")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {__("drivers.delete.description", { name: `${driver.surname} ${driver.firstname}` })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{__("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {__("common.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 