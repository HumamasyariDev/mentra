import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function usePageTitle(titleKey) {
  const { t } = useTranslation();

  useEffect(() => {
    if (titleKey) {
      document.title = `Mentra - ${t(titleKey)}`;
    } else {
      document.title = 'Mentra';
    }
  }, [t, titleKey]);
}
