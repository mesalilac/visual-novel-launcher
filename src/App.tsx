import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { FilterBox, MainContent, Nav } from '@/components';
import { GlobalDataProvider } from '@/store';

import './App.css';
import './utils.css';

gsap.registerPlugin(Flip);

function App() {
    return (
        <GlobalDataProvider>
            <div class='main-container'>
                <Nav />
                <FilterBox />
                <MainContent />
            </div>
        </GlobalDataProvider>
    );
}

export default App;
