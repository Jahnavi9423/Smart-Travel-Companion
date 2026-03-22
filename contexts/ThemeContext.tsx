import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/colors';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    colors: typeof Colors;
    toggleTheme: () => void;
    isDarkMode: boolean;
}

const darkColors = {
    ...Colors,
    background: '#121212',
    card: '#1E1E1E',
    text: '#F7F5F2',
    textSecondary: '#9CA3AF',
    textLight: '#6B7280',
    border: '#333333',
    borderLight: '#222222',
    white: '#1E1E1E', // For card backgrounds that were white
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light');

    useEffect(() => {
        const loadTheme = async () => {
            const savedTheme = await AsyncStorage.getItem('user_dark_mode');
            if (savedTheme === 'true') {
                setTheme('dark');
            }
        };
        loadTheme();
    }, []);

    const toggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        await AsyncStorage.setItem('user_dark_mode', newTheme === 'dark' ? 'true' : 'false');
    };

    const currentColors = theme === 'light' ? Colors : darkColors;

    return (
        <ThemeContext.Provider value={{
            theme,
            colors: currentColors,
            toggleTheme,
            isDarkMode: theme === 'dark'
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
