import { Row } from "@tanstack/react-table";
import { Link } from "@inertiajs/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface Action {
  label: string;
  icon?: keyof typeof LucideIcons;
  href?: string;
  onClick?: () => void;
  variant?: "default" | "destructive" | "outline" | "ghost";
  hidden?: boolean;
}

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  actions: Action[];
}

export function DataTableRowActions<TData>({
  row,
  actions,
}: DataTableRowActionsProps<TData>) {
  const filteredActions = actions.filter(action => !action.hidden);
  
  if (filteredActions.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {filteredActions.map((action, index) => {
          const Icon = action.icon ? LucideIcons[action.icon] : null;
          
          const menuItem = (
            <DropdownMenuItem
              key={action.label}
              onClick={action.onClick}
              className={action.variant === "destructive" ? "text-destructive focus:text-destructive" : ""}
            >
              {Icon && <Icon className="mr-2 h-4 w-4" />}
              {action.label}
            </DropdownMenuItem>
          );
          
          return action.href 
            ? (
              <Link key={action.label} href={action.href}>
                {menuItem}
              </Link>
            ) 
            : menuItem;
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 