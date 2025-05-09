import { ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import HeadingSmall from '@/components/heading-small';

interface UserPageLayoutProps {
  title: string;
  description: string;
  backUrl: string;
  backLabel: string;
  children: ReactNode;
  topRightContent?: ReactNode;
}

export default function UserPageLayout({ 
  title, 
  description, 
  backUrl, 
  backLabel, 
  children,
  topRightContent
}: UserPageLayoutProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <HeadingSmall 
          title={title} 
          description={description} 
        />
        
        <div className="flex items-center gap-2">
          {topRightContent}
          
          <Button variant="outline" asChild>
            <Link href={backUrl}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {backLabel}
            </Link>
          </Button>
        </div>
      </div>
      
      {children}
    </div>
  );
} 