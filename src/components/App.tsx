import { useState } from 'react'
import CharactersTable from './CharactersTable';
import SearchInput from './SearchInput';
import Select from './Select';
import { ApiSchema, Character, Status } from '@/types';
import { getTempApiData, unique } from '@/utils';
import '@/styles/App.scss'

/**
 * - czy checkbox do zaznaczania wszystkich ma zaznaczac tylko wyswietlone, czy wszystkie rekordy?
 * - czy apka ma byc napisana z RWD?
 * - czy Status rzeczywiscie ma miec 14px skoro reszta ma 15px
 * 
 * useFilter
 * useFetch
 * usePagination
 * 
 * 1. pagination
 * 2. useTooltip
 * 3. global style
 * 4. refactor styles
 * 5. code review
 * 
 */

const apiData = getTempApiData();

function App() {
  // [data, isLoading, error] = useFetch();
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
  
  const [displayedData, setDisplayedData] = useState(tableData);
  const speciesOptions = unique(apiData.map(e => e.species));

  function filterCharacters(key: keyof Character, query: string, exactMatch: boolean = false) {
    if (!query.length) {
      setDisplayedData([...tableData]);  
    } else {
      const matched = tableData.filter(e => {
        const value = (e[key] as string).toLowerCase();
        const queryLower = query.toLowerCase();
        return exactMatch ? value === queryLower : value.includes(queryLower);
      });
      
      setDisplayedData(matched);
    }
  }

  return (
    <div className="App">
        <h1>Characters</h1>

        <div className="filters">
          <SearchInput id="search" name="search" onChange={query => filterCharacters('name', query)} />
          <Select 
            placeholder="Species"
            options={speciesOptions} 
            onChange={species => filterCharacters('species', species, true)}
          />
        </div>
      
      <div className="content">
        <CharactersTable data={displayedData} />
      </div>
    </div>
  )
}

export default App
