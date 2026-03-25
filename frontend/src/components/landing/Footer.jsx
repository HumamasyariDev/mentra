import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation(['landing']);

  return (
    <footer className="landing-footer-minimal">
      <p>&copy; {new Date().getFullYear()} Mentra</p>
      <div className="footer-minimal-links">
        <Link to="/terms-of-service">{t('landing:footer.terms')}</Link>
        <Link to="/privacy-policy">{t('landing:footer.privacy')}</Link>
        <a href="https://github.com/HumamasyariDev/mentra" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
          GitHub
        </a>
      </div>
    </footer>
  );
}
