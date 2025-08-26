
import React from 'react';

export const PdfIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z" />
        <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v2zm-1.5-2.5H9v1h1c.28 0 .5-.22.5-.5s-.22-.5-.5-.5zm1.5 4.5h-1v-1H9V11h1.5v1h1v.5c0 .28-.22.5-.5.5zM18 14H16v-4h2v4zm-3.5-4H13v1h1.5V9h-3v6h1.5v-2.5h1V15H18V9h-3.5z" />
    </svg>
);
