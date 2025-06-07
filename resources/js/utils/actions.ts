import { router } from "@inertiajs/react";
import { useTranslation } from "./translation";
import { Action } from "@/components/ui/data-table/data-table-row-actions";
import { usePermission } from "./permissions";

interface ResourceInfo {
  id: string | number;
  resourceName: string;
  deleted_at?: string | null;
}

interface UseStandardActionsOptions {
  viewRoute?: boolean;
  editRoute?: boolean;
  deleteAction?: boolean;
  restoreAction?: boolean;
  customActions?: Action[];
  resourceName: string;
  routePrefix?: string | null;
  additionalParams?: Record<string, string | number>;
}

export function useStandardActions(
  options: UseStandardActionsOptions
) {
  const { __ } = useTranslation();
  const {
    viewRoute = true,
    editRoute = true,
    deleteAction = true,
    restoreAction = true,
    customActions = [],
    resourceName,
    routePrefix = null,
    additionalParams = {},
  } = options;

  // Get permissions at the hook level
  const canView = usePermission(`view_${resourceName}`);
  const canEdit = usePermission(`edit_${resourceName}`);
  const canDelete = usePermission(`delete_${resourceName}`);

  return <T extends ResourceInfo>(row: T): Action[] => {
    const isDeleted = !!row.deleted_at;
    const actions: Action[] = [];
    const singularResourceName = resourceName.slice(0, -1);

    const params = {
      ...additionalParams,
    };

    params[singularResourceName] = row.id;
    // View action
    if (viewRoute && canView) {
      actions.push({
        label: __(`common.actions.view`),
        icon: "Eye",
        href: route(`${routePrefix ?? resourceName}.show`, params),
      });
    }

    // Edit action
    if (editRoute && canEdit && !isDeleted) {
      actions.push({
        label: __(`common.actions.edit`),
        icon: "PenSquare",
        href: route(`${routePrefix ?? resourceName}.edit`, params),
      });
    }

    // Add custom actions
    if (customActions.length > 0) {
      actions.push(...customActions);
    }

    // Delete action (only for non-deleted items)
    if (deleteAction && canDelete && !isDeleted) {
      actions.push({
        label: __(`common.actions.delete`),
        icon: "Trash",
        onClick: () => {
          if (confirm(__(`common.confirmations.delete`))) {
            router.delete(route(`${routePrefix ?? resourceName}.destroy`, params));
          }
        },
        variant: "destructive",
        separator: true,
      });
    }

    // Restore action (only for soft-deleted items)
    if (restoreAction && canEdit && isDeleted) {
      actions.push({
        label: __(`common.actions.restore`),
        icon: "Undo",
        onClick: () => {
          if (confirm(__(`common.confirmations.restore`))) {
            router.put(route(`${routePrefix ?? resourceName}.restore`, params));
          }
        },
        separator: true,
      });
    }

    return actions;
  };
} 