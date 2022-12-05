import Select from 'react-select';
import '@/styles/MultiSelect.scss';


type SelectProps = {
    options: { value: string, label: string }[],
    onChange: (values: string[]) => void;
    placeholder?: string
}

export default function MultiSelect({ options, placeholder, onChange }: SelectProps) {
    return (
        <Select 
            isMulti
            closeMenuOnSelect={false}
            placeholder={placeholder}
            options={options}
            onChange={options => onChange(options.map(o => o.value))}
            classNames={{
                container: () => 'multi-select',
                control: () => 'control',
                option: () => 'option'
            }}
        />
    );
}

