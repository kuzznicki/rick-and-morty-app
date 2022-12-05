import React from "react";
import searchIcon from './assets/search.svg';
import '@/styles/SearchInput.scss';

type SearchProps = {
    id: string,
    name: string,
    onChange: (query: string) => void
};

export default function SearchInput({ name, id, onChange }: SearchProps) {
    return (
        <div className="search-input">
            <input type="text" 
                id={id} 
                name={name} 
                placeholder="Search" 
                onChange={e => onChange(e.target.value)}
            />
            <img className="icon" src={searchIcon} />
        </div>
    );
}