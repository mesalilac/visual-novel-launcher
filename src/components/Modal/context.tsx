import {
    type Accessor,
    createContext,
    type Setter,
    useContext,
} from 'solid-js';

export type ModalContextData = {
    isOpen: Accessor<boolean>;
    setIsOpen: Setter<boolean>;
};

export const ModalContext = createContext<ModalContextData>();

export const useModalContext = () => {
    const context = useContext(ModalContext);

    if (!context) {
        throw new Error('useModalData must be used within a ModalContext');
    }

    return context;
};
