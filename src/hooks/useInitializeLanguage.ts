// src/hooks/useInitializeLanguage.ts
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { setLanguage } from '@/store/slices/languageSlice';

export const useInitializeLanguage = () => {
  const { i18n } = useTranslation();
  const dispatch = useDispatch();

  useEffect(() => {
    const storedLang = localStorage.getItem('language') === 'en' ? 'en' : 'fr';
    i18n.changeLanguage(storedLang).then(() => {
      dispatch(setLanguage(storedLang));
    });
  }, []);
};
