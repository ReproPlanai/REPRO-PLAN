import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  image?: string;
  type?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

// SEO configurations for different pages
const seoConfigs: Record<string, SEOConfig> = {
  '/': {
    title: 'REPRO PLAN - Anonymous SRHR Platform for Youth',
    description: 'Anonymous, inclusive, and scalable Sexual and Reproductive Health and Rights platform for youth. Get safe access to SRHR information, education, and support in Liberia and West Africa.',
    keywords: ['SRHR', 'sexual health', 'reproductive health', 'youth', 'Liberia', 'West Africa', 'anonymous', 'safe space'],
    type: 'website',
    section: 'Health & Wellness',
    tags: ['SRHR', 'Youth Health', 'Mobile Health']
  },
  '/chatbot': {
    title: 'Anonymous SRHR Chatbot - REPRO PLAN',
    description: 'Ask questions about sexual and reproductive health anonymously. Get accurate, evidence-based information from our AI-powered chatbot.',
    keywords: ['SRHR chatbot', 'anonymous health questions', 'sexual health AI', 'reproductive health support'],
    type: 'article',
    section: 'Health Education',
    tags: ['Chatbot', 'AI', 'Health Education']
  },
  '/videos': {
    title: 'Educational SRHR Videos - REPRO PLAN',
    description: 'Watch expert-led videos about sexual and reproductive health and rights. Comprehensive educational content for youth.',
    keywords: ['SRHR videos', 'health education videos', 'sexual health education', 'reproductive health videos'],
    type: 'article',
    section: 'Health Education',
    tags: ['Videos', 'Education', 'Health Content']
  },
  '/articles': {
    title: 'Expert SRHR Articles - REPRO PLAN',
    description: 'Read in-depth articles about sexual and reproductive health from medical experts and health professionals.',
    keywords: ['SRHR articles', 'health articles', 'sexual health information', 'reproductive health guides'],
    type: 'article',
    section: 'Health Education',
    tags: ['Articles', 'Expert Content', 'Health Information']
  },
  '/clinics': {
    title: 'Find Health Clinics - REPRO PLAN',
    description: 'Locate nearby health clinics and medical services. Find safe, confidential healthcare providers in your area.',
    keywords: ['health clinics', 'medical services', 'healthcare providers', 'clinic finder'],
    type: 'article',
    section: 'Health Services',
    tags: ['Clinics', 'Healthcare', 'Medical Services']
  },
  '/tracker': {
    title: 'Health Tracker - REPRO PLAN',
    description: 'Track your health, menstrual cycles, and wellness data privately. Anonymous health monitoring and tracking.',
    keywords: ['health tracker', 'menstrual cycle tracker', 'wellness tracking', 'health monitoring'],
    type: 'article',
    section: 'Health Tools',
    tags: ['Health Tracking', 'Wellness', 'Monitoring']
  },
  '/games': {
    title: 'Educational Health Games - REPRO PLAN',
    description: 'Learn about sexual and reproductive health through interactive games and quizzes. Fun, educational health games.',
    keywords: ['health games', 'educational games', 'SRHR games', 'health quizzes'],
    type: 'article',
    section: 'Health Education',
    tags: ['Games', 'Education', 'Interactive Learning']
  },
  '/emergency': {
    title: 'Emergency Support - REPRO PLAN',
    description: 'Get immediate emergency support and crisis intervention. 24/7 emergency services for sexual and reproductive health crises.',
    keywords: ['emergency support', 'crisis intervention', 'emergency health services', 'crisis support'],
    type: 'article',
    section: 'Emergency Services',
    tags: ['Emergency', 'Crisis Support', 'Health Emergency']
  },
  '/mentorship': {
    title: 'Peer Mentorship - REPRO PLAN',
    description: 'Connect with trained peer mentors for guidance and support. Anonymous mentorship for sexual and reproductive health.',
    keywords: ['peer mentorship', 'health mentorship', 'peer support', 'mentor guidance'],
    type: 'article',
    section: 'Support Services',
    tags: ['Mentorship', 'Peer Support', 'Guidance']
  },
  '/medication-order': {
    title: 'Secure Medication Ordering - REPRO PLAN',
    description: 'Order prescription and OTC medications securely and anonymously. Safe medication delivery and management.',
    keywords: ['medication ordering', 'prescription drugs', 'OTC medications', 'secure medication'],
    type: 'article',
    section: 'Health Services',
    tags: ['Medication', 'Prescription', 'Health Services']
  },
  '/secure-map': {
    title: 'Safe Space Navigation - REPRO PLAN',
    description: 'Navigate to safe spaces and emergency shelters with secure, anonymous location services.',
    keywords: ['safe spaces', 'emergency shelters', 'secure navigation', 'safe location services'],
    type: 'article',
    section: 'Safety Services',
    tags: ['Safe Spaces', 'Navigation', 'Safety']
  },
  '/settings': {
    title: 'Settings & Privacy - REPRO PLAN',
    description: 'Manage your REPRO PLAN settings, privacy preferences, and account security. Complete control over your data.',
    keywords: ['privacy settings', 'account security', 'data privacy', 'user settings'],
    type: 'article',
    section: 'User Management',
    tags: ['Settings', 'Privacy', 'Security']
  },
  '/dashboard': {
    title: 'Stakeholder Dashboard - REPRO PLAN',
    description: 'Access stakeholder dashboards for emergency response, case management, and system administration.',
    keywords: ['stakeholder dashboard', 'emergency response', 'case management', 'system administration'],
    type: 'article',
    section: 'Administration',
    tags: ['Dashboard', 'Administration', 'Management']
  }
};

