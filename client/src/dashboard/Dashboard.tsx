import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Overview from './pages/Overview';
import TimeTracking from './pages/TimeTracking';
import Sessions from './pages/Sessions';
import Settings from './pages/Settings';
import Achievements from './pages/Achievements';

export default function Dashboard() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="time-tracking" element={<TimeTracking />} />
          <Route path="sessions" element={<Sessions />} />
          <Route path="achievements" element={<Achievements />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
