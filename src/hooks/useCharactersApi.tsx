import { ApiCharacterSchema, ApiFilters, ApiResponse, assertApiCharacterSchema, Character, isApiResponse } from "@/types";
import { apiDataToCharacters, appendPageParamToUrl } from "@/utils";
import { useEffect, useReducer, useState } from "react";

const DEFAULT_DATA = { characters: [], totalPages: 0 };
const API_URL = 'https://rickandmortyapi.com/api/character/';
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
            return {
                isLoading: true, data: {
                    characters: [],
                    totalPages: state.data.totalPages
                }
            };
        case 'complete':
            return {
                isLoading: false, data: {
                    characters: action.payload.characters,
                    totalPages: action.payload.totalPages || state.data.totalPages
                }
            };
        case 'error':
            return { isLoading: false, data: DEFAULT_DATA, error: action.payload };
        default:
            return state;
    }
}

export default function useCharactersApi(filters: ApiFilters, options: Options) {
    const [apiCache, setApiCache] = useState<Record<string, ApiResponse>>({});
    const [state, dispatch] = useReducer(fetchReducer, { isLoading: true, data: DEFAULT_DATA });

    const perPageInUi = isPerPage(options.perPage) ? options.perPage : API_PER_PAGE;

    useEffect(() => {
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

        const skip = getRecordsToSkip(pageFilter) % API_PER_PAGE;
        dispatch({
            type: 'complete', payload: {
                characters: characters.slice(skip, skip + perPageInUi),
                totalPages: Math.ceil(totalCount / perPageInUi)
            }
        });
    }

    async function handleMultipleEndpoints(endpoints: string[], pageFilter?: number): Promise<void> {
        const recordsToSkip = getRecordsToSkip(pageFilter);

        const data: Character[] = [];
        let totalCount = 0;

        for (const endpoint of endpoints) {
            const [cnt] = await getDataForEndpoint(endpoint);
            totalCount += cnt;
            const apiPages = Math.ceil(cnt / API_PER_PAGE);

            if (data.length > recordsToSkip + API_PER_PAGE) continue;

            for (let page = 1; page <= apiPages; page++) {
                const pageEndpoint = appendPageParamToUrl(endpoint, page);
                const [, characters] = await getDataForEndpoint(pageEndpoint);
                data.push(...characters);

                if (data.length > recordsToSkip + API_PER_PAGE) break;
            }
        }

        dispatch({
            type: 'complete', payload: {
                characters: data.slice(recordsToSkip, recordsToSkip + perPageInUi),
                totalPages: Math.ceil(totalCount / perPageInUi)
            }
        });
    }

    function uiPageToApiPage(uiPage: number): number {
        return Math.ceil(uiPage * perPageInUi / API_PER_PAGE);
    }

    function getRecordsToSkip(uiPage: number = 1): number {
        return !uiPage ? 0 : ((uiPage - 1) * perPageInUi);;
    }
}