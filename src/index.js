import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import App from './App';
import registerServiceWorker from './server/registerServiceWorker';
import {BrowserRouter} from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';

ReactDOM.render(
    <BrowserRouter>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </BrowserRouter>, 
document.getElementById('root'));
registerServiceWorker();