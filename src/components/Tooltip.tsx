import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactTooltip from "react-tooltip";

type Props = {
    children: ReactNode;
};

export default function Tooltip({ children }: Props) {
    const [showTooltip, setShowTooltip] = useState(false);
    const ref = useRef(children);
    console.log(ref);


    return (
        <>
            <span>{showTooltip ? 'show' : 'hide'}</span>
            <OverflowTester onChange={isOverflowing => setShowTooltip(isOverflowing)}>
                {children}
            </OverflowTester>
        </>
    );
}

type OverflowTesterProps = {
    children: ReactNode;
    onChange: (isOverflowing: boolean) => void;
};

function OverflowTester({ children, onChange }: OverflowTesterProps) {
    const [isOverflowing, setIsOverflowing] = useState(false);
    const ref = useRef(null);

    useEffect(() => setIsOverflowing(checkOverflow(ref.current)), []);
    useEffect(() => onChange(isOverflowing), [isOverflowing]);
    useLayoutEffect(() => {
        const handleResize = () => {
            const overflowing = checkOverflow(ref.current);
            if (overflowing !== isOverflowing) {
                onChange(overflowing);
                setIsOverflowing(overflowing);
            }
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <span className="overflow-tester" ref={ref}>{children}</span>
    );
}

function checkOverflow(el: HTMLElement | null) {
    if (!el) return false;
    return el.clientWidth < el.scrollWidth;
}