export type Status = 'Alive' | 'Dead' | 'unknown';
export type Gender = 'Female' | 'Male' | 'Genderless' | 'unknown';
export type Character = {
    id: number
    name: string
    species: string
    avatar: string
    origin: string
    gender: Gender
    status: Status
};

export type ApiSchema = {
    id: number
    name: string
    image: string
    origin: { name: string, [k: string]: any }
    gender: Gender
    status: Status
    species: string
    [k: string]: any
};