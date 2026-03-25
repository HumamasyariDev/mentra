import { usePageTitle } from "../hooks/usePageTitle";
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import '../styles/pages/Legal.css';

export default function TermsOfService() {
  usePageTitle('legal:terms.title');


  const { t } = useTranslation(['legal', 'common']);

  return (
    <div className="legal-page">
      <div className="legal-container">
        <Link to="/register" className="legal-back">
          <ArrowLeft size={16} />
          {t('legal:terms.backToRegister')}
        </Link>

        <div className="legal-header">
          <div className="legal-logo">M</div>
          <h1 className="legal-title">{t('legal:terms.title')}</h1>
          <p className="legal-updated">{t('legal:terms.lastUpdated', { date: '23 Maret 2026' })}</p>
        </div>

        <div className="legal-content">
          {/* 1. Acceptance of Terms */}
          <section className="legal-section">
            <h2>{t('legal:terms.sections.acceptance.title')}</h2>
            <p>{t('legal:terms.sections.acceptance.content')}</p>
          </section>

          {/* 2. Service Description */}
          <section className="legal-section">
            <h2>{t('legal:terms.sections.serviceDescription.title')}</h2>
            <p>{t('legal:terms.sections.serviceDescription.content')}</p>
          </section>

          {/* 3. User Account */}
          <section className="legal-section">
            <h2>{t('legal:terms.sections.userAccount.title')}</h2>
            <p>{t('legal:terms.sections.userAccount.intro')}</p>
            <ul>
              <li>{t('legal:terms.sections.userAccount.items.password')}</li>
              <li>{t('legal:terms.sections.userAccount.items.activity')}</li>
              <li>{t('legal:terms.sections.userAccount.items.notify')}</li>
              <li>{t('legal:terms.sections.userAccount.items.accurate')}</li>
            </ul>
          </section>

          {/* 4. Acceptable Use */}
          <section className="legal-section">
            <h2>{t('legal:terms.sections.acceptableUse.title')}</h2>
            <p>{t('legal:terms.sections.acceptableUse.intro')}</p>
            <ul>
              <li>{t('legal:terms.sections.acceptableUse.items.illegal')}</li>
              <li>{t('legal:terms.sections.acceptableUse.items.disrupt')}</li>
              <li>{t('legal:terms.sections.acceptableUse.items.harmful')}</li>
              <li>{t('legal:terms.sections.acceptableUse.items.unauthorized')}</li>
              <li>{t('legal:terms.sections.acceptableUse.items.bots')}</li>
            </ul>
          </section>

          {/* 5. User Content */}
          <section className="legal-section">
            <h2>{t('legal:terms.sections.userContent.title')}</h2>
            <p>{t('legal:terms.sections.userContent.content')}</p>
          </section>

          {/* 6. AI Features */}
          <section className="legal-section">
            <h2>{t('legal:terms.sections.aiFeatures.title')}</h2>
            <p>{t('legal:terms.sections.aiFeatures.content')}</p>
          </section>

          {/* 7. Service Availability */}
          <section className="legal-section">
            <h2>{t('legal:terms.sections.availability.title')}</h2>
            <p>{t('legal:terms.sections.availability.content')}</p>
          </section>

          {/* 8. Termination */}
          <section className="legal-section">
            <h2>{t('legal:terms.sections.termination.title')}</h2>
            <p>{t('legal:terms.sections.termination.content')}</p>
          </section>

          {/* 9. Limitation of Liability */}
          <section className="legal-section">
            <h2>{t('legal:terms.sections.liability.title')}</h2>
            <p>{t('legal:terms.sections.liability.content')}</p>
          </section>

          {/* 10. Changes to Terms */}
          <section className="legal-section">
            <h2>{t('legal:terms.sections.changes.title')}</h2>
            <p>{t('legal:terms.sections.changes.content')}</p>
          </section>

          {/* 11. Contact */}
          <section className="legal-section">
            <h2>{t('legal:terms.sections.contact.title')}</h2>
            <p dangerouslySetInnerHTML={{ __html: t('legal:terms.sections.contact.content') }} />
          </section>
        </div>
      </div>
    </div>
  );
}
