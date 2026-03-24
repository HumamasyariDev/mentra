import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import '../styles/pages/Legal.css';

export default function PrivacyPolicy() {
  const { t } = useTranslation(['legal', 'common']);

  return (
    <div className="legal-page">
      <div className="legal-container">
        <Link to="/register" className="legal-back">
          <ArrowLeft size={16} />
          {t('legal:privacy.backToRegister')}
        </Link>

        <div className="legal-header">
          <div className="legal-logo">M</div>
          <h1 className="legal-title">{t('legal:privacy.title')}</h1>
          <p className="legal-updated">{t('legal:privacy.lastUpdated', { date: '23 Maret 2026' })}</p>
        </div>

        <div className="legal-content">
          {/* 1. Introduction */}
          <section className="legal-section">
            <h2>{t('legal:privacy.sections.introduction.title')}</h2>
            <p>{t('legal:privacy.sections.introduction.content')}</p>
          </section>

          {/* 2. Data Collection */}
          <section className="legal-section">
            <h2>{t('legal:privacy.sections.dataCollection.title')}</h2>
            <h3>{t('legal:privacy.sections.dataCollection.provided.title')}</h3>
            <ul>
              <li dangerouslySetInnerHTML={{ __html: t('legal:privacy.sections.dataCollection.provided.accountData') }} />
              <li dangerouslySetInnerHTML={{ __html: t('legal:privacy.sections.dataCollection.provided.profileData') }} />
              <li dangerouslySetInnerHTML={{ __html: t('legal:privacy.sections.dataCollection.provided.userContent') }} />
            </ul>

            <h3>{t('legal:privacy.sections.dataCollection.automatic.title')}</h3>
            <ul>
              <li dangerouslySetInnerHTML={{ __html: t('legal:privacy.sections.dataCollection.automatic.usageData') }} />
              <li dangerouslySetInnerHTML={{ __html: t('legal:privacy.sections.dataCollection.automatic.technicalData') }} />
            </ul>

            <h3>{t('legal:privacy.sections.dataCollection.thirdParty.title')}</h3>
            <p>{t('legal:privacy.sections.dataCollection.thirdParty.content')}</p>
          </section>

          {/* 3. Data Usage */}
          <section className="legal-section">
            <h2>{t('legal:privacy.sections.dataUsage.title')}</h2>
            <p>{t('legal:privacy.sections.dataUsage.intro')}</p>
            <ul>
              <li>{t('legal:privacy.sections.dataUsage.items.provideService')}</li>
              <li>{t('legal:privacy.sections.dataUsage.items.manageAccount')}</li>
              <li>{t('legal:privacy.sections.dataUsage.items.storeData')}</li>
              <li>{t('legal:privacy.sections.dataUsage.items.aiFeatures')}</li>
              <li>{t('legal:privacy.sections.dataUsage.items.emailVerification')}</li>
              <li>{t('legal:privacy.sections.dataUsage.items.gamification')}</li>
              <li>{t('legal:privacy.sections.dataUsage.items.improveService')}</li>
            </ul>
          </section>

          {/* 4. Data Storage */}
          <section className="legal-section">
            <h2>{t('legal:privacy.sections.dataStorage.title')}</h2>
            <p>{t('legal:privacy.sections.dataStorage.content')}</p>
          </section>

          {/* 5. Data Sharing */}
          <section className="legal-section">
            <h2>{t('legal:privacy.sections.dataSharing.title')}</h2>
            <p dangerouslySetInnerHTML={{ __html: t('legal:privacy.sections.dataSharing.intro') }} />
            <ul>
              <li dangerouslySetInnerHTML={{ __html: t('legal:privacy.sections.dataSharing.items.publicForum') }} />
              <li dangerouslySetInnerHTML={{ __html: t('legal:privacy.sections.dataSharing.items.serviceProviders') }} />
              <li dangerouslySetInnerHTML={{ __html: t('legal:privacy.sections.dataSharing.items.legalObligations') }} />
            </ul>
          </section>

          {/* 6. Third-Party Services */}
          <section className="legal-section">
            <h2>{t('legal:privacy.sections.thirdPartyServices.title')}</h2>
            <p>{t('legal:privacy.sections.thirdPartyServices.intro')}</p>
            <ul>
              <li dangerouslySetInnerHTML={{ __html: t('legal:privacy.sections.thirdPartyServices.items.googleOauth') }} />
              <li dangerouslySetInnerHTML={{ __html: t('legal:privacy.sections.thirdPartyServices.items.facebookOauth') }} />
              <li dangerouslySetInnerHTML={{ __html: t('legal:privacy.sections.thirdPartyServices.items.openaiApi') }} />
              <li dangerouslySetInnerHTML={{ __html: t('legal:privacy.sections.thirdPartyServices.items.gmailSmtp') }} />
            </ul>
            <p>{t('legal:privacy.sections.thirdPartyServices.note')}</p>
          </section>

          {/* 7. Security */}
          <section className="legal-section">
            <h2>{t('legal:privacy.sections.security.title')}</h2>
            <p>{t('legal:privacy.sections.security.intro')}</p>
            <ul>
              <li>{t('legal:privacy.sections.security.items.bcrypt')}</li>
              <li>{t('legal:privacy.sections.security.items.sanctum')}</li>
              <li>{t('legal:privacy.sections.security.items.rateLimiting')}</li>
              <li>{t('legal:privacy.sections.security.items.validation')}</li>
            </ul>
            <p>{t('legal:privacy.sections.security.disclaimer')}</p>
          </section>

          {/* 8. Your Rights */}
          <section className="legal-section">
            <h2>{t('legal:privacy.sections.yourRights.title')}</h2>
            <p>{t('legal:privacy.sections.yourRights.intro')}</p>
            <ul>
              <li dangerouslySetInnerHTML={{ __html: t('legal:privacy.sections.yourRights.items.access') }} />
              <li dangerouslySetInnerHTML={{ __html: t('legal:privacy.sections.yourRights.items.correct') }} />
              <li dangerouslySetInnerHTML={{ __html: t('legal:privacy.sections.yourRights.items.delete') }} />
              <li dangerouslySetInnerHTML={{ __html: t('legal:privacy.sections.yourRights.items.export') }} />
            </ul>
            <p dangerouslySetInnerHTML={{ __html: t('legal:privacy.sections.yourRights.contact') }} />
          </section>

          {/* 9. Cookies */}
          <section className="legal-section">
            <h2>{t('legal:privacy.sections.cookies.title')}</h2>
            <p>{t('legal:privacy.sections.cookies.content')}</p>
          </section>

          {/* 10. Minors */}
          <section className="legal-section">
            <h2>{t('legal:privacy.sections.minors.title')}</h2>
            <p>{t('legal:privacy.sections.minors.content')}</p>
          </section>

          {/* 11. Policy Changes */}
          <section className="legal-section">
            <h2>{t('legal:privacy.sections.policyChanges.title')}</h2>
            <p>{t('legal:privacy.sections.policyChanges.content')}</p>
          </section>

          {/* 12. Contact */}
          <section className="legal-section">
            <h2>{t('legal:privacy.sections.contact.title')}</h2>
            <p dangerouslySetInnerHTML={{ __html: t('legal:privacy.sections.contact.content') }} />
          </section>
        </div>
      </div>
    </div>
  );
}
