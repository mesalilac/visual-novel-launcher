import './App.css';
import './utils.css';
import { FilterBar, MainContent, Nav } from './components';
import { GlobalDataProvider } from './store';

function App() {
    return (
        <GlobalDataProvider>
            <div class='main-container'>
                <Nav />
                <FilterBar />
                <MainContent />
            </div>
        </GlobalDataProvider>
    );
}

export default App;
