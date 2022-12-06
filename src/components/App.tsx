import { useEffect, useState } from 'react';
import CharactersTable from './CharactersTable';
import SearchInput from './SearchInput';
import MultiSelect from './MultiSelect';
import { ApiFilters, Character } from '@/types';
import { getTempApiData, unique } from '@/utils';
import '@/styles/components/App.scss'
import Pagination from './Pagination';
import useCharactersApi from '@/hooks/useCharactersApi';





/**
 * - czy checkbox do zaznaczania wszystkich ma zaznaczac tylko wyswietlone, czy wszystkie rekordy?
 * - czy apka ma byc napisana z RWD?
 * - czy Status rzeczywiscie ma miec 14px skoro reszta ma 15px
 * 
 * useFilter
 * useFetch
 * usePagination
 * 
 * 1. pagination - done
 * 2. multiple select - done
 * 3. useTooltip - done
 * 4. global style - done
 * 5. refactor styles - done
 * 6. code review
 * 7. refactor pagination
 * 8. 1 2 3 ... -2 -1 0 pages issue
 * 
 */

const apiData = getTempApiData();


function App() {
  const [filterTimeouts, setFilterTimeouts] = useState({});
  const [apiFilters, setApiFilters] = useState<ApiFilters>({ name: '', species: [] });
  const { data, isLoading, error } = useCharactersApi(apiFilters);
  const { characters, totalPages } = data;
  const [filteredCharacters, setFilteredCharacters] = useState<Character[]>(characters);

  // const speciesOptions = unique(apiData.map(e => e.species)).map(e => ({ value: e.toLowerCase(), label: e }));
  
  // const [displayedData, setDisplayedData] = useState(filteredTableData.slice(0, perPage));
  
  console.log('data (isLoading:' + isLoading + ')', data);

  // function handlePageChange(firstIndex: number, lastIndex: number) {
  //   setDisplayedData(filteredTableData.slice(firstIndex, lastIndex));
  // }

  return (
    <div className="App">
      <h1>Characters {String(isLoading)} {totalPages}</h1>

      <div className="filters">
        <SearchInput 
          id="search" 
          name="search" 
          onChange={query => setApiFilters(f => ({...f, name: query}))}
        />
        <MultiSelect
          placeholder="Species"
          options={[{ value: 'human', label: 'Human'}, { value: 'alien', label: 'Alien'}]}
          onChange={values => setApiFilters(f => ({...f, species: values}))}
        />
      </div>
      
      <div className="content">
        <CharactersTable data={data.characters} />
        {/* <Pagination 
          totalPages={totalPages}
          itemsCount={filteredTableData.length} 
          perPage={perPage} 
          onChange={handlePageChange}
        /> */}
      </div>
    </div>
  )
}

export default App
