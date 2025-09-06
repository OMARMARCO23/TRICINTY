import React from 'https://aistudiocdn.com/react@^19.1.1';
import { HashRouter, Route, Routes } from 'https://aistudiocdn.com/react-router-dom@^6.23.1';
import { AppProvider } from './contexts/AppContext.tsx';
import Layout from './components/Layout.tsx';
import Dashboard from './pages/Dashboard.tsx';
import History from './pages/History.tsx';
import Settings from './pages/Settings.tsx';
import Advice from './pages/Advice.tsx';

function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/advice" element={<Advice />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AppProvider>
  );
}

export default App;