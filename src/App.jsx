import React, { useEffect, useState } from 'react';
import TabBar from './components/TabBar.jsx';
import VsmPage from './pages/VsmPage.jsx';
import SimulationPage from './pages/SimulationPage.jsx';
import ResultsPage from './pages/ResultsPage.jsx';
import ScenarioPage from './pages/ScenarioPage.jsx';
import DataPage from './pages/DataPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import { defaultVsm } from './lib/model.js';
import { loadState, saveState, clearState } from './lib/storage.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('vsm');
  const [theme, setTheme] = useState('light');
  const [vsm, setVsm] = useState(defaultVsm());
  const [results, setResults] = useState(null);
  const [baseline, setBaseline] = useState(null);
  const [scenario, setScenario] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // load persisted state on mount
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      if (saved.vsm) setVsm(saved.vsm);
      if (saved.theme) setTheme(saved.theme);
      if (saved.baseline) setBaseline(saved.baseline);
      if (saved.scenario) setScenario(saved.scenario);
      if (saved.results) setResults(saved.results);
    }
    setLoaded(true);
  }, []);

  // persist on change
  useEffect(() => {
    if (!loaded) return;
    saveState({ vsm, theme, baseline, scenario, results });
  }, [vsm, theme, baseline, scenario, results, loaded]);

  function handleImport(data) {
    if (data.vsm) setVsm(data.vsm);
    if (data.baseline !== undefined) setBaseline(data.baseline);
    if (data.scenario !== undefined) setScenario(data.scenario);
    setResults(null);
    setActiveTab('vsm');
  }

  function resetAll() {
    if (!confirm('Clear all saved data? This cannot be undone.')) return;
    clearState();
    setVsm(defaultVsm());
    setResults(null);
    setBaseline(null);
    setScenario(null);
  }

  return (
    <div data-theme={theme} style={{ minHeight: '100%', background: 'var(--bg-page)' }}>
      <TabBar active={activeTab} onChange={setActiveTab} />
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '16px 14px 48px' }}>
        {activeTab === 'vsm' && <VsmPage vsm={vsm} setVsm={setVsm} results={results} />}
        {activeTab === 'simulation' && (
          <SimulationPage vsm={vsm} setVsm={setVsm} onResults={setResults} />
        )}
        {activeTab === 'results' && <ResultsPage results={results} />}
        {activeTab === 'scenario' && (
          <ScenarioPage
            vsm={vsm}
            setVsm={setVsm}
            results={results}
            baseline={baseline}
            scenario={scenario}
            setBaseline={setBaseline}
            setScenario={setScenario}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === 'data' && (
          <DataPage vsm={vsm} results={results} baseline={baseline} scenario={scenario} onImport={handleImport} />
        )}
        {activeTab === 'settings' && (
          <SettingsPage theme={theme} setTheme={setTheme} onResetAll={resetAll} />
        )}
      </div>
    </div>
  );
}
