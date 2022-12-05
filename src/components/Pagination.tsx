import { ReactNode, useState } from "react"
import '@/styles/Pagination.scss'

type State = { page: number };
type Action = { type: string };
type Props = {
    itemsCount: number
    perPage: number
    initialPage?: number
    onChange: (firstIndex: number, lastIndex: number) => void
};

function reducer(state: State, action: Action) {
    return state;
}

export default function Pagination({ itemsCount, perPage, initialPage = 1, onChange }: Props) {
    const [page, setPage] = useState(initialPage);
    const lastPage = Math.ceil(itemsCount / perPage);

    const first3 = [1, 2, 3].filter(isValidPageNumber);
    const last3 = [-2, -1, 0].map(e => e + lastPage).filter(e => isValidPageNumber(e) && !first3.includes(e));
    const mid3 = [-1, 0, 1].map(e => e + page).filter(e => isValidPageNumber(e) && ![...first3, ...last3].includes(e));

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

    function numbersToButtons(numbers: number[]): ReactNode {
        return numbers.map(number => (
            <button
                key={number}
                className={number === page ? 'active' : ''}
                onClick={() => changePage(number)}>
                {number}
            </button>
        ));
    }

    function isSeparatorNeeded(pagesOnLeft: number[], pagesOnRight: number[]) {
        const left = pagesOnLeft.at(-1);
        const right = pagesOnRight.at(0);
        if (left === undefined || right === undefined) return false;
        return right - left > 1;
    }

    return (
        <div className="pagination" style={{ marginTop: '43px' }}>
            <button disabled={page <= 1} onClick={() => changePage(page - 1)}>
                &lt;
            </button>
            {numbersToButtons(first3)}
            {isSeparatorNeeded(first3, mid3) && <Separator />}
            {numbersToButtons(mid3)}
            {isSeparatorNeeded(mid3, last3) && <Separator />}
            {numbersToButtons(last3)}
            <button disabled={page >= lastPage} onClick={() => changePage(page + 1)}>
                &gt;
            </button>

        </div>
    );
}

function Separator() {
    return <span className="separator">{' ... '}</span>;
}