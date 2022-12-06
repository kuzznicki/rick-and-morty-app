import { ApiCharacterSchema, ApiFilters, ApiResponse, assertApiCharacterSchema, Character, isApiResponse } from "@/types";
import { apiDataToCharacters } from "@/utils";
import { useEffect, useReducer, useState } from "react";

const DEFAULT_DATA = { characters: [], totalPages: 0 };
const API_URL = 'https://api.coingecko.com/api/v3/ping'; //'https://rickandmortyapi.com/api/character/';
const API_PER_PAGE = 20;

const allowedPerPageValues = [1, 2, 4, 5, 10, 20] as const;
type PerPage = typeof allowedPerPageValues[number];
function isPerPage(val: any): val is PerPage {
    return allowedPerPageValues.includes(val);
}

type Options = { perPage?: PerPage };

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

export default function useCharactersApi(filters: ApiFilters, options: Options) {
    const [apiCache, setApiCache] = useState<Record<string, ApiResponse>>({});
    const [state, dispatch] = useReducer(fetchReducer, { isLoading: true, data: DEFAULT_DATA });
    
    const uiPerPage = isPerPage(options.perPage) ? options.perPage : API_PER_PAGE;

    useEffect(() => {
        console.log('filters', filters);
        getData(filters);
    }, [filters])

    return state;
    

    async function getData(filters: ApiFilters) {
        try {
            // can't pass multiple species so need to generate separate endpoints
            const endpoints = getEndpointsByFilters(filters);
            if (endpoints.length === 1) {
                return await handleSingleEndpoint(endpoints[0], filters.page);
            }

            // for multiple endpoints, we need to calculate requests for specific page based on `info.count` from response 
            await handleMultipleEndpoints(endpoints, filters.page);

        } catch (e) {
            dispatch({ type: 'error', payload: e as Error });
        }
    }

    function uiPageToApiPage(uiPage: number): number {
        return Math.ceil(uiPage * uiPerPage / API_PER_PAGE);
    }

    function getCharactersToSkipOnPage(uiPage: number = 1): number {
        return !uiPage ? 0 : ((uiPage - 1) * uiPerPage) % API_PER_PAGE;
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
        dispatch({ type: 'loading' });

        const response = await fetch(endpoint);
        
        if (!response.ok) throw new Error(response.statusText);
        const data = await response.json() as ApiResponse;
            
        if (!isApiResponse(data)) {
            throw new Error('Failed to get data from the API');
        }

        const results = data.results as ApiCharacterSchema[];
        results.forEach(assertApiCharacterSchema);
        const characters = apiDataToCharacters(results);

        setApiCache(cache => ({ ...cache, [endpoint]: data }));
        return [data.info.count, characters];
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

    async function handleSingleEndpoint(endpoint: string, pageFilter?: number): Promise<void> {
        const url = new URL(endpoint);
        
        if (typeof pageFilter === 'number') {
            url.searchParams.append('page', String(uiPageToApiPage(pageFilter)));
        }
        
        const [totalCount, characters] = await getDataForEndpoint(url.href);

        const skip = getCharactersToSkipOnPage(pageFilter);
        dispatch({ type: 'complete', payload: { 
            characters: characters.slice(skip, skip + uiPerPage),
            totalPages: Math.ceil(totalCount / uiPerPage)
        }});
    }

    async function handleMultipleEndpoints(endpoints: string[], pageFilter?: number): Promise<void> {
        const data: Character[] = []
        let recordsToSkipLeft = ((pageFilter || 1) - 1) * uiPerPage;
        let totalCount = 0;

        for (const endpoint of endpoints) {
            const endpointTotalCount = await getTotalCountForEndpoint(endpoint);
            totalCount += endpointTotalCount;
            
            if (data.length > uiPerPage) continue;

            if (endpointTotalCount > recordsToSkipLeft) {
                const pageToRequest = Math.ceil(recordsToSkipLeft / uiPerPage);
                recordsToSkipLeft = 0;

                const url = new URL(endpoint);
                if (pageToRequest) url.searchParams.append('page', String(uiPageToApiPage(pageToRequest)));

                const [, pageCharacters] = await getDataForEndpoint(url.href);
                data.push(...pageCharacters);
            } else {
                recordsToSkipLeft -= endpointTotalCount;
            }
        }

        const skip = getCharactersToSkipOnPage(pageFilter);
        dispatch({ type: 'complete', payload: { 
            characters: data.slice(skip, skip + uiPerPage),
            totalPages: Math.ceil(totalCount / uiPerPage)
        }});
    }
}