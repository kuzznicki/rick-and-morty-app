import { useState } from 'react';
import CharactersTable from './CharactersTable';
import SearchInput from './SearchInput';
import MultiSelect from './MultiSelect';
import { ApiSchema, Character, Status } from '@/types';
import { getTempApiData, unique } from '@/utils';
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
 * 3. useTooltip
 * 4. global style - done
 * 5. refactor styles - done
 * 6. code review
 * 
 */

const apiData = getTempApiData();

function App() {
  const perPage = 10;
  const [data, setData] = useState<ApiSchema[]>(apiData);
  const tableData: Character[] = data.map((e, i) => {
    return { 
      id: e.id,
      name: e.name,
      avatar: e.image,
      origin: e.origin.name,
      gender: e.gender,
      status: e.status,
      species: e.species
    };
  });
  const [displayedData, setDisplayedData] = useState(tableData.slice(0, perPage));
  const speciesOptions = unique(apiData.map(e => e.species)).map(e => ({ value: e.toLowerCase(), label: e }));

  function filterCharacters(key: keyof Character, query: string | string[], exactMatch: boolean = false) {
    if (!query.length) {
      setDisplayedData([...tableData]);  
    } else {
      const matched = tableData.filter(e => {
        const value = (e[key] as string).toLowerCase();
        const queriesLower = typeof query === 'string'
          ? [query.toLowerCase()]
          : query.map(q => q.toLowerCase());

        return exactMatch 
          ? queriesLower.some(q => q === value) 
          : queriesLower.some(q => value.includes(q));
      });
      
      setDisplayedData(matched);
    }
  }

  function handlePageChange(firstIndex: number, lastIndex: number) {
    console.log(firstIndex, lastIndex);
    setDisplayedData(tableData.slice(firstIndex, lastIndex));
  }

  return (
    <div className="App">
        <h1>Characters</h1>

        <div className="filters">
          <SearchInput id="search" name="search" onChange={query => filterCharacters('name', query)} />
          <MultiSelect
            placeholder="Species"
            options={speciesOptions}
            onChange={values => filterCharacters('species', values)}
          />
        </div>
      
      <div className="content">
        <CharactersTable data={displayedData} />
        <Pagination itemsCount={tableData.length} perPage={perPage} onChange={handlePageChange} />
      </div>
    </div>
  )
}

export default App
