import { useEffect, useState } from "react";
import '@/styles/components/Pagination.scss';
import chevronLeft from '@/assets/chevron-left.svg';
import chevronRight from '@/assets/chevron-right.svg';

type PagesHelperArray = (number | '...')[];
type Props = {
    itemsCount: number
    perPage: number
    initialPage?: number
    onChange: (firstIndex: number, lastIndex: number) => void
};

export default function Pagination({ itemsCount, perPage, initialPage = 1, onChange }: Props) {
    const [page, setPage] = useState(initialPage);
    const lastPage = Math.ceil(itemsCount / perPage);

    useEffect(() => changePage(1), [itemsCount]);

    function isValidPageNumber(pageNumber: number) {
        return Number.isInteger(pageNumber)
            && pageNumber >= 1
            && pageNumber <= lastPage;
    }

    function changePage(pageNumber: number) {
        if (isValidPageNumber(pageNumber)) {
            setPage(pageNumber);

            const lastIndex = pageNumber * perPage;
            const firstIndex = lastIndex - perPage;
            onChange(firstIndex, lastIndex);
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
        let pages: PagesHelperArray = [1, 2, 3, '...', lastPage - 2, lastPage - 1, lastPage];

        if (page <= 2 || page >= lastPage - 1) return pages;

        if (page === 3) {
            pages[3] = 4;
            pages[4] = '...';
        } else if (page === lastPage - 2) {
            pages[2] = '...';
            pages[3] = lastPage - 3;
        } else {
            pages = [1, '...', page - 1, page, page + 1, '...', lastPage];
        }

        return pages;
    }

    return (
        <div className="pagination" style={{ marginTop: '43px' }}>
            <button disabled={page <= 1} onClick={() => changePage(page - 1)}>
                <img src={chevronLeft} />
            </button>

            { pageNumbersToButtons(generatePageNumbers()) }

            <button disabled={page >= lastPage} onClick={() => changePage(page + 1)}>
                <img src={chevronRight} />
            </button>

        </div>
    );
}

function Separator() {
    return <span className="separator">{' ... '}</span>;
}