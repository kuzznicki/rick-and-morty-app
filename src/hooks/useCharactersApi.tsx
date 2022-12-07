import { ApiCharacterSchema, ApiFilters, ApiResponse, assertApiCharacterSchema, Character, isApiResponse } from "@/types";
import { apiDataToCharacters, appendParamToUrl } from "@/utils";
import { useEffect, useReducer } from "react";

const DEFAULT_DATA = { characters: [], totalPages: 0 };
const API_URL = 'https://rickandmortyapi.com/api/character/';
const API_PER_PAGE = 20;

const allowedPerPageValues = [1, 2, 4, 5, 10, 20] as const;
type PerPage = typeof allowedPerPageValues[number];
function isPerPage(val: any): val is PerPage {
    return allowedPerPageValues.includes(val);
}

type Options = { perPage?: PerPage };
type StateData = { characters: Character[], totalPages: number };
type FetchState = { isLoading: boolean, data: StateData, error?: Error };
type FetchAction =
    | { type: 'loading' }
    | { type: 'complete', payload: StateData }
    | { type: 'error', payload: Error }

function fetchReducer(state: FetchState, action: FetchAction): FetchState {
    if (action.type === 'loading') {
        const { totalPages } = state.data;
        return { 
            isLoading: true, 
            data: { characters: [], totalPages }
        };
    } else if (action.type === 'complete') {
        const { characters, totalPages } = action.payload;
        return { 
            isLoading: false, 
            data: { characters, totalPages }
        };
    } else if (action.type === 'error') {
        return { 
            isLoading: false, 
            data: DEFAULT_DATA, error: action.payload
        };
    }

    return state;
}

export default function useCharactersApi(filters: ApiFilters, options: Options) {
    const [state, dispatch] = useReducer(fetchReducer, { isLoading: true, data: DEFAULT_DATA });
    const perPageInUi = isPerPage(options.perPage) ? options.perPage : API_PER_PAGE;

    useEffect(() => void getData(filters), [filters]);

    return state;

    async function getData(filters: ApiFilters) {
        try {
            // can't pass multiple species so need to generate separate endpoints
            const endpoints = getEndpointsByFilters(filters);
            if (endpoints.length === 1) {
                await handleSingleEndpoint(endpoints[0], filters.page);
            } else {
                await handleMultipleEndpoints(endpoints, filters.page);
            }
        } catch (e) {
            dispatch({ type: 'error', payload: e as Error });
        }
    }

    async function fetchDataFromApi(endpoint: string): Promise<[number, Character[]]> {
        dispatch({ type: 'loading' });

        const response = await fetch(endpoint);
        if (!response.ok) {
            if (response.status === 404) { // nothing found for that query
                return [0, []];
            } else {
                throw new Error(response.statusText || String(response.status));
            }
        }

        const data = await response.json() as ApiResponse;
        if (!isApiResponse(data)) throw new Error('Failed to get valid data from the API');

        const results = data.results as ApiCharacterSchema[];
        results.forEach(assertApiCharacterSchema);
        const characters = apiDataToCharacters(results);

        return [data.info.count, characters];
    }

    function getEndpointsByFilters(filters: ApiFilters): string[] {
        const url = new URL(API_URL);
        if (filters.name) url.searchParams.append('name', filters.name);
        if (!filters.species?.length) return [url.href];

        return filters.species.sort().map((s) => appendParamToUrl(url.href, 'species', s));
    }

    async function handleSingleEndpoint(endpoint: string, pageFilter?: number): Promise<void> {
        const skip = getRecordsToSkip(pageFilter) % API_PER_PAGE;
        const url = typeof pageFilter === 'number' 
            ? appendParamToUrl(endpoint, 'page', uiPageToApiPage(pageFilter))
            : endpoint;

        const [totalCount, characters] = await fetchDataFromApi(url);
        
        dispatch({ type: 'complete', payload: {
            characters: characters.slice(skip, skip + perPageInUi),
            totalPages: Math.ceil(totalCount / perPageInUi)
        }});
    }

    async function handleMultipleEndpoints(endpoints: string[], pageFilter?: number): Promise<void> {
        const skip = getRecordsToSkip(pageFilter);
        const data: Character[] = [];
        let totalCount = 0;

        for (const endpoint of endpoints) {
            const [cnt] = await fetchDataFromApi(endpoint);
            totalCount += cnt;

            const apiPages = Math.ceil(cnt / API_PER_PAGE);
            for (let page = 1; page <= apiPages; page++) {
                if (data.length > skip + API_PER_PAGE) break;

                const pageEndpoint = appendParamToUrl(endpoint, 'page', page);
                const [, characters] = await fetchDataFromApi(pageEndpoint);
                data.push(...characters);
            }
        }

        dispatch({ type: 'complete', payload: {
            characters: data.slice(skip, skip + perPageInUi),
            totalPages: Math.ceil(totalCount / perPageInUi)
        }});
    }

    function uiPageToApiPage(uiPage: number): number {
        return Math.ceil(uiPage * perPageInUi / API_PER_PAGE);
    }

    function getRecordsToSkip(uiPage: number = 1): number {
        return !uiPage ? 0 : ((uiPage - 1) * perPageInUi);
    }
}