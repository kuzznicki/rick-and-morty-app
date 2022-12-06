const status = ['Alive', 'Dead', 'unknown'] as const; 
export type Status = typeof status[number];
export function isStatus(val: string): val is Status {
    return status.includes(val as Status);
}

const gender = ['Female', 'Male', 'Genderless', 'unknown'] as const;
export type Gender = typeof gender[number];
export function isGender(val: string): val is Gender {
    return gender.includes(val as Gender);
}

export type Character = {
    id: number
    name: string
    species: string
    avatar: string
    origin: string
    gender: Gender
    status: Status
};

export type ApiCharacterSchema = {
    id: number
    name: string
    image: string
    origin: { name: string }
    gender: Gender
    status: Status
    species: string
};

export function assertApiCharacterSchema(val: ApiCharacterSchema): asserts val {
    if (
        typeof val !== 'object' ||
        typeof val.id !== 'number' ||
        typeof val.name !== 'string' ||
        typeof val.image !== 'string' ||
        typeof val.origin !== 'object' ||
        typeof val.origin.name !== 'string' ||
        !isGender(val.gender) ||
        !isStatus(val.status) ||
        typeof val.species !== 'string'
    ) throw new Error('API Schema not matched');
}

export type ApiResponse = {
    info: { count: number },
    results: ApiCharacterSchema[]
};

export function isApiResponse(val: ApiResponse): val is ApiResponse {
    try {
        if (!Array.isArray(val.results)) return false;
        val.results.forEach(assertApiCharacterSchema);
        return (
            typeof val === 'object' &&
            typeof val.info === 'object' &&
            typeof val.info.count === 'number'
        );
    } catch (e) {
        return false;
    }
    
}

export type ApiFilters = { name?: string, species?: string[], page?: number };