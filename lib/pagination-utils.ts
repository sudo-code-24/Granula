/**
 * Pagination utility functions
 */
export const paginationUtils = {
  /**
   * Handles page change with scroll to top
   */
  handlePageChange: (page: number, setCurrentPage: (page: number) => void) => {
    setCurrentPage(page);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  },

  /**
   * Handles previous page navigation
   */
  handlePrevious: (currentPage: number, totalPages: number, setCurrentPage: (page: number) => void) => {
    if (currentPage > 1) {
      paginationUtils.handlePageChange(currentPage - 1, setCurrentPage);
    }
  },

  /**
   * Handles next page navigation
   */
  handleNext: (currentPage: number, totalPages: number, setCurrentPage: (page: number) => void) => {
    if (currentPage < totalPages) {
      paginationUtils.handlePageChange(currentPage + 1, setCurrentPage);
    }
  },

  /**
   * Generates page numbers for pagination display
   */
  getPageNumbers: (currentPage: number, totalPages: number): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return pages;
  },
};
