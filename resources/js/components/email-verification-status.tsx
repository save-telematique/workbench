import React from 'react';
import { Link } from '@inertiajs/react';
import { useTranslation } from '@/utils/translation';
import FormattedDate from '@/components/formatted-date';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

interface EmailVerificationStatusProps {
  isVerified: boolean;
  verifiedAt?: string | null;
  resendRoute?: string;
  verificationStatus?: string;
  className?: string;
}

export default function EmailVerificationStatus({
  isVerified,
  verifiedAt,
  resendRoute,
  verificationStatus,
  className = ''
}: EmailVerificationStatusProps) {
  const { __ } = useTranslation();

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        {isVerified ? (
          <>
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-green-600">
              {__('settings.profile.email_verified')}
            </span>
          </>
        ) : (
          <>
            <XCircle className="h-5 w-5 text-amber-500" />
            <span className="text-sm font-medium text-amber-600">
              {__('settings.profile.email_unverified')}
            </span>
          </>
        )}
      </div>

      {isVerified && verifiedAt && (
        <div className="text-xs text-muted-foreground">
          {__('settings.profile.verified_at')}{' '}
          <FormattedDate date={verifiedAt} format="DATETIME_FULL" className="font-medium" />
        </div>
      )}

      {!isVerified && resendRoute && (
        <div className="flex flex-col space-y-2">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="mt-1 w-auto self-start text-xs"
          >
            <Link
              href={resendRoute}
              method="post"
              as="button"
            >
              {__('settings.profile.resend_verification')}
            </Link>
          </Button>
          
          {verificationStatus === 'verification-link-sent' && (
            <div className="text-xs font-medium text-green-600">
              {__('settings.profile.verification_sent')}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 