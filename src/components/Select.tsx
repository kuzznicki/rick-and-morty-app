import '@/styles/Select.scss';

type SelectProps = {
    options: string[],
    onChange: (selected: string) => void;
    placeholder?: string
}

export default function Select({ options, placeholder, onChange }: SelectProps) {
    return (
        <select onChange={(e) => onChange(e.target.value)} defaultValue={placeholder}>
            { !!placeholder && <option key={placeholder} value={''} >{placeholder}</option> }
            { options.map(o => <option key={o} value={o}>{o}</option>) }
        </select>
    );
}

