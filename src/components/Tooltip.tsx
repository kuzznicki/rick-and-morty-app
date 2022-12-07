import { ReactElement, useRef } from "react";
import useCheckOverflow from "@/hooks/useCheckOverflow";
import { getReactElementText } from "@/utils";
import '@/styles/components/Tooltip.scss';

type Props = { children: ReactElement | string; };

export default function Tooltip({ children }: Props) {
    const ref = useRef(null);
    const isOverflowing = useCheckOverflow(ref);

    return (
        <div
            data-tooltip={getReactElementText(children)}
            className={'tooltip-wrapper' + (isOverflowing ? ' overflowing' : '')}
        >
            <span ref={ref}>{children}</span>
        </div>
    );
}
