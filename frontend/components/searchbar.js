import { Search, HelpCircle } from 'react-feather';
import { useRouter } from 'next/router'
import { useState } from 'react'

const SearchBar = (props) => {
  const [text, setText] = useState('');

  const router = useRouter();

  const gotoQuery = (e) => {
    e.preventDefault();
    router.push(`/query/${btoa(text)}`);
  }

  return (
    <div className="w-full">
      <div className="border-2 border-gray-400 bg-white rounded-lg flex w-full">
        <input 
          className="w-full focus:outline-none rounded-lg p-2"
          type="text"
          style={{ color: '#000'}}
          placeholder="Слова сюда писать..."
          onKeyDown={(e) => {
            if(e.key == 'Enter'){
              gotoQuery(e);
            }
          }}
          onChange={(e) => {
            setText(e.target.value);
          }}
        />
          
        <button onClick={(e) => { gotoQuery(e) }} className="bg-white focus:outline-none w-auto rounded-lg flex justify-end items-center text-gray-300 p-2 hover:text-blue-400">
          <Search />
        </button>
      </div>
      <div className="flex justify-center py-2 text-gray-500 hover:text-blue-400">  
        <a href="#" >
        Справка из дурдома
        <HelpCircle style={{display: 'inline', 'marginLeft': '0.5rem'}}/>
        </a>
      </div>
    </div>
  )
}

export default SearchBar;