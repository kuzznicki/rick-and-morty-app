import { ReactElement } from "react";
import { ApiCharacterSchema } from "./types";

export function getSpeciesOptions() {
    // docs page does not mention available species so I needed to hard code them 
    const species = ["Human","Alien","Humanoid","unknown","Poopybutthole","Mythological Creature","Animal","Robot","Cronenberg","Disease"]
    return species.map(e => ({ value: e.toLowerCase(), label: e }));
}

export function unique(arr: any[]) {
    return arr.filter((e, i, a) => a.indexOf(e) === i);
}

export function getReactElementText(node: ReactElement | string): string {
    if (typeof node === 'string') return String(node);
    if (node instanceof Array) return node.map(getReactElementText).join('');
    if (typeof node === 'object' && node) return getReactElementText(node.props.children);
    return '';
}

export function checkOverflow(el: HTMLElement | null) {
    return !!el && el.clientWidth < el.scrollWidth;
}

export function apiDataToCharacters(data: ApiCharacterSchema[]) {
    return data.map(record => {
        return {
            id: record.id,
            name: record.name,
            avatar: record.image,
            origin: record.origin.name,
            gender: record.gender,
            status: record.status,
            species: record.species
        };
    });
}
