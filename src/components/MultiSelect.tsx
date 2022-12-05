import Select from 'react-select';
import '@/styles/components/MultiSelect.scss';
import cssVars from '@/styles/_export.module.scss';

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
            theme={theme => ({
                ...theme,
                colors: {
                    ...theme.colors,
                    primary: cssVars.inputFocusColor,
                    primary25: cssVars.secondaryBluePale10,
                    primary50: cssVars.secondaryBluePale30,
                    neutral10: cssVars.primaryAnthracite80,
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

