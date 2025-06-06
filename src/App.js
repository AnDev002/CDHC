import { Route, Router, Routes } from 'react-router-dom';
import './App.css';
import './Pages/Page'
import CPOTradingPlatform from './Pages/Page';

function App() {
  return (
    <>
      <div>
        <Routes>
          <Route path="/" element={<CPOTradingPlatform />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
