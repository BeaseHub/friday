
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LanguageState {
  currentLanguage: 'en' | 'fr';
}

const loadLanguageFromStorage = (): LanguageState => {
  try {
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage && (storedLanguage === 'en' || storedLanguage === 'fr')) {
      return { currentLanguage: storedLanguage };
    }
  } catch (error) {
    console.error('Error loading language from localStorage:', error);
  }
  return { currentLanguage: 'en' };
};

const languageSlice = createSlice({
  name: 'language',
  initialState: loadLanguageFromStorage(),
  reducers: {
    setLanguage: (state, action: PayloadAction<'en' | 'fr'>) => {
      state.currentLanguage = action.payload;
      localStorage.setItem('language', action.payload);
    },
  },
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;
