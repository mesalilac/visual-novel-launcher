import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { Toaster } from 'solid-toast';
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
            <Toaster
                toastOptions={{
                    position: 'bottom-left',
                    style: {
                        'background-color':
                            'var(--s-color-background-surface-1)',
                        color: 'var(--s-color-foreground-default)',
                    },
                }}
            />
        </GlobalDataProvider>
    );
}

export default App;
