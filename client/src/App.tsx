import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AlertModal from './components/AlertModal';
import Home from './components/Pages/Home';
import Login from './components/Pages/Login';
import NotFound from './components/Pages/NotFound';
import SettingsPage from './components/Pages/SettingsPage';

import './styles/Inputs.css';

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
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="login" element={<Login />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </ContextProviders>
        </BrowserRouter>
    );
};

export default App;
