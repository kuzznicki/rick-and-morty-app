import Select from 'react-select';
import '@/styles/components/MultiSelect.scss';
import cssVars from '@/styles/_export.module.scss';
import { useEffect, useState } from 'react';

type SelectProps = {
    options: { value: string, label: string }[],
    onChange: (values: string[]) => void;
    placeholder?: string
}

export default function MultiSelect({ options, placeholder, onChange }: SelectProps) {
    const [values, setValues] = useState<string[]>([]);
    
    useEffect(() => {
        const timeout = setTimeout(() => onChange(values), 500);
        return () => clearTimeout(timeout);        
    }, [values]);

    return (
        <Select 
            isMulti
            closeMenuOnSelect={false}
            placeholder={placeholder}
            options={options}
            onChange={options => setValues(options.map(o => o.value))}
            theme={theme => ({
                ...theme,
                colors: {
                    ...theme.colors,
                    primary: cssVars.inputFocusColor,
                    primary25: cssVars.secondaryBluePale10,
                    primary50: cssVars.secondaryBluePale30,
                    neutral10: cssVars.secondaryBluePale15,
                    neutral80: cssVars.primaryAnthracite80,
                    neutral20: cssVars.inputBorderColor,
                }
            })}
            classNames={{
                container: () => 'multi-select',
                control: () => 'control',
                option: () => 'option'
            }}
        />
    );
}

