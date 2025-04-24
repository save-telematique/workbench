import React from 'react';
import { useTranslation } from '@/utils/translation';
import FormattedDate from '@/components/formatted-date';
import { CheckCircle, XCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface EmailVerificationCompactProps {
  isVerified: boolean;
  verifiedAt?: string | null;
  className?: string;
}

export default function EmailVerificationCompact({
  isVerified,
  verifiedAt,
  className = ''
}: EmailVerificationCompactProps) {
  const { __ } = useTranslation();

  return (
    <div className={`inline-flex ${className}`}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex cursor-help">
            {isVerified ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-amber-500" />
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          {isVerified && verifiedAt ? (
            <>
              {__('tenant_users.fields.email_verified_at')}{' '}
              <FormattedDate 
                date={verifiedAt} 
                format="DATETIME_FULL"
                className="font-medium" 
              />
            </>
          ) : (
            __('tenant_users.fields.email_not_verified')
          )}
        </TooltipContent>
      </Tooltip>
    </div>
  );
} 