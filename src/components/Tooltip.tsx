import { MutableRefObject, ReactElement, ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import '@/styles/components/Tooltip.scss';
import { getReactElementText } from "@/utils";

type Props = {
    children: ReactElement | string;
};

export default function Tooltip({ children }: Props) {
    const ref = useRef(null);
    const isOverflowing = useCheckOverflow(ref);

    const className = 'tooltip-wrapper' + (isOverflowing ? ' overflowing' : '');
    const tooltipText = getReactElementText(children);

    return (
        <div className={className} data-tooltip={tooltipText}>
            <span ref={ref}>{children}</span>
        </div>
    );
}

function useCheckOverflow(ref: MutableRefObject<HTMLElement | null>) {
    const [isOverflowing, setIsOverflowing] = useState(false);

    function checkOverflow(el: HTMLElement | null) {
        return !!el && el.clientWidth < el.scrollWidth;
    }

    useEffect(() => setIsOverflowing(checkOverflow(ref.current)), []);
    
    useLayoutEffect(() => {
        const handleResize = () => {
            setIsOverflowing(checkOverflow(ref.current))
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    });

    return isOverflowing;
}