import { useEffect, useState } from 'react';
import '@/styles/components/SearchInput.scss';
import searchIcon from '@/assets/search.svg';

type SearchProps = {
    id: string,
    name: string,
    onChange: (query: string) => void
};

export default function SearchInput({ name, id, onChange }: SearchProps) {
    const [query, setQuery] = useState('');

    useEffect(() => {
        const timeout = setTimeout(() => onChange(query), 500);
        return () => clearTimeout(timeout);
    }, [query]);

    return (
        <div className="search-input">
            <input type="text"
                id={id}
                name={name}
                placeholder="Search"
                onChange={e => setQuery(e.target.value)}
            />
            <img className="icon" src={searchIcon} />
        </div>
    );
}
