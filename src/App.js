import { useContext } from 'react';
import './App.css';
import Router from './router/Router';
import { AuthContext } from './components/context/AuthContext';

function App() {

  return (
    <Router/>
  );
}

export default App;