import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  MessageCircle,
  Shield,
  Heart,
  Video,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface GSLPhrase {
  id: string;
  phrase: string;
  category: string;
  videoUrl?: string;
  description: string;
}

const SignLanguage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedPhrase, setSelectedPhrase] = useState<GSLPhrase | null>(null);

  const quickPhrases: GSLPhrase[] = [
    {
      id: 'help',
      phrase: 'I need help',
      category: 'emergency',
      description: 'Essential phrase for requesting assistance in any situation.'
    },
    {
      id: 'contraception',
      phrase: 'Contraception',
      category: 'health',
      description: 'Birth control and family planning in Ghana Sign Language.'
    },
    {
      id: 'emergency',
      phrase: 'Emergency',
      category: 'emergency',
      description: 'Signal for urgent medical or safety assistance.'
    },
    {
      id: 'doctor',
      phrase: 'I need a doctor',
      category: 'health',
      description: 'Request medical attention at a clinic or hospital.'
    },
    {
      id: 'confidential',
      phrase: 'This is confidential',
      category: 'rights',
      description: 'Assert your right to privacy in healthcare settings.'
    },
    {
      id: 'consent',
      phrase: 'I do not consent',
      category: 'rights',
      description: 'Clearly communicate boundaries and refusal.'
    },
    {
      id: 'period',
      phrase: 'Menstruation / Period',
      category: 'health',
      description: 'Discuss menstrual health and cycle tracking.'
    },
    {
      id: 'testing',
      phrase: 'STI testing',
      category: 'health',
      description: 'Request sexual health screening and testing.'
    }
  ];

  const srhrTerms = [
    { term: 'Contraception', definition: 'Methods to prevent pregnancy' },
    { term: 'Consent', definition: 'Agreement given freely and clearly' },
    { term: 'STI', definition: 'Sexually transmitted infection' },
    { term: 'Reproductive health', definition: 'Health of reproductive systems' },
    { term: 'Emergency contraception', definition: 'Post-sex pregnancy prevention' }
  ];

  const resources = [
    {
      title: 'Ghana National Association of the Deaf (GNAD)',
      description: 'Official GSL resources and interpreter referrals',
      url: 'https://gnadgh.org',
      icon: ExternalLink
    },
    {
      title: 'REPRO PLAN Chat with Rehana',
      description: 'Text-based AI assistant - no voice required',
      action: () => navigate('/chatbot'),
      icon: MessageCircle
    },
    {
      title: 'Emergency Support',
      description: 'Visual alerts and emergency contacts',
      action: () => navigate('/emergency'),
      icon: Shield
    }
  ];

  return (
    <div className="w-full h-full bg-gradient-to-br from-teal-50 via-white to-cyan-50 overflow-x-hidden">
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Introduction */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600" />
            {t('signLanguage.aboutGSL', 'About Ghana Sign Language')}
          </h2>
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
            {t('signLanguage.intro', 'Ghana Sign Language (GSL) is the primary sign language used by the Deaf community in Ghana. REPRO PLAN provides GSL resources to make sexual and reproductive health information accessible. Learn essential phrases for healthcare visits, emergencies, and SRHR discussions.')}
          </p>
        </div>

        {/* Quick Phrases */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Video className="w-5 h-5 text-teal-600" />
            {t('signLanguage.quickPhrases', 'Quick SRHR Phrases in GSL')}
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            {t('signLanguage.phraseHint', 'Tap a phrase to learn more. Video demonstrations coming soon.')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickPhrases.map((phrase) => (
              <button
                key={phrase.id}
                onClick={() => setSelectedPhrase(selectedPhrase?.id === phrase.id ? null : phrase)}
                className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all touch-manipulation min-h-[56px] ${
                  selectedPhrase?.id === phrase.id
                    ? 'bg-teal-50 border-teal-300 ring-2 ring-teal-200'
                    : 'bg-gray-50 border-gray-200 hover:bg-teal-50/50 hover:border-teal-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${
                    phrase.category === 'emergency' ? 'bg-red-100' : 'bg-teal-100'
                  }`}>
                    {phrase.category === 'emergency' ? (
                      <Shield className="w-4 h-4 text-red-600" />
                    ) : (
                      <Heart className="w-4 h-4 text-teal-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="font-medium text-gray-900 block truncate">{phrase.phrase}</span>
                    <span className="text-xs text-gray-500 capitalize">{phrase.category}</span>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                  selectedPhrase?.id === phrase.id ? 'rotate-90' : ''
                }`} />
              </button>
            ))}
          </div>
          {selectedPhrase && (
            <div className="mt-4 p-4 bg-teal-50 rounded-xl border border-teal-200">
              <h3 className="font-semibold text-gray-900 mb-1">{selectedPhrase.phrase}</h3>
              <p className="text-sm text-gray-700">{selectedPhrase.description}</p>
              <p className="text-xs text-teal-600 mt-2">
                {t('signLanguage.videoComingSoon', 'GSL video demonstration coming soon. Contact GNAD for interpreter services.')}
              </p>
            </div>
          )}
        </div>

        {/* SRHR Glossary */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600" />
            {t('signLanguage.glossary', 'SRHR Terms Glossary')}
          </h2>
          <div className="space-y-3">
            {srhrTerms.map((item) => (
              <div
                key={item.term}
                className="p-4 bg-gray-50 rounded-xl border border-gray-200"
              >
                <span className="font-medium text-gray-900">{item.term}</span>
                <p className="text-sm text-gray-600 mt-1">{item.definition}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-teal-600" />
            {t('signLanguage.resources', 'Resources')}
          </h2>
          <div className="space-y-3">
            {resources.map((resource) => (
              resource.action ? (
                <button
                  key={resource.title}
                  onClick={resource.action}
                  className="w-full flex items-center gap-4 p-4 bg-teal-50 rounded-xl border border-teal-200 hover:bg-teal-100 transition-colors text-left touch-manipulation"
                >
                  <resource.icon className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900">{resource.title}</h3>
                    <p className="text-sm text-gray-600">{resource.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-teal-600 flex-shrink-0" />
                </button>
              ) : (
                <a
                  key={resource.title}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-teal-50 rounded-xl border border-teal-200 hover:bg-teal-100 transition-colors"
                >
                  <resource.icon className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900">{resource.title}</h3>
                    <p className="text-sm text-gray-600">{resource.description}</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-teal-600 flex-shrink-0" />
                </a>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignLanguage;
