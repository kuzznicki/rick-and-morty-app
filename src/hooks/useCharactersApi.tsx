import { ApiCharacterSchema, ApiFilters, ApiResponse, assertApiCharacterSchema, Character } from "@/types";
import { apiDataToCharacters } from "@/utils";
import { useEffect, useReducer, useState } from "react";

const DEFAULT_DATA = { characters: [], totalPages: 0 };
const API_URL = 'https://rickandmortyapi.com/api/character';
const PER_PAGE = 20;

type StateData = { characters: Character[], totalPages?: number };
type FetchState = { isLoading: boolean, data: StateData, error?: Error };
type FetchAction =
    | { type: 'loading' }
    | { type: 'complete', payload: StateData }
    | { type: 'error', payload: Error }

function fetchReducer(state: FetchState, action: FetchAction): FetchState {
    switch (action.type) {
        case 'loading':
            return { isLoading: true, data: { 
                characters: [], 
                totalPages: state.data.totalPages
            }};
        case 'complete':
            return { isLoading: false, data: { 
                characters: action.payload.characters, 
                totalPages: action.payload.totalPages || state.data.totalPages
            }};
        case 'error':
            return { isLoading: false, data: DEFAULT_DATA, error: action.payload };
        default:
            return state;
    }
}

export default function useCharactersApi(filters: ApiFilters) {
    const [apiCache, setApiCache] = useState<Record<string, ApiResponse>>({});
    const [state, dispatch] = useReducer(fetchReducer, { isLoading: true, data: DEFAULT_DATA });

    useEffect(() => {
        console.log('filters', filters);
        getData(filters);
    }, [filters])

    async function getData(filters: ApiFilters) {
        dispatch({ type: 'loading' });

        try {
            // can't pass multiple species so need to generate separate endpoints
            const endpoints = getEndpointsByFilters(filters);
            const pageFilter = filters.page;

            if (endpoints.length === 1) {
                const url = new URL(endpoints[0]);
                if (pageFilter) url.searchParams.append('page', pageFilter+'');
                return handleSingleEndpoint(url.href);
            }

            // for multiple endpoints, we need to calculate requests for specific page based on `info.count` from response 
            handleMultipleEndpoints(endpoints, pageFilter);

        } catch (e) {
            dispatch({ type: 'error', payload: e as Error });
        }
    }

    async function getTotalCountForEndpoint(endpoint: string): Promise<number> {
        const [count] = await getDataForEndpoint(endpoint)
        return count;
    }

    async function getDataForEndpoint(endpoint: string): Promise<[number, Character[]]> {
        if (apiCache[endpoint]) {
            const res = apiCache[endpoint];
            return [res.info.count, apiDataToCharacters(res.results)];
        }

        return await fetchDataFromApi(endpoint);
    }

    async function fetchDataFromApi(endpoint: string): Promise<[number, Character[]]> {
        return fetch(endpoint).then(response => {
            if (!response.ok) throw new Error(response.statusText);
            return response.json();
            
        }).then((data: ApiResponse) => {
            // todo: validate api response

            const results = data.results as ApiCharacterSchema[];
            results.forEach(assertApiCharacterSchema);
            const characters = apiDataToCharacters(results);

            setApiCache(cache => ({ ...cache, [endpoint]: data }));
            return [data.info.count, characters];
        });
    }

    function getEndpointsByFilters(filters: ApiFilters): string[] {
        const url = new URL(API_URL);
        if (filters.name) url.searchParams.append('name', filters.name);
        if (!filters.species?.length) return [url.href];

        return filters.species.sort().map((s, i) => {
            const endpoint = new URL(url);
            endpoint.searchParams.append('species', s);
            return endpoint.href;
        });
    }

    async function handleSingleEndpoint(endpoint: string): Promise<void> {
        const [totalCount, characters] = await getDataForEndpoint(endpoint);

        dispatch({ type: 'complete', payload: { 
            characters: characters,
            totalPages: Math.ceil(totalCount / PER_PAGE)
        }});
    }

    async function handleMultipleEndpoints(endpoints: string[], pageFilter?: number): Promise<void> {
        const data: Character[] = []
        let recordsToSkipLeft = ((pageFilter || 1) - 1) * PER_PAGE;
        let totalCount = 0;

        for (const endpoint of endpoints) {
            const endpointTotalCount = await getTotalCountForEndpoint(endpoint);
            totalCount += endpointTotalCount;
            
            if (data.length > PER_PAGE) continue;

            if (endpointTotalCount > recordsToSkipLeft) {
                const pageToRequest = Math.ceil(recordsToSkipLeft / PER_PAGE);
                recordsToSkipLeft = 0;

                const url = new URL(endpoint);
                if (pageToRequest) url.searchParams.append('page', pageToRequest+'');

                const [, pageCharacters] = await getDataForEndpoint(url.href);
                data.push(...pageCharacters);
            } else {
                recordsToSkipLeft -= endpointTotalCount;
            }
        }

        dispatch({ type: 'complete', payload: { 
            characters: data.slice(0, PER_PAGE),
            totalPages: Math.ceil(totalCount / PER_PAGE)
        }});
    }

    return state;
}