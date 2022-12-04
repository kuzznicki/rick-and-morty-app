import { useState } from 'react'
import './App.css'
import SearchInput from './SearchInput';
import Select from './Select';
import { getTempApiData, unique } from './utils';
import CharactersTable from './CharactersTable';
import { ApiSchema, Character, Status } from './types';


const apiData = getTempApiData();

function App() {
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
