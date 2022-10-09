import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AlertModal from './components/AlertModal';
import Home from './components/Pages/Home';
import Login from './components/Pages/Login';
import Multiplayer from './components/Pages/Multiplayer';
import NotFound from './components/Pages/NotFound';
import SettingsPage from './components/Pages/SettingsPage';
import Singleplayer from './components/Pages/Singleplayer';

import OptionsBar from './components/OptionsBar';
import ContextProviders from './Providers';

const App = () => {
    return (
        <BrowserRouter>
            <ContextProviders>
                <AlertModal />
                <OptionsBar />
                <Routes>
                    <Route index element={<Home />} />
                    <Route path="singleplayer" element={<Singleplayer />} />
                    <Route path="multiplayer" element={<Multiplayer />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="login" element={<Login />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </ContextProviders>
        </BrowserRouter>
    );
};

export default App;
