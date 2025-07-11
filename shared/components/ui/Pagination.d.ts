import React from 'react';
interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    showPrevNext?: boolean;
    className?: string;
}
export declare const Pagination: React.FC<PaginationProps>;
export default Pagination;
//# sourceMappingURL=Pagination.d.ts.map