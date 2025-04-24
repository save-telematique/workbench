import Heading from '@/components/heading';
import { useTranslation } from '@/utils/translation';
import { ReactNode } from 'react';

export default function UsersLayout({ children }: { children: ReactNode }) {
    const { __ } = useTranslation();

    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    return (
        <div className="px-4 py-6">
            <Heading title={__('users.list.heading')} description={__('users.list.description')} />

            <div>{children}</div>
        </div>
    );
}
