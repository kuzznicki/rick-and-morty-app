import { MutableRefObject, useEffect, useLayoutEffect, useState } from "react";
import { checkOverflow } from "@/utils";

export default function useCheckOverflow(ref: MutableRefObject<HTMLElement | null>) {
    const [isOverflowing, setIsOverflowing] = useState(false);

    useEffect(() => setIsOverflowing(checkOverflow(ref.current)), []);
    
    useLayoutEffect(() => {
        const handleResize = () => setIsOverflowing(checkOverflow(ref.current));
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    });

    return isOverflowing;
}