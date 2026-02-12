import { useGlobalData } from '@store';

import './Nav.css';
import { IconAddPlus, IconSettings } from '../icons';

export const Nav = () => {
    const globalData = useGlobalData();
    const vns = globalData.resources.vns;

    return (
        <nav class='flex-row justify-between'>
            <h2>Visual Novel library ({vns.get()?.length})</h2>
            <div class='flex-row gap-lg'>
                <button class='button-primary' type='button'>
                    <IconAddPlus />
                    Add a Game
                </button>
                <IconSettings class='cursor-pointer settings-icon' />
            </div>
        </nav>
    );
};
