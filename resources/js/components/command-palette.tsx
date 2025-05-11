import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslation } from '@/utils/translation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { usePermission, useTenantUser } from '@/utils/permissions';
import { useNavItems } from '@/hooks/use-nav-items';
import { router } from '@inertiajs/react';
import { Search, User, Car, Cpu, UserCog, Building2, LucideIcon } from 'lucide-react';
import { NavItem } from '@/types';
import axios from 'axios';

// Interface for unified search results
interface SearchResult {
  id: string;
  title: string;
  description: string;
  resource_type: 'user' | 'vehicle' | 'device' | 'driver' | 'tenant';
  url: string;
  icon: string;
}

// Custom Hook for managing command palette visibility and main shortcut
function useCommandPaletteState() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((currentOpen) => !currentOpen);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return { open, setOpen };
}

// Custom Hook for handling navigation shortcuts
function useCommandPaletteNavigation(
  navItems: NavItem[],
  isOpen: boolean,
  navigateTo: (href: string) => void
) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && /^[1-9]$/.test(e.key)) {
        const shortcutKey = e.key;
        const matchedItem = navItems.find((item) => item.shortcut === shortcutKey);

        if (matchedItem) {
          e.preventDefault();
          navigateTo(matchedItem.href);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, navItems, navigateTo]);
}

// Custom Hook for handling search functionality
function useCommandPaletteSearch(searchTypes: string) {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(async (value: string) => {
    if (value.length < 2) {
      setSearchResults([]);
      setIsSearching(false); // Ensure searching is false if query too short
      return;
    }

    setIsSearching(true);

    try {
      const url = route('api.search');
      const response = await axios.get(url, {
        params: {
          query: value,
          types: searchTypes,
          limit: 5,
        },
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchTypes]); // Add searchTypes to dependency array

  return { searchResults, isSearching, handleSearch, setSearchResults };
}


// Get icon component from icon name - can be outside component if it doesn't depend on hooks/props
const getIconComponent = (iconName: string): LucideIcon => {
  switch (iconName) {
    case 'user':
      return User;
    case 'car':
      return Car;
    case 'cpu':
      return Cpu;
    case 'user-cog':
      return UserCog;
    case 'building-2':
      return Building2;
    default:
      return Search;
  }
};

export function CommandPalette() {
  const { __ } = useTranslation();
  const { open, setOpen } = useCommandPaletteState();
  
  const isTenantUser = useTenantUser();
  const navItems = useNavItems();

  // Permissions for search
  const canSearchUsers = usePermission('view_users');
  const canSearchVehicles = usePermission('view_vehicles');
  const canSearchDevices = usePermission('view_devices');
  const canSearchDrivers = usePermission('view_drivers');
  const canSearchTenants = usePermission('view_tenants') && !isTenantUser;

  const searchTypes = useMemo(() => [
    canSearchUsers && 'users',
    canSearchVehicles && 'vehicles',
    canSearchDevices && 'devices',
    canSearchDrivers && 'drivers',
    canSearchTenants && 'tenants',
  ].filter(Boolean).join(','), [canSearchUsers, canSearchVehicles, canSearchDevices, canSearchDrivers, canSearchTenants]);
  
  const { searchResults, isSearching, handleSearch, setSearchResults } = useCommandPaletteSearch(searchTypes);

  const navigateTo = useCallback((href: string) => {
    router.visit(href);
    setOpen(false);
    setSearchResults([]); // Clear search results on navigation
  }, [setOpen, setSearchResults]);

  useCommandPaletteNavigation(navItems, open, navigateTo);
  
  // Group search results by resource type
  const resultsByType = useMemo(() => 
    searchResults.reduce<Record<string, SearchResult[]>>((groups, result) => {
      const resourceType = result.resource_type;
      if (!groups[resourceType]) {
        groups[resourceType] = [];
      }
      groups[resourceType].push(result);
      return groups;
    }, {}), 
  [searchResults]);

  // Translation map for resource types
  const resourceTypeLabels = useMemo(() => ({
    user: __('users.title'),
    vehicle: __('vehicles.title'),
    device: __('devices.title'),
    driver: __('drivers.title'),
    tenant: __('common.tenants'),
  }), [__]);

  return (
    <>
      <button
        className="inline-flex items-center gap-1 text-sm text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline-flex">{__('common.search')}</span>
        <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:inline-flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder={__('common.search_command_placeholder')} 
          onValueChange={handleSearch} // handleSearch is already memoized
        />
        <CommandList>
          <CommandEmpty>
            {isSearching 
              ? __('common.searching') 
              : (searchResults.length === 0 && __('common.no_results_found'))} 
          </CommandEmpty>

          {/* Navigation section */}
          {navItems.length > 0 && (
            <CommandGroup heading={__('common.navigation')}>
              {navItems.map((item: NavItem, index: number) => (
                <CommandItem
                  key={`nav-${item.href}-${index}`} // More robust key
                  onSelect={() => navigateTo(item.href)}
                  value={`${item.title} ${item.href}`} // Value should be unique string for filtering
                >
                  {React.createElement(item.icon as React.ElementType, { className: "mr-2 h-4 w-4" })}
                  {item.title}
                  {item.shortcut && (
                    <CommandShortcut><span className="text-xs">Ctrl + </span>{item.shortcut}</CommandShortcut>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Search results section - only show if we have results */}
          {Object.keys(resultsByType).length > 0 && (
            <>
              {navItems.length > 0 && <CommandSeparator />}
              
              {/* Display results by resource type */}
              {Object.entries(resultsByType).map(([resourceType, results]) => (
                <CommandGroup key={resourceType} heading={resourceTypeLabels[resourceType as keyof typeof resourceTypeLabels] || resourceType}>
                  {results.map((result) => (
                    <CommandItem
                      key={`${resourceType}-${result.id}`}
                      onSelect={() => navigateTo(result.url)}
                      value={`${result.title} ${result.description} ${result.url}`} // Value should be unique string
                    >
                      {React.createElement(getIconComponent(result.icon), { className: "mr-2 h-4 w-4" })}
                      {result.title}
                      {result.description && (
                        <span className="text-muted-foreground ml-2 text-xs">{result.description}</span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
} 