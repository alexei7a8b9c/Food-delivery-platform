import React from 'react';

const Pagination = ({ currentPage, totalPages, totalElements, onPageChange }) => {
    const pages = [];
    const maxVisible = 5;

    let startPage = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(0, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    if (totalPages <= 1) return null;

    return (
        <div className="pagination">
            <div className="pagination-info">
                Страница {currentPage + 1} из {totalPages} • Всего: {totalElements}
            </div>

            <div className="pagination-controls">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="btn-pagination"
                >
                    ← Назад
                </button>

                <div className="pagination-numbers">
                    {pages.map(page => (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`btn-page ${page === currentPage ? 'active' : ''}`}
                        >
                            {page + 1}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="btn-pagination"
                >
                    Вперед →
                </button>
            </div>
        </div>
    );
};

export default Pagination;