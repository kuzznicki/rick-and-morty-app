import { useState } from 'react';
import CharactersTable from './CharactersTable';
import SearchInput from './SearchInput';
import MultiSelect from './MultiSelect';
import { ApiSchema, Character, Status } from '@/types';
import { apiDataToCharacters, getTempApiData, unique } from '@/utils';
import '@/styles/components/App.scss'
import Pagination from './Pagination';

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
 * 
 */

const apiData = getTempApiData();

function App() {
  const perPage = 1;
  const [data, setData] = useState<ApiSchema[]>(apiData);
  const tableData: Character[] = apiDataToCharacters(data);
  const speciesOptions = unique(apiData.map(e => e.species)).map(e => ({ value: e.toLowerCase(), label: e }));

  const [filteredTableData, setFilteredTableData] = useState<Character[]>(tableData);
  const [displayedData, setDisplayedData] = useState(filteredTableData.slice(0, perPage));

  function filterCharacters(key: keyof Character, query: string | string[], exactMatch: boolean = false) {
    if (!query.length) {
      setFilteredTableData([...tableData]);
    } else {
      const matched = tableData.filter(e => {
        const value = (e[key] as string).toLowerCase();
        const queriesLowerCase = typeof query === 'string'
          ? [query.toLowerCase()]
          : query.map(q => q.toLowerCase());

        return exactMatch 
          ? queriesLowerCase.some(q => q === value) 
          : queriesLowerCase.some(q => value.includes(q));
      });
      
      setFilteredTableData(matched);
    }
  }

  function handlePageChange(firstIndex: number, lastIndex: number) {
    setDisplayedData(filteredTableData.slice(firstIndex, lastIndex));
  }

  return (
    <div className="App">
      <h1>Characters</h1>

      <div className="filters">
        <SearchInput id="search" name="search" onChange={query => filterCharacters('name', query)} />
        <MultiSelect
          placeholder="Species"
          options={speciesOptions}
          onChange={values => filterCharacters('species', values, true)}
        />
      </div>
      
      <div className="content">
        <CharactersTable data={displayedData} />
        <Pagination 
          itemsCount={filteredTableData.length} 
          perPage={perPage} 
          onChange={handlePageChange}
        />
      </div>
    </div>
  )
}

export default App
