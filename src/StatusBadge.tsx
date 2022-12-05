import React from "react";
import { Status } from "./types";
import deadIcon from './assets/dead.svg';
import aliveIcon from './assets/alive.svg';
import unknownIcon from './assets/unknown.svg';
import '@/styles/StatusBadge.scss';

const iconByStatus: { [key in Status]: string } = {
    Dead: deadIcon,
    Alive: aliveIcon,
    unknown: unknownIcon
};

type Props = { status: Status }

export default function StatusBadge({ status }: Props) {
    const badgeClass = "status-badge " + (status === 'unknown' ? 'unknown' : '');
    return (
        <div className={badgeClass}>
            <img className="icon" src={iconByStatus[status]} alt={`${status} status icon`} />
            <span className="label">{status}</span>
        </div>
    );
}