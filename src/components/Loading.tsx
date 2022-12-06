import reactLogo from '@/assets/react.svg';
import '@/styles/components/Loading.scss';

type Props = { message?: string };

export default function Loading({ message = 'Loading' }: Props) {
    return (
        <div className="loading-indicator">
            <img src={reactLogo} alt="Loading spinner" />        
            <div className="loading-text">{message}</div>
        </div>
    )
}