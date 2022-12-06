import { useState } from 'react';
import CharactersTable from './CharactersTable';
import SearchInput from './SearchInput';
import MultiSelect from './MultiSelect';
import { ApiFilters } from '@/types';
import '@/styles/components/App.scss'
import Pagination from './Pagination';
import useCharactersApi from '@/hooks/useCharactersApi';
import Loading from './Loading';
import ErrorMessage from './ErrorMessage';
import { getSpeciesOptions } from '@/utils';

const PER_PAGE = 5;
const speciesOptions = getSpeciesOptions();

function App() {
  const [apiFilters, setApiFilters] = useState<ApiFilters>({ name: '', species: [] });
  const { data, isLoading, error } = useCharactersApi(apiFilters, { perPage: PER_PAGE });
  const { characters, totalPages } = data;

  function handlePageChange(pageNumber: number) {
    console.log('change page', pageNumber);
    setApiFilters(f => ({...f, page: pageNumber }));
  }

  return (
    <div className="App">
      <h1>Characters {JSON.stringify(apiFilters)} - pages: {totalPages} - error: {String(error)}</h1>

      <div className="filters">
        <SearchInput 
          id="search" 
          name="search" 
          onChange={query => setApiFilters(f => ({...f, name: query}))}
        />
        <MultiSelect
          placeholder="Species"
          options={speciesOptions}
          onChange={values => setApiFilters(f => ({...f, species: values}))}
        />
      </div>
      
      <div className="content">
        { error 
          ? <ErrorMessage debugInfo={String(error)} /> : isLoading 
          ? <Loading message="Loading characters..." />
          : <CharactersTable data={characters} />
        }
        <Pagination
          visible={!isLoading && !error}
          totalPages={totalPages || 1}
          onChange={handlePageChange}
        />
      </div>
    </div>
  )
}

export default App
