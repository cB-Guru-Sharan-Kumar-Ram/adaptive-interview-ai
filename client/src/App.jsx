import { Provider } from 'react-redux';
import { store } from './store/store';
import { ThemeProvider } from './contexts/ThemeContext';
import AppRoutes from './routes/AppRoutes';
import ErrorToast from './components/common/ErrorToast';
import './index.css';

function App() {
    return (
        <Provider store={store}>
            <ThemeProvider>
                <ErrorToast />
                <AppRoutes />
            </ThemeProvider>
        </Provider>
    );
}

export default App;
