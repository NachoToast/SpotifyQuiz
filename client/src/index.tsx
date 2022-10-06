import React from 'react';
import ReactDOM from 'react-dom/client';
import { store } from './redux/store';
import { Provider } from 'react-redux';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import Home from './components/Pages/Home';
import Singleplayer from './components/Pages/Singleplayer';
import Multiplayer from './components/Pages/Multiplayer';
import NotFound from './components/Pages/NotFound';
import './index.css';
import Settings from './components/Pages/Settings';
import Login from './components/Pages/Login';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <Provider store={store}>
        <BrowserRouter>
            <Link to="/settings" id="settingsButton" title="Settings" />
            <Routes>
                <Route index element={<Home />} />
                <Route path="singleplayer" element={<Singleplayer />} />
                <Route path="multiplayer" element={<Multiplayer />} />
                <Route path="settings" element={<Settings />} />
                <Route path="login" element={<Login />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    </Provider>,
);
