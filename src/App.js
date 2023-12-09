import logo from './logo.svg';
import './App.css';
import GameView from './components/GameView.jsx';

function App() {
  return (
    <div className="App">
      <header className="App-header">
  
        <p>
          Edit <code>src/App.js</code> and save to reload. Neki tekst.
        </p>
        
       
        <GameView />
        
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
