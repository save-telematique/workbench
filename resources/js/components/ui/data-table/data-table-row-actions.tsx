import React from "react";
import { Row } from "@tanstack/react-table";
import { Link } from "@inertiajs/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useTranslation } from "@/utils/translation";

export interface Action {
  label: string;
  icon?: keyof typeof LucideIcons;
  href?: string;
  onClick?: () => void;
  variant?: "default" | "destructive" | "outline" | "ghost";
  hidden?: boolean;
  separator?: boolean;
}

export interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  actions: Action[];
  menuLabel?: string;
}

export function DataTableRowActions<TData>({
  actions,
  menuLabel,
}: DataTableRowActionsProps<TData>) {
  const { __ } = useTranslation();
  const filteredActions = actions.filter(action => !action.hidden);
  
  if (filteredActions.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="text-right">
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">{__("common.open_menu")}</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {menuLabel && <DropdownMenuLabel>{menuLabel}</DropdownMenuLabel>}
        
        {filteredActions.map((action, index) => {
          const IconComponent = action.icon ? LucideIcons[action.icon] as LucideIcon : null;
          
          // Add separator before this item if requested
          if (action.separator && index > 0) {
            return (
              <React.Fragment key={`${action.label}-group`}>
                <DropdownMenuSeparator />
                {renderMenuItem(action, IconComponent)}
              </React.Fragment>
            );
          }
          
          return renderMenuItem(action, IconComponent, index);
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
  
  function renderMenuItem(action: Action, IconComponent: LucideIcon | null, index?: number) {
    const menuItem = (
      <DropdownMenuItem
        key={`${action.label}-${index}`}
        onClick={action.onClick}
        className={action.variant === "destructive" ? "text-destructive focus:text-destructive" : ""}
      >
        {IconComponent && <IconComponent className="mr-2 h-4 w-4" />}
        {action.label}
      </DropdownMenuItem>
    );
    
    return action.href 
      ? (
        <Link key={`${action.label}-link-${index}`} href={action.href}>
          {menuItem}
        </Link>
      ) 
      : menuItem;
  }
} 