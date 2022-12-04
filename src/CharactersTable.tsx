import { useState } from "react";
import { Character } from "./types";
import './CharactersTable.css';
import { Avatar } from "./Avatar";
import StatusBadge from "./StatusBadge";

type Props = {
    data: Character[]
};

export default function CharactersTable({ data }: Props) {
    const [mainChecked, setMainChecked] = useState(false);
    const [selectedById, setSelectedById] = useState<Record<number, boolean>>({});

    function toggleMainCheckbox(checked: boolean) {
        setMainChecked(checked);
        setSelectedById(data.reduce((acc, row) => {
            acc[row.id] = checked;
            return acc;
        }, {} as Record<number, boolean>));
    }

    function toggleCheckbox(id: number, checked: boolean) {
        if (!checked) setMainChecked(false);
        setSelectedById(prev => ({ ...prev, [id]: checked }));
    }
    
    return (
        <>
        <table>
            <colgroup>
                <col style={{width: '60px' }} />
                <col style={{width: '30%' }} />
                <col style={{width: '16%' }} />
                <col style={{width: 'calc(30% - 60px)' }} />
                <col style={{width: '12%' }} />
                <col style={{width: '12%' }} />
            </colgroup>
            <thead>
                <tr>
                    <th>
                        <input type="checkbox" 
                            onChange={e => toggleMainCheckbox(e.target.checked)}
                            checked={mainChecked}
                        />
                    </th>    
                    <th>Name</th>    
                    <th>Avatar</th>    
                    <th>Origin</th>    
                    <th>Gender</th>    
                    <th>Status</th>    
                </tr>
            </thead>
            <tbody>
                {data.map(row => {
                    const trClassName = row.status === 'Dead' ? 'inactive' : '';
                    const originClass = 'origin ' + (row.origin === 'unknown' ? 'unknown' : '');

                    return (
                        <tr key={row.id} className={trClassName}>
                            <td>
                                <input type="checkbox" 
                                    onChange={e => toggleCheckbox(row.id, e.target.checked)}
                                    checked={selectedById[row.id]}
                                />
                            </td>
                            <td>
                                <div className="name">{row.name}</div>
                                <div className="species">{row.species}</div>
                            </td>
                            <td><Avatar source={row.avatar} name={row.name} /></td>
                            <td className={originClass}>{row.origin}</td>
                            <td>{row.gender}</td>
                            <td><StatusBadge status={row.status}/></td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
        <div className="pagination"></div>
        </>
    );
}