export const useSEO = (customConfig?: Partial<SEOConfig>) => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Get base config for current path
  const baseConfig = seoConfigs[currentPath] || seoConfigs['/'];
  
  // Merge with custom config
  const config = { ...baseConfig, ...customConfig };

  useEffect(() => {
    // Update document title
    document.title = config.title;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', config.description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = config.description;
      document.head.appendChild(meta);
    }

    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', config.keywords.join(', '));
    } else {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = config.keywords.join(', ');
      document.head.appendChild(meta);
    }

    // Update Open Graph tags
    const updateOGTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (meta) {
        meta.setAttribute('content', content);
      } else {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    };

    updateOGTag('og:title', config.title);
    updateOGTag('og:description', config.description);
    updateOGTag('og:url', window.location.href);
    updateOGTag('og:type', config.type || 'website');
    
    if (config.image) {
      updateOGTag('og:image', config.image);
    }

    // Update Twitter Card tags
    const updateTwitterTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="twitter:${name}"]`);
      if (meta) {
        meta.setAttribute('content', content);
      } else {
        meta = document.createElement('meta');
        meta.setAttribute('name', `twitter:${name}`);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    };

    updateTwitterTag('title', config.title);
    updateTwitterTag('description', config.description);
    
    if (config.image) {
      updateTwitterTag('image', config.image);
    }

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', window.location.href);
    } else {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      canonical.setAttribute('href', window.location.href);
      document.head.appendChild(canonical);
    }

    // Add structured data for health content
    if (config.section === 'Health Education' || config.section === 'Health Services') {
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": config.title,
        "description": config.description,
        "url": window.location.href,
        "mainEntity": {
          "@type": "MedicalWebPage",
          "name": config.title,
          "description": config.description,
          "medicalAudience": {
            "@type": "MedicalAudience",
            "audienceType": "Youth"
          },
          "about": {
            "@type": "MedicalCondition",
            "name": "Sexual and Reproductive Health"
          }
        },
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "REPRO PLAN",
              "item": "https://repro-plan.netlify.app"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": config.title,
              "item": window.location.href
            }
          ]
        }
      };

      // Remove existing structured data
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Add new structured data
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

  }, [config, currentPath]);

  return config;
};
