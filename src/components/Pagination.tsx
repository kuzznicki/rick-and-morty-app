import { useEffect, useState } from "react";
import '@/styles/components/Pagination.scss';
import chevronLeft from '@/assets/chevron-left.svg';
import chevronRight from '@/assets/chevron-right.svg';

type PagesHelperArray = (number | '...')[];
type Props = {
    totalPages: number
    initialPage?: number
    visible?: boolean
    onChange: (pageNumber: number) => void
};

export default function Pagination({ totalPages, initialPage = 1, visible = true, onChange }: Props) {
    const [page, setPage] = useState(initialPage);

    useEffect(() => { changePage(1) }, [totalPages]);

    function isValidPageNumber(pageNumber: number) {
        return Number.isInteger(pageNumber)
            && pageNumber >= 1
            && pageNumber <= totalPages;
    }

    function changePage(pageNumber: number) {
        if (isValidPageNumber(pageNumber)) {
            setPage(pageNumber);
            onChange(pageNumber);
        }
    }

    function pageNumbersToButtons(pageNumbers: PagesHelperArray) {
        return pageNumbers.map((pageNumber, i) => {
            if (pageNumber === '...') return <Separator key={i + '__separator'} />
            return (
                <button 
                    key={i + '__' + pageNumber}
                    className={pageNumber === page ? 'active' : ''}
                    onClick={() => changePage(pageNumber)}
                    >
                    {pageNumber}
                </button>
            )
        })
    }

    function generatePageNumbers(): PagesHelperArray {
        if (totalPages < 8) return new Array(totalPages).fill(0).map((e, i) => i + 1);
        
        let pages: PagesHelperArray = [1, 2, 3, '...', totalPages - 2, totalPages - 1, totalPages];

        if (page <= 2 || page >= totalPages - 1) return pages;

        if (page === 3) {
            pages[3] = 4;
            pages[4] = '...';
        } else if (page === totalPages - 2) {
            pages[2] = '...';
            pages[3] = totalPages - 3;
        } else {
            pages = [1, '...', page - 1, page, page + 1, '...', totalPages];
        }

        return pages;
    }

    return (
        <div className="pagination" style={{ marginTop: '43px', visibility: visible ? 'visible' : 'hidden' }}>
            <button disabled={page <= 1} onClick={() => changePage(page - 1)}>
                <img src={chevronLeft} />
            </button>

            { pageNumbersToButtons(generatePageNumbers()) }

            <button disabled={page >= totalPages} onClick={() => changePage(page + 1)}>
                <img src={chevronRight} />
            </button>

        </div>
    );
}

function Separator() {
    return <span className="separator">{' ... '}</span>;
}