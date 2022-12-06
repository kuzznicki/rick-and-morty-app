import { useState } from "react";
import StatusBadge from "./StatusBadge";
import { Avatar } from "./Avatar";
import { Character } from "@/types";
import '@/styles/components/CharactersTable.scss';
import Tooltip from "./Tooltip";

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
                <col style={{width: '25%' }} />
                <col style={{width: '20%' }} />
                <col style={{width: 'calc(30% - 60px)' }} />
                <col style={{width: '11%' }} />
                <col style={{width: '14%' }} />
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
                    const { id, name, species, avatar, origin, gender, status } = row;
                    const trClassName = status === 'Dead' ? 'inactive' : '';
                    const originClass = 'origin ' + (origin === 'unknown' ? 'unknown' : '');

                    return (
                        <tr key={id} className={trClassName}>
                            <td>
                                <input type="checkbox" 
                                    onChange={e => toggleCheckbox(id, e.target.checked)}
                                    checked={selectedById[id]}
                                />
                            </td>
                            <td>
                                <span className="name"><Tooltip>{name}</Tooltip></span>
                                <span className="species"><Tooltip>{species}</Tooltip></span>
                            </td>
                            <td>
                                <Avatar source={avatar} name={name} />
                            </td>
                            <td className={originClass}>
                                <Tooltip>{origin}</Tooltip>
                            </td>
                            <td>
                                <Tooltip>{gender}</Tooltip>
                            </td>
                            <td>
                                <StatusBadge status={status}/>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
        </>
    );
}
