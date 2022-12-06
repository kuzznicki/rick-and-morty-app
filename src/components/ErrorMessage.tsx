import deadLogo from '@/assets/dead.svg';
import '@/styles/components/ErrorMessage.scss';

type Props = { message?: string, debugInfo?: string | null };

export default function ErrorMessage({ message = 'Something went wrong. Try again...', debugInfo = null }: Props) {
    return (
        <div className="error-indicator">
            <img src={deadLogo} alt="Error icon" />        
            <div className="error-text">{message}</div>
            { !!debugInfo && <div className='debug-info'>{debugInfo}</div> }
        </div>
    )
}