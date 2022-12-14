import Tooltip from "./Tooltip";
import { Status } from "@/types";
import '@/styles/components/StatusBadge.scss';
import unknownIcon from '@/assets/unknown.svg';
import aliveIcon from '@/assets/alive.svg';
import deadIcon from '@/assets/dead.svg';

const iconByStatus: { [key in Status]: string } = {
    Dead: deadIcon,
    Alive: aliveIcon,
    unknown: unknownIcon
};

type Props = { status: Status }

export default function StatusBadge({ status }: Props) {
    const badgeClass = 'status-badge' + (status === 'unknown' ? ' unknown' : '');
    return (
        <div className={badgeClass}>
            <img className="icon" src={iconByStatus[status]} alt={`${status} status icon`} />
            <Tooltip>{status}</Tooltip>
        </div>
    );
}
