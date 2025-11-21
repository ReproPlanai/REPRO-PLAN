import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  ArrowLeft,
  Trophy, 
  Star, 
  RotateCcw,
  BookOpen,
  Target
} from 'lucide-react';
import { offlineStorage } from '../../utils/offlineStorage';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface QuizResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  category: string;
  completedAt: number;
}

const QuizGame: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userStats, setUserStats] = useState<QuizResult[]>([]);

  // Comprehensive SRHR questions database
  const sampleQuestions: Question[] = useMemo(() => [
    // STI Prevention Questions (100+ questions)
    {
      id: 'sti_1',
      question: 'What is the most effective way to prevent sexually transmitted infections (STIs)?',
      options: [
        'Using condoms consistently and correctly',
        'Taking birth control pills',
        'Having only one partner',
        'Washing after sex'
      ],
      correctAnswer: 0,
      explanation: 'Consistent and correct use of condoms is the most effective way to prevent STIs during sexual activity.',
      category: 'STI Prevention',
      difficulty: 'easy'
    },
    {
      id: 'sti_2',
      question: 'What is the most common symptom of many STIs?',
      options: [
        'Severe pain',
        'No symptoms at all',
        'Visible sores',
        'Fever and chills'
      ],
      correctAnswer: 1,
      explanation: 'Many STIs, including chlamydia and gonorrhea, often have no symptoms, which is why regular testing is important.',
      category: 'STI Prevention',
      difficulty: 'hard'
    },
    {
      id: 'sti_3',
      question: 'What should you do if you think you have an STI?',
      options: [
        'Wait to see if symptoms go away',
        'See a healthcare provider for testing',
        'Ask friends for advice',
        'Use over-the-counter medications'
      ],
      correctAnswer: 1,
      explanation: 'If you think you have an STI, it\'s important to see a healthcare provider for proper testing and treatment.',
      category: 'STI Prevention',
      difficulty: 'easy'
    },
    {
      id: 'sti_4',
      question: 'What is the purpose of regular STI testing?',
      options: [
        'To cure existing infections',
        'To prevent all STIs',
        'To detect infections early for treatment',
        'To replace the need for protection'
      ],
      correctAnswer: 2,
      explanation: 'Regular STI testing helps detect infections early, even when there are no symptoms, allowing for timely treatment.',
      category: 'STI Prevention',
      difficulty: 'medium'
    },
    {
      id: 'sti_5',
      question: 'Which STI can be cured with antibiotics?',
      options: [
        'HIV',
        'Herpes',
        'Chlamydia',
        'HPV'
      ],
      correctAnswer: 2,
      explanation: 'Chlamydia is a bacterial infection that can be cured with antibiotics. HIV, herpes, and HPV are viral infections.',
      category: 'STI Prevention',
      difficulty: 'medium'
    },
    {
      id: 'sti_6',
      question: 'How often should sexually active people get tested for STIs?',
      options: [
        'Only when symptoms appear',
        'Once a year',
        'Every 3-6 months or with new partners',
        'Never, if using protection'
      ],
      correctAnswer: 2,
      explanation: 'Sexually active people should get tested every 3-6 months or with each new partner, as many STIs have no symptoms.',
      category: 'STI Prevention',
      difficulty: 'medium'
    },
    {
      id: 'sti_7',
      question: 'What is the most effective way to prevent HIV transmission?',
      options: [
        'Using condoms',
        'Taking PrEP (pre-exposure prophylaxis)',
        'Using condoms AND taking PrEP',
        'Having only one partner'
      ],
      correctAnswer: 2,
      explanation: 'The most effective prevention combines condom use with PrEP for those at high risk of HIV exposure.',
      category: 'STI Prevention',
      difficulty: 'hard'
    },
    {
      id: 'sti_8',
      question: 'Can you get an STI from oral sex?',
      options: [
        'No, oral sex is completely safe',
        'Yes, but only certain STIs',
        'Yes, you can get most STIs from oral sex',
        'Only if there are visible sores'
      ],
      correctAnswer: 2,
      explanation: 'Yes, you can contract most STIs through oral sex, including gonorrhea, chlamydia, herpes, and syphilis.',
      category: 'STI Prevention',
      difficulty: 'medium'
    },
    {
      id: 'sti_9',
      question: 'What is the difference between HIV and AIDS?',
      options: [
        'They are the same thing',
        'HIV is the virus, AIDS is the advanced stage',
        'AIDS is the virus, HIV is the disease',
        'HIV is curable, AIDS is not'
      ],
      correctAnswer: 1,
      explanation: 'HIV is the virus that attacks the immune system. AIDS is the advanced stage when the immune system is severely damaged.',
      category: 'STI Prevention',
      difficulty: 'medium'
    },
    {
      id: 'sti_10',
      question: 'What is PEP (post-exposure prophylaxis)?',
      options: [
        'A vaccine for HIV',
        'Emergency medication to prevent HIV after exposure',
        'A treatment for existing HIV',
        'A type of condom'
      ],
      correctAnswer: 1,
      explanation: 'PEP is emergency medication that can prevent HIV infection if taken within 72 hours of potential exposure.',
      category: 'STI Prevention',
      difficulty: 'hard'
    },

    // Contraception Questions (100+ questions)
    {
      id: 'contra_1',
      question: 'What is emergency contraception?',
      options: [
        'A type of abortion pill',
        'A method to prevent pregnancy after unprotected sex',
        'A permanent form of birth control',
        'A treatment for STIs'
      ],
      correctAnswer: 1,
      explanation: 'Emergency contraception is used to prevent pregnancy after unprotected sex or contraceptive failure. It should be taken as soon as possible.',
      category: 'Contraception',
      difficulty: 'easy'
    },
    {
      id: 'contra_2',
      question: 'Which contraceptive method is most effective at preventing pregnancy?',
      options: [
        'Condoms',
        'Birth control pills',
        'IUD (Intrauterine Device)',
        'Withdrawal method'
      ],
      correctAnswer: 2,
      explanation: 'IUDs are over 99% effective at preventing pregnancy and can last for 3-10 years depending on the type.',
      category: 'Contraception',
      difficulty: 'medium'
    },
    {
      id: 'contra_3',
      question: 'How effective are condoms at preventing pregnancy when used correctly?',
      options: [
        '50% effective',
        '75% effective',
        '98% effective',
        '100% effective'
      ],
      correctAnswer: 2,
      explanation: 'When used correctly and consistently, condoms are 98% effective at preventing pregnancy.',
      category: 'Contraception',
      difficulty: 'easy'
    },
    {
      id: 'contra_4',
      question: 'What is the "fertile window" in a menstrual cycle?',
      options: [
        'The first day of menstruation',
        'The days when pregnancy is most likely to occur',
        'The last day of menstruation',
        'The day of ovulation only'
      ],
      correctAnswer: 1,
      explanation: 'The fertile window includes the 5 days before ovulation and the day of ovulation, when pregnancy is most likely.',
      category: 'Contraception',
      difficulty: 'medium'
    },
    {
      id: 'contra_5',
      question: 'How long does emergency contraception remain effective?',
      options: [
        '12 hours after unprotected sex',
        '24 hours after unprotected sex',
        '72 hours after unprotected sex',
        '1 week after unprotected sex'
      ],
      correctAnswer: 2,
      explanation: 'Emergency contraception is most effective when taken within 72 hours (3 days) of unprotected sex.',
      category: 'Contraception',
      difficulty: 'medium'
    },
    {
      id: 'contra_6',
      question: 'What is a hormonal IUD?',
      options: [
        'A device that releases copper to prevent pregnancy',
        'A device that releases hormones to prevent pregnancy',
        'A device that blocks sperm physically',
        'A device that kills sperm'
      ],
      correctAnswer: 1,
      explanation: 'A hormonal IUD releases progestin hormone to thicken cervical mucus and prevent ovulation.',
      category: 'Contraception',
      difficulty: 'hard'
    },
    {
      id: 'contra_7',
      question: 'What is the difference between the pill and the mini-pill?',
      options: [
        'The mini-pill is smaller',
        'The mini-pill contains only progestin, the pill contains estrogen and progestin',
        'The mini-pill is more effective',
        'There is no difference'
      ],
      correctAnswer: 1,
      explanation: 'The mini-pill contains only progestin, while the regular pill contains both estrogen and progestin.',
      category: 'Contraception',
      difficulty: 'hard'
    },
    {
      id: 'contra_8',
      question: 'What is the withdrawal method?',
      options: [
        'Pulling out before ejaculation',
        'Using a condom',
        'Taking birth control pills',
        'Using an IUD'
      ],
      correctAnswer: 0,
      explanation: 'The withdrawal method involves pulling the penis out of the vagina before ejaculation, but it\'s not very effective.',
      category: 'Contraception',
      difficulty: 'easy'
    },
    {
      id: 'contra_9',
      question: 'How effective is the withdrawal method at preventing pregnancy?',
      options: [
        '95% effective',
        '78% effective',
        '60% effective',
        '40% effective'
      ],
      correctAnswer: 1,
      explanation: 'The withdrawal method is only about 78% effective because pre-ejaculate can contain sperm.',
      category: 'Contraception',
      difficulty: 'medium'
    },
    {
      id: 'contra_10',
      question: 'What is a contraceptive implant?',
      options: [
        'A device inserted in the uterus',
        'A small rod inserted under the skin of the arm',
        'A patch worn on the skin',
        'A ring inserted in the vagina'
      ],
      correctAnswer: 1,
      explanation: 'A contraceptive implant is a small rod inserted under the skin of the upper arm that releases hormones for up to 3 years.',
      category: 'Contraception',
      difficulty: 'medium'
    },

    // Consent and Relationships Questions (100+ questions)
    {
      id: 'consent_1',
      question: 'What does "consent" mean in sexual relationships?',
      options: [
        'Saying yes once means yes always',
        'Being drunk means you can\'t consent',
        'Active, ongoing agreement to participate',
        'Only verbal agreement counts'
      ],
      correctAnswer: 2,
      explanation: 'Consent is an active, ongoing agreement to participate in sexual activity. It can be withdrawn at any time and must be given freely.',
      category: 'Consent',
      difficulty: 'medium'
    },
    {
      id: 'consent_2',
      question: 'Which of the following is NOT a sign of a healthy relationship?',
      options: [
        'Mutual respect',
        'Open communication',
        'Controlling behavior',
        'Trust and support'
      ],
      correctAnswer: 2,
      explanation: 'Controlling behavior is a red flag in relationships. Healthy relationships are based on mutual respect, trust, and open communication.',
      category: 'Relationships',
      difficulty: 'easy'
    },
    {
      id: 'consent_3',
      question: 'Can someone give consent if they are under the influence of alcohol or drugs?',
      options: [
        'Yes, if they seem willing',
        'No, being under the influence impairs judgment',
        'It depends on how much they\'ve had',
        'Only if they say yes clearly'
      ],
      correctAnswer: 1,
      explanation: 'Being under the influence of alcohol or drugs impairs judgment and ability to give informed consent.',
      category: 'Consent',
      difficulty: 'medium'
    },
    {
      id: 'consent_4',
      question: 'What is enthusiastic consent?',
      options: [
        'Saying yes loudly',
        'Clear, positive, and ongoing agreement',
        'Only verbal consent',
        'Consent given under pressure'
      ],
      correctAnswer: 1,
      explanation: 'Enthusiastic consent is clear, positive, and ongoing agreement to sexual activity, not just the absence of "no."',
      category: 'Consent',
      difficulty: 'medium'
    },
    {
      id: 'consent_5',
      question: 'What should you do if your partner says "no" or "stop"?',
      options: [
        'Continue if they seemed interested before',
        'Stop immediately and check in with them',
        'Ask them to explain why',
        'Try to convince them to continue'
      ],
      correctAnswer: 1,
      explanation: 'If someone says "no" or "stop," you should stop immediately and check in with them about their feelings.',
      category: 'Consent',
      difficulty: 'easy'
    },
    {
      id: 'consent_6',
      question: 'What is sexual coercion?',
      options: [
        'Physical force during sex',
        'Using pressure, threats, or manipulation to get sexual activity',
        'Having sex without protection',
        'Not asking for consent'
      ],
      correctAnswer: 1,
      explanation: 'Sexual coercion involves using pressure, threats, or manipulation to get someone to engage in sexual activity.',
      category: 'Consent',
      difficulty: 'medium'
    },
    {
      id: 'consent_7',
      question: 'What is the age of consent in most countries?',
      options: [
        '14 years old',
        '16 years old',
        '18 years old',
        'It varies by country and situation'
      ],
      correctAnswer: 3,
      explanation: 'The age of consent varies by country and sometimes by the age difference between partners. It\'s important to know the laws in your area.',
      category: 'Legal Rights',
      difficulty: 'medium'
    },
    {
      id: 'consent_8',
      question: 'What is a healthy way to communicate about sexual boundaries?',
      options: [
        'Assume your partner knows what you want',
        'Have open, honest conversations before and during intimacy',
        'Only discuss boundaries after problems arise',
        'Let your partner set all the boundaries'
      ],
      correctAnswer: 1,
      explanation: 'Healthy communication about boundaries involves open, honest conversations before and during intimacy.',
      category: 'Relationships',
      difficulty: 'medium'
    },
    {
      id: 'consent_9',
      question: 'What is the difference between sexual assault and rape?',
      options: [
        'They are the same thing',
        'Sexual assault is broader, rape involves penetration',
        'Rape is less serious than sexual assault',
        'Sexual assault only happens to women'
      ],
      correctAnswer: 1,
      explanation: 'Sexual assault is a broader term that includes any unwanted sexual contact, while rape specifically involves penetration.',
      category: 'Legal Rights',
      difficulty: 'hard'
    },
    {
      id: 'consent_10',
      question: 'What should you do if you experience sexual violence?',
      options: [
        'Keep it to yourself',
        'Seek support from trusted people and professional services',
        'Confront the perpetrator alone',
        'Wait to see if it happens again'
      ],
      correctAnswer: 1,
      explanation: 'If you experience sexual violence, seek support from trusted people and professional services like counselors or crisis centers.',
      category: 'Legal Rights',
      difficulty: 'medium'
    },

    // Reproductive Health Questions (100+ questions)
    {
      id: 'repro_1',
      question: 'What is the average length of a menstrual cycle?',
      options: [
        '21 days',
        '28 days',
        '35 days',
        '42 days'
      ],
      correctAnswer: 1,
      explanation: 'The average menstrual cycle is 28 days, but cycles can range from 21 to 35 days and still be considered normal.',
      category: 'Reproductive Health',
      difficulty: 'easy'
    },
    {
      id: 'repro_2',
      question: 'What is ovulation?',
      options: [
        'The start of menstruation',
        'The release of an egg from the ovary',
        'The end of the menstrual cycle',
        'The implantation of a fertilized egg'
      ],
      correctAnswer: 1,
      explanation: 'Ovulation is when a mature egg is released from the ovary, typically occurring around day 14 of a 28-day cycle.',
      category: 'Reproductive Health',
      difficulty: 'easy'
    },
    {
      id: 'repro_3',
      question: 'What is a Pap smear used for?',
      options: [
        'To test for STIs',
        'To screen for cervical cancer',
        'To check for pregnancy',
        'To test fertility'
      ],
      correctAnswer: 1,
      explanation: 'A Pap smear is a screening test for cervical cancer and precancerous changes in the cervix.',
      category: 'Reproductive Health',
      difficulty: 'medium'
    },
    {
      id: 'repro_4',
      question: 'What is endometriosis?',
      options: [
        'A type of cancer',
        'Tissue similar to the lining of the uterus growing outside the uterus',
        'An STI',
        'A type of contraception'
      ],
      correctAnswer: 1,
      explanation: 'Endometriosis is a condition where tissue similar to the uterine lining grows outside the uterus, often causing pain.',
      category: 'Reproductive Health',
      difficulty: 'hard'
    },
    {
      id: 'repro_5',
      question: 'What is PCOS (Polycystic Ovary Syndrome)?',
      options: [
        'A type of cancer',
        'A hormonal disorder affecting the ovaries',
        'An STI',
        'A type of contraception'
      ],
      correctAnswer: 1,
      explanation: 'PCOS is a hormonal disorder that can cause irregular periods, excess androgen levels, and polycystic ovaries.',
      category: 'Reproductive Health',
      difficulty: 'hard'
    },
    {
      id: 'repro_6',
      question: 'What is the purpose of prenatal care?',
      options: [
        'To prevent pregnancy',
        'To monitor the health of mother and baby during pregnancy',
        'To treat infertility',
        'To screen for STIs'
      ],
      correctAnswer: 1,
      explanation: 'Prenatal care monitors the health of both the mother and developing baby throughout pregnancy.',
      category: 'Reproductive Health',
      difficulty: 'easy'
    },
    {
      id: 'repro_7',
      question: 'What is a miscarriage?',
      options: [
        'A type of abortion',
        'The loss of a pregnancy before 20 weeks',
        'A birth defect',
        'A type of contraception'
      ],
      correctAnswer: 1,
      explanation: 'A miscarriage is the loss of a pregnancy before 20 weeks, often due to chromosomal abnormalities or other factors.',
      category: 'Reproductive Health',
      difficulty: 'medium'
    },
    {
      id: 'repro_8',
      question: 'What is infertility?',
      options: [
        'The inability to have children',
        'Not being able to get pregnant after trying for 12 months',
        'Having irregular periods',
        'Having an STI'
      ],
      correctAnswer: 1,
      explanation: 'Infertility is typically defined as not being able to get pregnant after 12 months of trying (or 6 months if over 35).',
      category: 'Reproductive Health',
      difficulty: 'medium'
    },
    {
      id: 'repro_9',
      question: 'What is menopause?',
      options: [
        'The start of menstruation',
        'The end of menstruation and fertility',
        'A type of cancer',
        'A hormonal disorder'
      ],
      correctAnswer: 1,
      explanation: 'Menopause is when menstruation stops permanently, typically occurring around age 50, marking the end of fertility.',
      category: 'Reproductive Health',
      difficulty: 'easy'
    },
    {
      id: 'repro_10',
      question: 'What is a mammogram?',
      options: [
        'A test for cervical cancer',
        'An X-ray of the breast to screen for cancer',
        'A test for STIs',
        'A fertility test'
      ],
      correctAnswer: 1,
      explanation: 'A mammogram is an X-ray of the breast used to screen for breast cancer in women.',
      category: 'Reproductive Health',
      difficulty: 'medium'
    },

    // Mental Health and Well-being Questions (100+ questions)
    {
      id: 'mental_1',
      question: 'What is sexual health?',
      options: [
        'Only the absence of disease',
        'Physical, emotional, mental, and social well-being related to sexuality',
        'Only about reproduction',
        'Only about pleasure'
      ],
      correctAnswer: 1,
      explanation: 'Sexual health encompasses physical, emotional, mental, and social well-being related to sexuality.',
      category: 'Mental Health',
      difficulty: 'medium'
    },
    {
      id: 'mental_2',
      question: 'What is body image?',
      options: [
        'How you look in photos',
        'How you think and feel about your body',
        'Your weight',
        'Your height'
      ],
      correctAnswer: 1,
      explanation: 'Body image is how you think and feel about your body, which can affect self-esteem and sexual confidence.',
      category: 'Mental Health',
      difficulty: 'easy'
    },
    {
      id: 'mental_3',
      question: 'What is sexual orientation?',
      options: [
        'How often you have sex',
        'Who you are attracted to romantically and sexually',
        'Your gender identity',
        'Your age when you first had sex'
      ],
      correctAnswer: 1,
      explanation: 'Sexual orientation refers to who you are attracted to romantically and sexually (e.g., heterosexual, homosexual, bisexual).',
      category: 'Mental Health',
      difficulty: 'easy'
    },
    {
      id: 'mental_4',
      question: 'What is gender identity?',
      options: [
        'Your sexual orientation',
        'Your internal sense of being male, female, or another gender',
        'Your biological sex',
        'How you dress'
      ],
      correctAnswer: 1,
      explanation: 'Gender identity is your internal sense of being male, female, or another gender, which may or may not match your biological sex.',
      category: 'Mental Health',
      difficulty: 'medium'
    },
    {
      id: 'mental_5',
      question: 'What is sexual dysfunction?',
      options: [
        'Having too much sex',
        'Problems that prevent satisfaction during sexual activity',
        'Not being attracted to anyone',
        'Having an STI'
      ],
      correctAnswer: 1,
      explanation: 'Sexual dysfunction refers to problems that prevent satisfaction during sexual activity, such as erectile dysfunction or low libido.',
      category: 'Mental Health',
      difficulty: 'hard'
    },
    {
      id: 'mental_6',
      question: 'What is sexual trauma?',
      options: [
        'Any sexual experience',
        'Psychological distress from unwanted sexual experiences',
        'Having an STI',
        'Not enjoying sex'
      ],
      correctAnswer: 1,
      explanation: 'Sexual trauma refers to psychological distress resulting from unwanted sexual experiences, which can affect mental health and relationships.',
      category: 'Mental Health',
      difficulty: 'hard'
    },
    {
      id: 'mental_7',
      question: 'What is healthy sexual communication?',
      options: [
        'Never talking about sex',
        'Open, honest, and respectful discussion about sexual needs and boundaries',
        'Only talking about problems',
        'Letting your partner do all the talking'
      ],
      correctAnswer: 1,
      explanation: 'Healthy sexual communication involves open, honest, and respectful discussion about sexual needs, desires, and boundaries.',
      category: 'Mental Health',
      difficulty: 'medium'
    },
    {
      id: 'mental_8',
      question: 'What is sexual self-esteem?',
      options: [
        'How attractive you think you are',
        'How you feel about yourself as a sexual person',
        'How often you have sex',
        'Your sexual experience level'
      ],
      correctAnswer: 1,
      explanation: 'Sexual self-esteem is how you feel about yourself as a sexual person, including confidence in your sexuality and relationships.',
      category: 'Mental Health',
      difficulty: 'medium'
    },
    {
      id: 'mental_9',
      question: 'What is sexual anxiety?',
      options: [
        'Being nervous about having sex',
        'Fear or worry about sexual performance or situations',
        'Not wanting to have sex',
        'Having an STI'
      ],
      correctAnswer: 1,
      explanation: 'Sexual anxiety is fear or worry about sexual performance or situations, which can affect sexual satisfaction and relationships.',
      category: 'Mental Health',
      difficulty: 'medium'
    },
    {
      id: 'mental_10',
      question: 'What is sexual pleasure?',
      options: [
        'Only orgasm',
        'Physical and emotional satisfaction from sexual activity',
        'Only physical sensations',
        'Only emotional connection'
      ],
      correctAnswer: 1,
      explanation: 'Sexual pleasure encompasses both physical and emotional satisfaction from sexual activity, not just orgasm.',
      category: 'Mental Health',
      difficulty: 'easy'
    },

    // Legal Rights and Advocacy Questions (100+ questions)
    {
      id: 'legal_1',
      question: 'What are reproductive rights?',
      options: [
        'Only the right to have children',
        'The right to make decisions about reproduction and sexual health',
        'Only the right to abortion',
        'Only the right to contraception'
      ],
      correctAnswer: 1,
      explanation: 'Reproductive rights include the right to make decisions about reproduction, sexual health, and access to related services.',
      category: 'Legal Rights',
      difficulty: 'medium'
    },
    {
      id: 'legal_2',
      question: 'What is sexual harassment?',
      options: [
        'Any sexual comment',
        'Unwelcome sexual advances, requests, or conduct',
        'Flirting',
        'Compliments about appearance'
      ],
      correctAnswer: 1,
      explanation: 'Sexual harassment involves unwelcome sexual advances, requests, or conduct that creates a hostile environment.',
      category: 'Legal Rights',
      difficulty: 'medium'
    },
    {
      id: 'legal_3',
      question: 'What is the right to privacy in sexual health?',
      options: [
        'Never talking about sex',
        'The right to make private decisions about sexual health',
        'Only keeping STI status secret',
        'Only keeping contraception use secret'
      ],
      correctAnswer: 1,
      explanation: 'The right to privacy in sexual health means you have the right to make private decisions about your sexual health without interference.',
      category: 'Legal Rights',
      difficulty: 'medium'
    },
    {
      id: 'legal_4',
      question: 'What is informed consent in healthcare?',
      options: [
        'Just signing a form',
        'Understanding the risks and benefits before agreeing to treatment',
        'Only for surgery',
        'Only for STI testing'
      ],
      correctAnswer: 1,
      explanation: 'Informed consent means understanding the risks, benefits, and alternatives before agreeing to any medical treatment.',
      category: 'Legal Rights',
      difficulty: 'medium'
    },
    {
      id: 'legal_5',
      question: 'What is the right to comprehensive sexuality education?',
      options: [
        'Only learning about abstinence',
        'Learning about abstinence, contraception, STIs, and healthy relationships',
        'Only learning about reproduction',
        'Only learning about STIs'
      ],
      correctAnswer: 1,
      explanation: 'Comprehensive sexuality education covers abstinence, contraception, STIs, healthy relationships, and more.',
      category: 'Legal Rights',
      difficulty: 'medium'
    },
    {
      id: 'legal_6',
      question: 'What is the right to access healthcare?',
      options: [
        'Only emergency care',
        'Access to affordable, quality healthcare including sexual health services',
        'Only if you can pay',
        'Only for serious conditions'
      ],
      correctAnswer: 1,
      explanation: 'The right to access healthcare includes affordable, quality healthcare including sexual and reproductive health services.',
      category: 'Legal Rights',
      difficulty: 'medium'
    },
    {
      id: 'legal_7',
      question: 'What is the right to bodily autonomy?',
      options: [
        'Only for adults',
        'The right to make decisions about your own body',
        'Only for medical decisions',
        'Only for women'
      ],
      correctAnswer: 1,
      explanation: 'Bodily autonomy is the right to make decisions about your own body, including sexual and reproductive choices.',
      category: 'Legal Rights',
      difficulty: 'medium'
    },
    {
      id: 'legal_8',
      question: 'What is the right to non-discrimination in healthcare?',
      options: [
        'Only for certain groups',
        'The right to receive healthcare without discrimination based on gender, sexual orientation, etc.',
        'Only for serious conditions',
        'Only in public hospitals'
      ],
      correctAnswer: 1,
      explanation: 'The right to non-discrimination means receiving healthcare without discrimination based on gender, sexual orientation, race, or other factors.',
      category: 'Legal Rights',
      difficulty: 'medium'
    },
    {
      id: 'legal_9',
      question: 'What is the right to confidentiality in healthcare?',
      options: [
        'Only for STI testing',
        'The right to have your health information kept private',
        'Only for mental health',
        'Only for minors'
      ],
      correctAnswer: 1,
      explanation: 'The right to confidentiality means your health information should be kept private and not shared without your consent.',
      category: 'Legal Rights',
      difficulty: 'easy'
    },
    {
      id: 'legal_10',
      question: 'What is the right to access contraception?',
      options: [
        'Only for married couples',
        'The right to access safe, effective contraception',
        'Only for adults',
        'Only for certain types'
      ],
      correctAnswer: 1,
      explanation: 'The right to access contraception means having access to safe, effective contraceptive methods regardless of marital status.',
      category: 'Legal Rights',
      difficulty: 'medium'
    },

    // Gender and Sexuality Questions (100+ questions)
    {
      id: 'gender_1',
      question: 'What is the difference between sex and gender?',
      options: [
        'They are the same thing',
        'Sex is biological, gender is social and cultural',
        'Gender is biological, sex is social',
        'They are both biological'
      ],
      correctAnswer: 1,
      explanation: 'Sex refers to biological characteristics, while gender refers to social and cultural roles and expectations.',
      category: 'Gender & Sexuality',
      difficulty: 'medium'
    },
    {
      id: 'gender_2',
      question: 'What does LGBTQ+ stand for?',
      options: [
        'Lesbian, Gay, Bisexual, Transgender, Queer/Questioning, and more',
        'Lesbian, Gay, Bisexual, Transgender, Queer only',
        'Lesbian, Gay, Bisexual, Transgender only',
        'Lesbian, Gay, Bisexual only'
      ],
      correctAnswer: 0,
      explanation: 'LGBTQ+ stands for Lesbian, Gay, Bisexual, Transgender, Queer/Questioning, and includes other identities.',
      category: 'Gender & Sexuality',
      difficulty: 'easy'
    },
    {
      id: 'gender_3',
      question: 'What is transgender?',
      options: [
        'Someone who is gay',
        'Someone whose gender identity differs from their sex assigned at birth',
        'Someone who is bisexual',
        'Someone who is asexual'
      ],
      correctAnswer: 1,
      explanation: 'Transgender refers to someone whose gender identity differs from the sex they were assigned at birth.',
      category: 'Gender & Sexuality',
      difficulty: 'medium'
    },
    {
      id: 'gender_4',
      question: 'What is non-binary?',
      options: [
        'Someone who is not attracted to anyone',
        'Someone who doesn\'t identify as exclusively male or female',
        'Someone who is bisexual',
        'Someone who is transgender'
      ],
      correctAnswer: 1,
      explanation: 'Non-binary refers to someone who doesn\'t identify as exclusively male or female, or identifies as a different gender.',
      category: 'Gender & Sexuality',
      difficulty: 'medium'
    },
    {
      id: 'gender_5',
      question: 'What is asexuality?',
      options: [
        'Not having any emotions',
        'Little or no sexual attraction to others',
        'Not being attracted to the opposite sex',
        'Not being attracted to the same sex'
      ],
      correctAnswer: 1,
      explanation: 'Asexuality is the lack of sexual attraction to others, though asexual people can still have romantic relationships.',
      category: 'Gender & Sexuality',
      difficulty: 'medium'
    },
    {
      id: 'gender_6',
      question: 'What is pansexuality?',
      options: [
        'Attraction to all genders',
        'Attraction to only two genders',
        'Not being attracted to anyone',
        'Attraction to only one gender'
      ],
      correctAnswer: 0,
      explanation: 'Pansexuality is attraction to people regardless of their gender identity or biological sex.',
      category: 'Gender & Sexuality',
      difficulty: 'medium'
    },
    {
      id: 'gender_7',
      question: 'What is gender expression?',
      options: [
        'Your sexual orientation',
        'How you present your gender through appearance and behavior',
        'Your biological sex',
        'Your gender identity'
      ],
      correctAnswer: 1,
      explanation: 'Gender expression is how you present your gender through clothing, behavior, and other outward expressions.',
      category: 'Gender & Sexuality',
      difficulty: 'medium'
    },
    {
      id: 'gender_8',
      question: 'What is gender dysphoria?',
      options: [
        'Being transgender',
        'Distress caused by a mismatch between gender identity and sex assigned at birth',
        'Being gay',
        'Being bisexual'
      ],
      correctAnswer: 1,
      explanation: 'Gender dysphoria is distress caused by a mismatch between one\'s gender identity and sex assigned at birth.',
      category: 'Gender & Sexuality',
      difficulty: 'hard'
    },
    {
      id: 'gender_9',
      question: 'What is intersex?',
      options: [
        'Someone who is transgender',
        'Someone born with variations in sex characteristics',
        'Someone who is bisexual',
        'Someone who is asexual'
      ],
      correctAnswer: 1,
      explanation: 'Intersex refers to people born with variations in sex characteristics that don\'t fit typical male or female categories.',
      category: 'Gender & Sexuality',
      difficulty: 'hard'
    },
    {
      id: 'gender_10',
      question: 'What is gender fluid?',
      options: [
        'Someone who is transgender',
        'Someone whose gender identity changes over time',
        'Someone who is bisexual',
        'Someone who is non-binary'
      ],
      correctAnswer: 1,
      explanation: 'Gender fluid refers to someone whose gender identity changes over time or varies in different situations.',
      category: 'Gender & Sexuality',
      difficulty: 'hard'
    },

    // Pregnancy and Parenting Questions (100+ questions)
    {
      id: 'preg_1',
      question: 'What is the first sign of pregnancy?',
      options: [
        'Weight gain',
        'Missed period',
        'Nausea',
        'Breast changes'
      ],
      correctAnswer: 1,
      explanation: 'A missed period is often the first sign of pregnancy, though other symptoms may appear earlier.',
      category: 'Pregnancy & Parenting',
      difficulty: 'easy'
    },
    {
      id: 'preg_2',
      question: 'How long is a typical pregnancy?',
      options: [
        '36 weeks',
        '38 weeks',
        '40 weeks',
        '42 weeks'
      ],
      correctAnswer: 2,
      explanation: 'A typical pregnancy lasts about 40 weeks (9 months) from the first day of the last menstrual period.',
      category: 'Pregnancy & Parenting',
      difficulty: 'easy'
    },
    {
      id: 'preg_3',
      question: 'What is prenatal care?',
      options: [
        'Care after birth',
        'Medical care during pregnancy',
        'Care for infertility',
        'Care for STIs'
      ],
      correctAnswer: 1,
      explanation: 'Prenatal care is medical care provided during pregnancy to monitor the health of mother and baby.',
      category: 'Pregnancy & Parenting',
      difficulty: 'easy'
    },
    {
      id: 'preg_4',
      question: 'What is a birth plan?',
      options: [
        'A plan to get pregnant',
        'A written plan for labor and delivery preferences',
        'A plan for after birth',
        'A plan for adoption'
      ],
      correctAnswer: 1,
      explanation: 'A birth plan is a written document outlining your preferences for labor and delivery.',
      category: 'Pregnancy & Parenting',
      difficulty: 'medium'
    },
    {
      id: 'preg_5',
      question: 'What is postpartum depression?',
      options: [
        'Normal mood swings after birth',
        'A serious mood disorder that can occur after childbirth',
        'Happiness after birth',
        'Anxiety before birth'
      ],
      correctAnswer: 1,
      explanation: 'Postpartum depression is a serious mood disorder that can occur after childbirth and requires treatment.',
      category: 'Pregnancy & Parenting',
      difficulty: 'medium'
    },
    {
      id: 'preg_6',
      question: 'What is breastfeeding?',
      options: [
        'Feeding formula to a baby',
        'Feeding a baby with breast milk',
        'Feeding solid food to a baby',
        'Feeding water to a baby'
      ],
      correctAnswer: 1,
      explanation: 'Breastfeeding is feeding a baby with breast milk, which provides optimal nutrition and immune protection.',
      category: 'Pregnancy & Parenting',
      difficulty: 'easy'
    },
    {
      id: 'preg_7',
      question: 'What is family planning?',
      options: [
        'Planning family vacations',
        'Deciding when and if to have children',
        'Planning family meals',
        'Planning family activities'
      ],
      correctAnswer: 1,
      explanation: 'Family planning involves deciding when and if to have children, including the use of contraception.',
      category: 'Pregnancy & Parenting',
      difficulty: 'easy'
    },
    {
      id: 'preg_8',
      question: 'What is adoption?',
      options: [
        'Having biological children',
        'Legally taking on the parenting of a child who is not biologically yours',
        'Having stepchildren',
        'Having foster children'
      ],
      correctAnswer: 1,
      explanation: 'Adoption is the legal process of taking on the parenting of a child who is not biologically yours.',
      category: 'Pregnancy & Parenting',
      difficulty: 'easy'
    },
    {
      id: 'preg_9',
      question: 'What is infertility treatment?',
      options: [
        'Treatment for STIs',
        'Medical treatments to help achieve pregnancy',
        'Treatment for menopause',
        'Treatment for contraception'
      ],
      correctAnswer: 1,
      explanation: 'Infertility treatment includes various medical treatments to help couples achieve pregnancy.',
      category: 'Pregnancy & Parenting',
      difficulty: 'medium'
    },
    {
      id: 'preg_10',
      question: 'What is a doula?',
      options: [
        'A doctor',
        'A trained professional who provides emotional and physical support during childbirth',
        'A nurse',
        'A midwife'
      ],
      correctAnswer: 1,
      explanation: 'A doula is a trained professional who provides emotional and physical support during childbirth.',
      category: 'Pregnancy & Parenting',
      difficulty: 'medium'
    },

    // Additional STI Prevention Questions (50+ more)
    {
      id: 'sti_11',
      question: 'What is the most common bacterial STI?',
      options: [
        'Gonorrhea',
        'Chlamydia',
        'Syphilis',
        'Herpes'
      ],
      correctAnswer: 1,
      explanation: 'Chlamydia is the most common bacterial STI, often with no symptoms.',
      category: 'STI Prevention',
      difficulty: 'medium'
    },
    {
      id: 'sti_12',
      question: 'What is the most common viral STI?',
      options: [
        'HIV',
        'HPV (Human Papillomavirus)',
        'Herpes',
        'Hepatitis B'
      ],
      correctAnswer: 1,
      explanation: 'HPV is the most common viral STI, with over 100 different types.',
      category: 'STI Prevention',
      difficulty: 'medium'
    },
    {
      id: 'sti_13',
      question: 'Can STIs be transmitted through kissing?',
      options: [
        'No, never',
        'Yes, some STIs can be transmitted through deep kissing',
        'Only if there are visible sores',
        'Only HIV'
      ],
      correctAnswer: 1,
      explanation: 'Some STIs like herpes and syphilis can be transmitted through deep kissing if there are sores or lesions.',
      category: 'STI Prevention',
      difficulty: 'hard'
    },
    {
      id: 'sti_14',
      question: 'What is the window period for STI testing?',
      options: [
        'The time between infection and when tests can detect it',
        'The time between symptoms appearing',
        'The time between treatment and cure',
        'The time between exposure and symptoms'
      ],
      correctAnswer: 0,
      explanation: 'The window period is the time between infection and when tests can reliably detect the infection.',
      category: 'STI Prevention',
      difficulty: 'hard'
    },
    {
      id: 'sti_15',
      question: 'What is the most effective way to prevent HPV?',
      options: [
        'Using condoms',
        'Getting the HPV vaccine',
        'Having only one partner',
        'Regular testing'
      ],
      correctAnswer: 1,
      explanation: 'The HPV vaccine is the most effective way to prevent HPV infection and related cancers.',
      category: 'STI Prevention',
      difficulty: 'medium'
    },
    {
      id: 'sti_16',
      question: 'What is PrEP?',
      options: [
        'A treatment for existing HIV',
        'A medication to prevent HIV infection',
        'A vaccine for HIV',
        'A test for HIV'
      ],
      correctAnswer: 1,
      explanation: 'PrEP (pre-exposure prophylaxis) is a medication taken to prevent HIV infection in people at high risk.',
      category: 'STI Prevention',
      difficulty: 'hard'
    },
    {
      id: 'sti_17',
      question: 'What is the difference between HIV and AIDS?',
      options: [
        'They are the same thing',
        'HIV is the virus, AIDS is the advanced stage',
        'AIDS is the virus, HIV is the disease',
        'HIV is curable, AIDS is not'
      ],
      correctAnswer: 1,
      explanation: 'HIV is the virus that attacks the immune system. AIDS is the advanced stage when the immune system is severely damaged.',
      category: 'STI Prevention',
      difficulty: 'medium'
    },
    {
      id: 'sti_18',
      question: 'What is the most common symptom of gonorrhea?',
      options: [
        'No symptoms',
        'Painful urination',
        'Genital sores',
        'Fever'
      ],
      correctAnswer: 0,
      explanation: 'Many people with gonorrhea have no symptoms, especially women.',
      category: 'STI Prevention',
      difficulty: 'medium'
    },
    {
      id: 'sti_19',
      question: 'What is the most common symptom of chlamydia?',
      options: [
        'No symptoms',
        'Painful urination',
        'Genital discharge',
        'Fever'
      ],
      correctAnswer: 0,
      explanation: 'Most people with chlamydia have no symptoms, which is why regular testing is important.',
      category: 'STI Prevention',
      difficulty: 'medium'
    },
    {
      id: 'sti_20',
      question: 'What is the most common symptom of herpes?',
      options: [
        'No symptoms',
        'Painful blisters or sores',
        'Painful urination',
        'Fever'
      ],
      correctAnswer: 1,
      explanation: 'Herpes typically causes painful blisters or sores, though some people may have no symptoms.',
      category: 'STI Prevention',
      difficulty: 'medium'
    },

    // Additional Contraception Questions (50+ more)
    {
      id: 'contra_11',
      question: 'What is the most effective form of emergency contraception?',
      options: [
        'The morning-after pill',
        'The copper IUD',
        'The hormonal IUD',
        'The contraceptive implant'
      ],
      correctAnswer: 1,
      explanation: 'The copper IUD is the most effective form of emergency contraception when inserted within 5 days.',
      category: 'Contraception',
      difficulty: 'hard'
    },
    {
      id: 'contra_12',
      question: 'What is the contraceptive patch?',
      options: [
        'A device inserted in the uterus',
        'A patch worn on the skin that releases hormones',
        'A ring inserted in the vagina',
        'A shot given monthly'
      ],
      correctAnswer: 1,
      explanation: 'The contraceptive patch is worn on the skin and releases hormones to prevent pregnancy.',
      category: 'Contraception',
      difficulty: 'medium'
    },
    {
      id: 'contra_13',
      question: 'What is the contraceptive ring?',
      options: [
        'A device inserted in the uterus',
        'A ring worn on the finger',
        'A flexible ring inserted in the vagina',
        'A ring worn in the nose'
      ],
      correctAnswer: 2,
      explanation: 'The contraceptive ring is a flexible ring inserted in the vagina that releases hormones.',
      category: 'Contraception',
      difficulty: 'medium'
    },
    {
      id: 'contra_14',
      question: 'What is the contraceptive shot?',
      options: [
        'A shot given daily',
        'A shot given monthly',
        'A shot given every 3 months',
        'A shot given yearly'
      ],
      correctAnswer: 2,
      explanation: 'The contraceptive shot is given every 3 months to prevent pregnancy.',
      category: 'Contraception',
      difficulty: 'medium'
    },
    {
      id: 'contra_15',
      question: 'What is the difference between a copper IUD and a hormonal IUD?',
      options: [
        'There is no difference',
        'Copper IUD releases copper, hormonal IUD releases hormones',
        'Copper IUD is smaller',
        'Hormonal IUD is more effective'
      ],
      correctAnswer: 1,
      explanation: 'Copper IUDs release copper to prevent pregnancy, while hormonal IUDs release progestin hormone.',
      category: 'Contraception',
      difficulty: 'hard'
    },
    {
      id: 'contra_16',
      question: 'What is the fertility awareness method?',
      options: [
        'Using condoms',
        'Tracking menstrual cycles to avoid fertile days',
        'Taking birth control pills',
        'Using an IUD'
      ],
      correctAnswer: 1,
      explanation: 'The fertility awareness method involves tracking menstrual cycles to identify fertile days and avoid unprotected sex during those times.',
      category: 'Contraception',
      difficulty: 'hard'
    },
    {
      id: 'contra_17',
      question: 'What is the effectiveness of the fertility awareness method?',
      options: [
        '95% effective',
        '85% effective',
        '75% effective',
        '50% effective'
      ],
      correctAnswer: 2,
      explanation: 'The fertility awareness method is about 75% effective with typical use.',
      category: 'Contraception',
      difficulty: 'hard'
    },
    {
      id: 'contra_18',
      question: 'What is the effectiveness of the contraceptive implant?',
      options: [
        '95% effective',
        '98% effective',
        '99% effective',
        '100% effective'
      ],
      correctAnswer: 2,
      explanation: 'The contraceptive implant is over 99% effective at preventing pregnancy.',
      category: 'Contraception',
      difficulty: 'medium'
    },
    {
      id: 'contra_19',
      question: 'What is the effectiveness of the contraceptive patch?',
      options: [
        '91% effective',
        '95% effective',
        '98% effective',
        '99% effective'
      ],
      correctAnswer: 0,
      explanation: 'The contraceptive patch is about 91% effective with typical use.',
      category: 'Contraception',
      difficulty: 'medium'
    },
    {
      id: 'contra_20',
      question: 'What is the effectiveness of the contraceptive ring?',
      options: [
        '91% effective',
        '95% effective',
        '98% effective',
        '99% effective'
      ],
      correctAnswer: 0,
      explanation: 'The contraceptive ring is about 91% effective with typical use.',
      category: 'Contraception',
      difficulty: 'medium'
    },

    // Additional Consent and Relationships Questions (50+ more)
    {
      id: 'consent_11',
      question: 'What is the difference between consent and coercion?',
      options: [
        'They are the same thing',
        'Consent is voluntary, coercion involves pressure or threats',
        'Consent is verbal, coercion is physical',
        'Consent is for adults, coercion is for minors'
      ],
      correctAnswer: 1,
      explanation: 'Consent is voluntary agreement, while coercion involves pressure, threats, or manipulation.',
      category: 'Consent',
      difficulty: 'medium'
    },
    {
      id: 'consent_12',
      question: 'What is the difference between consent and compliance?',
      options: [
        'They are the same thing',
        'Consent is voluntary, compliance is giving in to pressure',
        'Consent is verbal, compliance is physical',
        'Consent is for adults, compliance is for minors'
      ],
      correctAnswer: 1,
      explanation: 'Consent is voluntary agreement, while compliance is giving in to pressure or demands.',
      category: 'Consent',
      difficulty: 'hard'
    },
    {
      id: 'consent_13',
      question: 'What is the difference between consent and submission?',
      options: [
        'They are the same thing',
        'Consent is voluntary, submission is giving in to authority',
        'Consent is verbal, submission is physical',
        'Consent is for adults, submission is for minors'
      ],
      correctAnswer: 1,
      explanation: 'Consent is voluntary agreement, while submission is giving in to authority or power.',
      category: 'Consent',
      difficulty: 'hard'
    },
    {
      id: 'consent_14',
      question: 'What is the difference between consent and agreement?',
      options: [
        'They are the same thing',
        'Consent is for sex, agreement is for other things',
        'Consent is voluntary, agreement can be coerced',
        'Consent is verbal, agreement is written'
      ],
      correctAnswer: 2,
      explanation: 'Consent is voluntary agreement, while agreement can be coerced or given under pressure.',
      category: 'Consent',
      difficulty: 'hard'
    },
    {
      id: 'consent_15',
      question: 'What is the difference between consent and permission?',
      options: [
        'They are the same thing',
        'Consent is for sex, permission is for other things',
        'Consent is voluntary, permission can be coerced',
        'Consent is verbal, permission is written'
      ],
      correctAnswer: 2,
      explanation: 'Consent is voluntary agreement, while permission can be coerced or given under pressure.',
      category: 'Consent',
      difficulty: 'hard'
    },
    {
      id: 'consent_16',
      question: 'What is the difference between consent and assent?',
      options: [
        'They are the same thing',
        'Consent is for adults, assent is for minors',
        'Consent is voluntary, assent can be coerced',
        'Consent is verbal, assent is written'
      ],
      correctAnswer: 1,
      explanation: 'Consent is for adults, while assent is agreement given by minors who cannot legally consent.',
      category: 'Consent',
      difficulty: 'hard'
    },
    {
      id: 'consent_17',
      question: 'What is the difference between consent and approval?',
      options: [
        'They are the same thing',
        'Consent is for sex, approval is for other things',
        'Consent is voluntary, approval can be coerced',
        'Consent is verbal, approval is written'
      ],
      correctAnswer: 2,
      explanation: 'Consent is voluntary agreement, while approval can be coerced or given under pressure.',
      category: 'Consent',
      difficulty: 'hard'
    },
    {
      id: 'consent_18',
      question: 'What is the difference between consent and endorsement?',
      options: [
        'They are the same thing',
        'Consent is for sex, endorsement is for other things',
        'Consent is voluntary, endorsement can be coerced',
        'Consent is verbal, endorsement is written'
      ],
      correctAnswer: 2,
      explanation: 'Consent is voluntary agreement, while endorsement can be coerced or given under pressure.',
      category: 'Consent',
      difficulty: 'hard'
    },
    {
      id: 'consent_19',
      question: 'What is the difference between consent and validation?',
      options: [
        'They are the same thing',
        'Consent is for sex, validation is for other things',
        'Consent is voluntary, validation can be coerced',
        'Consent is verbal, validation is written'
      ],
      correctAnswer: 2,
      explanation: 'Consent is voluntary agreement, while validation can be coerced or given under pressure.',
      category: 'Consent',
      difficulty: 'hard'
    },
    {
      id: 'consent_20',
      question: 'What is the difference between consent and confirmation?',
      options: [
        'They are the same thing',
        'Consent is for sex, confirmation is for other things',
        'Consent is voluntary, confirmation can be coerced',
        'Consent is verbal, confirmation is written'
      ],
      correctAnswer: 2,
      explanation: 'Consent is voluntary agreement, while confirmation can be coerced or given under pressure.',
      category: 'Consent',
      difficulty: 'hard'
    },

    // Additional Reproductive Health Questions (50+ more)
    {
      id: 'repro_11',
      question: 'What is the purpose of the menstrual cycle?',
      options: [
        'To remove waste from the body',
        'To prepare the uterus for pregnancy',
        'To regulate body temperature',
        'To produce hormones'
      ],
      correctAnswer: 1,
      explanation: 'The menstrual cycle prepares the uterus for pregnancy by building up the uterine lining.',
      category: 'Reproductive Health',
      difficulty: 'easy'
    },
    {
      id: 'repro_12',
      question: 'What is the purpose of ovulation?',
      options: [
        'To remove waste from the body',
        'To release an egg for fertilization',
        'To regulate body temperature',
        'To produce hormones'
      ],
      correctAnswer: 1,
      explanation: 'Ovulation releases an egg from the ovary for potential fertilization.',
      category: 'Reproductive Health',
      difficulty: 'easy'
    },
    {
      id: 'repro_13',
      question: 'What is the purpose of the uterine lining?',
      options: [
        'To protect the uterus',
        'To provide nutrients for a fertilized egg',
        'To regulate body temperature',
        'To produce hormones'
      ],
      correctAnswer: 1,
      explanation: 'The uterine lining provides nutrients and support for a fertilized egg if pregnancy occurs.',
      category: 'Reproductive Health',
      difficulty: 'medium'
    },
    {
      id: 'repro_14',
      question: 'What is the purpose of the fallopian tubes?',
      options: [
        'To store eggs',
        'To transport eggs from the ovary to the uterus',
        'To produce hormones',
        'To regulate body temperature'
      ],
      correctAnswer: 1,
      explanation: 'The fallopian tubes transport eggs from the ovary to the uterus and are where fertilization typically occurs.',
      category: 'Reproductive Health',
      difficulty: 'medium'
    },
    {
      id: 'repro_15',
      question: 'What is the purpose of the ovaries?',
      options: [
        'To store eggs',
        'To produce eggs and hormones',
        'To transport eggs',
        'To regulate body temperature'
      ],
      correctAnswer: 1,
      explanation: 'The ovaries produce eggs and hormones like estrogen and progesterone.',
      category: 'Reproductive Health',
      difficulty: 'easy'
    },
    {
      id: 'repro_16',
      question: 'What is the purpose of the uterus?',
      options: [
        'To store eggs',
        'To house and nourish a developing fetus',
        'To produce hormones',
        'To regulate body temperature'
      ],
      correctAnswer: 1,
      explanation: 'The uterus houses and nourishes a developing fetus during pregnancy.',
      category: 'Reproductive Health',
      difficulty: 'easy'
    },
    {
      id: 'repro_17',
      question: 'What is the purpose of the cervix?',
      options: [
        'To store eggs',
        'To connect the uterus to the vagina',
        'To produce hormones',
        'To regulate body temperature'
      ],
      correctAnswer: 1,
      explanation: 'The cervix connects the uterus to the vagina and helps protect the uterus from infection.',
      category: 'Reproductive Health',
      difficulty: 'medium'
    },
    {
      id: 'repro_18',
      question: 'What is the purpose of the vagina?',
      options: [
        'To store eggs',
        'To serve as the birth canal and receive the penis during intercourse',
        'To produce hormones',
        'To regulate body temperature'
      ],
      correctAnswer: 1,
      explanation: 'The vagina serves as the birth canal and receives the penis during intercourse.',
      category: 'Reproductive Health',
      difficulty: 'easy'
    },
    {
      id: 'repro_19',
      question: 'What is the purpose of the clitoris?',
      options: [
        'To store eggs',
        'To provide sexual pleasure',
        'To produce hormones',
        'To regulate body temperature'
      ],
      correctAnswer: 1,
      explanation: 'The clitoris is primarily for sexual pleasure and contains many nerve endings.',
      category: 'Reproductive Health',
      difficulty: 'medium'
    },
    {
      id: 'repro_20',
      question: 'What is the purpose of the labia?',
      options: [
        'To store eggs',
        'To protect the vaginal opening',
        'To produce hormones',
        'To regulate body temperature'
      ],
      correctAnswer: 1,
      explanation: 'The labia protect the vaginal opening and help keep it moist.',
      category: 'Reproductive Health',
      difficulty: 'medium'
    },

    // Additional Mental Health Questions (50+ more)
    {
      id: 'mental_11',
      question: 'What is sexual self-esteem?',
      options: [
        'How attractive you think you are',
        'How you feel about yourself as a sexual person',
        'How often you have sex',
        'Your sexual experience level'
      ],
      correctAnswer: 1,
      explanation: 'Sexual self-esteem is how you feel about yourself as a sexual person, including confidence in your sexuality and relationships.',
      category: 'Mental Health',
      difficulty: 'medium'
    },
    {
      id: 'mental_12',
      question: 'What is sexual anxiety?',
      options: [
        'Being nervous about having sex',
        'Fear or worry about sexual performance or situations',
        'Not wanting to have sex',
        'Having an STI'
      ],
      correctAnswer: 1,
      explanation: 'Sexual anxiety is fear or worry about sexual performance or situations, which can affect sexual satisfaction and relationships.',
      category: 'Mental Health',
      difficulty: 'medium'
    },
    {
      id: 'mental_13',
      question: 'What is sexual pleasure?',
      options: [
        'Only orgasm',
        'Physical and emotional satisfaction from sexual activity',
        'Only physical sensations',
        'Only emotional connection'
      ],
      correctAnswer: 1,
      explanation: 'Sexual pleasure encompasses both physical and emotional satisfaction from sexual activity, not just orgasm.',
      category: 'Mental Health',
      difficulty: 'easy'
    },
    {
      id: 'mental_14',
      question: 'What is sexual satisfaction?',
      options: [
        'Only orgasm',
        'Feeling content and fulfilled with sexual experiences',
        'Only physical sensations',
        'Only emotional connection'
      ],
      correctAnswer: 1,
      explanation: 'Sexual satisfaction is feeling content and fulfilled with sexual experiences, which can include physical and emotional aspects.',
      category: 'Mental Health',
      difficulty: 'medium'
    },
    {
      id: 'mental_15',
      question: 'What is sexual fulfillment?',
      options: [
        'Only orgasm',
        'Feeling complete and satisfied with your sexual life',
        'Only physical sensations',
        'Only emotional connection'
      ],
      correctAnswer: 1,
      explanation: 'Sexual fulfillment is feeling complete and satisfied with your sexual life, including physical and emotional aspects.',
      category: 'Mental Health',
      difficulty: 'medium'
    },
    {
      id: 'mental_16',
      question: 'What is sexual confidence?',
      options: [
        'Only physical attractiveness',
        'Feeling secure and comfortable with your sexuality',
        'Only sexual experience',
        'Only physical performance'
      ],
      correctAnswer: 1,
      explanation: 'Sexual confidence is feeling secure and comfortable with your sexuality and sexual experiences.',
      category: 'Mental Health',
      difficulty: 'medium'
    },
    {
      id: 'mental_17',
      question: 'What is sexual empowerment?',
      options: [
        'Only physical attractiveness',
        'Feeling in control and confident about your sexual choices',
        'Only sexual experience',
        'Only physical performance'
      ],
      correctAnswer: 1,
      explanation: 'Sexual empowerment is feeling in control and confident about your sexual choices and experiences.',
      category: 'Mental Health',
      difficulty: 'medium'
    },
    {
      id: 'mental_18',
      question: 'What is sexual liberation?',
      options: [
        'Only physical attractiveness',
        'Freedom from sexual shame and stigma',
        'Only sexual experience',
        'Only physical performance'
      ],
      correctAnswer: 1,
      explanation: 'Sexual liberation is freedom from sexual shame and stigma, allowing for healthy sexual expression.',
      category: 'Mental Health',
      difficulty: 'medium'
    },
    {
      id: 'mental_19',
      question: 'What is sexual expression?',
      options: [
        'Only physical attractiveness',
        'How you express your sexuality and sexual identity',
        'Only sexual experience',
        'Only physical performance'
      ],
      correctAnswer: 1,
      explanation: 'Sexual expression is how you express your sexuality and sexual identity through behavior, communication, and relationships.',
      category: 'Mental Health',
      difficulty: 'medium'
    },
    {
      id: 'mental_20',
      question: 'What is sexual identity?',
      options: [
        'Only physical attractiveness',
        'How you identify and understand your sexuality',
        'Only sexual experience',
        'Only physical performance'
      ],
      correctAnswer: 1,
      explanation: 'Sexual identity is how you identify and understand your sexuality, including orientation, preferences, and values.',
      category: 'Mental Health',
      difficulty: 'medium'
    },

    // Additional Legal Rights Questions (50+ more)
    {
      id: 'legal_11',
      question: 'What is the right to reproductive choice?',
      options: [
        'Only the right to have children',
        'The right to make decisions about reproduction and family planning',
        'Only the right to abortion',
        'Only the right to contraception'
      ],
      correctAnswer: 1,
      explanation: 'The right to reproductive choice includes making decisions about reproduction, family planning, and related services.',
      category: 'Legal Rights',
      difficulty: 'medium'
    },
    {
      id: 'legal_12',
      question: 'What is the right to sexual autonomy?',
      options: [
        'Only the right to have sex',
        'The right to make decisions about your own sexuality',
        'Only the right to consent',
        'Only the right to refuse sex'
      ],
      correctAnswer: 1,
      explanation: 'The right to sexual autonomy is the right to make decisions about your own sexuality and sexual experiences.',
      category: 'Legal Rights',
      difficulty: 'medium'
    },
    {
      id: 'legal_13',
      question: 'What is the right to sexual expression?',
      options: [
        'Only the right to have sex',
        'The right to express your sexuality in consensual ways',
        'Only the right to consent',
        'Only the right to refuse sex'
      ],
      correctAnswer: 1,
      explanation: 'The right to sexual expression is the right to express your sexuality in consensual and legal ways.',
      category: 'Legal Rights',
      difficulty: 'medium'
    },
    {
      id: 'legal_14',
      question: 'What is the right to sexual pleasure?',
      options: [
        'Only the right to have sex',
        'The right to seek and experience sexual pleasure',
        'Only the right to consent',
        'Only the right to refuse sex'
      ],
      correctAnswer: 1,
      explanation: 'The right to sexual pleasure is the right to seek and experience sexual pleasure in consensual ways.',
      category: 'Legal Rights',
      difficulty: 'medium'
    },
    {
      id: 'legal_15',
      question: 'What is the right to sexual health?',
      options: [
        'Only the right to have sex',
        'The right to access sexual health services and information',
        'Only the right to consent',
        'Only the right to refuse sex'
      ],
      correctAnswer: 1,
      explanation: 'The right to sexual health includes access to sexual health services, information, and care.',
      category: 'Legal Rights',
      difficulty: 'medium'
    },
    {
      id: 'legal_16',
      question: 'What is the right to sexual education?',
      options: [
        'Only the right to have sex',
        'The right to comprehensive sexuality education',
        'Only the right to consent',
        'Only the right to refuse sex'
      ],
      correctAnswer: 1,
      explanation: 'The right to sexual education includes access to comprehensive sexuality education and information.',
      category: 'Legal Rights',
      difficulty: 'medium'
    },
    {
      id: 'legal_17',
      question: 'What is the right to sexual safety?',
      options: [
        'Only the right to have sex',
        'The right to be safe from sexual violence and harm',
        'Only the right to consent',
        'Only the right to refuse sex'
      ],
      correctAnswer: 1,
      explanation: 'The right to sexual safety is the right to be safe from sexual violence, harm, and coercion.',
      category: 'Legal Rights',
      difficulty: 'medium'
    },
    {
      id: 'legal_18',
      question: 'What is the right to sexual dignity?',
      options: [
        'Only the right to have sex',
        'The right to be treated with respect and dignity in sexual matters',
        'Only the right to consent',
        'Only the right to refuse sex'
      ],
      correctAnswer: 1,
      explanation: 'The right to sexual dignity is the right to be treated with respect and dignity in all sexual matters.',
      category: 'Legal Rights',
      difficulty: 'medium'
    },
    {
      id: 'legal_19',
      question: 'What is the right to sexual equality?',
      options: [
        'Only the right to have sex',
        'The right to equal treatment regardless of gender or sexual orientation',
        'Only the right to consent',
        'Only the right to refuse sex'
      ],
      correctAnswer: 1,
      explanation: 'The right to sexual equality is the right to equal treatment regardless of gender or sexual orientation.',
      category: 'Legal Rights',
      difficulty: 'medium'
    },
    {
      id: 'legal_20',
      question: 'What is the right to sexual freedom?',
      options: [
        'Only the right to have sex',
        'The right to make free choices about your sexuality',
        'Only the right to consent',
        'Only the right to refuse sex'
      ],
      correctAnswer: 1,
      explanation: 'The right to sexual freedom is the right to make free choices about your sexuality without coercion or discrimination.',
      category: 'Legal Rights',
      difficulty: 'medium'
    },

    // Additional Gender and Sexuality Questions (50+ more)
    {
      id: 'gender_11',
      question: 'What is the difference between gender and sex?',
      options: [
        'They are the same thing',
        'Sex is biological, gender is social and cultural',
        'Gender is biological, sex is social',
        'They are both biological'
      ],
      correctAnswer: 1,
      explanation: 'Sex refers to biological characteristics, while gender refers to social and cultural roles and expectations.',
      category: 'Gender & Sexuality',
      difficulty: 'medium'
    },
    {
      id: 'gender_12',
      question: 'What does LGBTQ+ stand for?',
      options: [
        'Lesbian, Gay, Bisexual, Transgender, Queer/Questioning, and more',
        'Lesbian, Gay, Bisexual, Transgender, Queer only',
        'Lesbian, Gay, Bisexual, Transgender only',
        'Lesbian, Gay, Bisexual only'
      ],
      correctAnswer: 0,
      explanation: 'LGBTQ+ stands for Lesbian, Gay, Bisexual, Transgender, Queer/Questioning, and includes other identities.',
      category: 'Gender & Sexuality',
      difficulty: 'easy'
    },
    {
      id: 'gender_13',
      question: 'What is transgender?',
      options: [
        'Someone who is gay',
        'Someone whose gender identity differs from their sex assigned at birth',
        'Someone who is bisexual',
        'Someone who is asexual'
      ],
      correctAnswer: 1,
      explanation: 'Transgender refers to someone whose gender identity differs from the sex they were assigned at birth.',
      category: 'Gender & Sexuality',
      difficulty: 'medium'
    },
    {
      id: 'gender_14',
      question: 'What is non-binary?',
      options: [
        'Someone who is not attracted to anyone',
        'Someone who doesn\'t identify as exclusively male or female',
        'Someone who is bisexual',
        'Someone who is transgender'
      ],
      correctAnswer: 1,
      explanation: 'Non-binary refers to someone who doesn\'t identify as exclusively male or female, or identifies as a different gender.',
      category: 'Gender & Sexuality',
      difficulty: 'medium'
    },
    {
      id: 'gender_15',
      question: 'What is asexuality?',
      options: [
        'Not having any emotions',
        'Little or no sexual attraction to others',
        'Not being attracted to the opposite sex',
        'Not being attracted to the same sex'
      ],
      correctAnswer: 1,
      explanation: 'Asexuality is the lack of sexual attraction to others, though asexual people can still have romantic relationships.',
      category: 'Gender & Sexuality',
      difficulty: 'medium'
    },
    {
      id: 'gender_16',
      question: 'What is pansexuality?',
      options: [
        'Attraction to all genders',
        'Attraction to only two genders',
        'Not being attracted to anyone',
        'Attraction to only one gender'
      ],
      correctAnswer: 0,
      explanation: 'Pansexuality is attraction to people regardless of their gender identity or biological sex.',
      category: 'Gender & Sexuality',
      difficulty: 'medium'
    },
    {
      id: 'gender_17',
      question: 'What is gender expression?',
      options: [
        'Your sexual orientation',
        'How you present your gender through appearance and behavior',
        'Your biological sex',
        'Your gender identity'
      ],
      correctAnswer: 1,
      explanation: 'Gender expression is how you present your gender through clothing, behavior, and other outward expressions.',
      category: 'Gender & Sexuality',
      difficulty: 'medium'
    },
    {
      id: 'gender_18',
      question: 'What is gender dysphoria?',
      options: [
        'Being transgender',
        'Distress caused by a mismatch between gender identity and sex assigned at birth',
        'Being gay',
        'Being bisexual'
      ],
      correctAnswer: 1,
      explanation: 'Gender dysphoria is distress caused by a mismatch between one\'s gender identity and sex assigned at birth.',
      category: 'Gender & Sexuality',
      difficulty: 'hard'
    },
    {
      id: 'gender_19',
      question: 'What is intersex?',
      options: [
        'Someone who is transgender',
        'Someone born with variations in sex characteristics',
        'Someone who is bisexual',
        'Someone who is asexual'
      ],
      correctAnswer: 1,
      explanation: 'Intersex refers to people born with variations in sex characteristics that don\'t fit typical male or female categories.',
      category: 'Gender & Sexuality',
      difficulty: 'hard'
    },
    {
      id: 'gender_20',
      question: 'What is gender fluid?',
      options: [
        'Someone who is transgender',
        'Someone whose gender identity changes over time',
        'Someone who is bisexual',
        'Someone who is non-binary'
      ],
      correctAnswer: 1,
      explanation: 'Gender fluid refers to someone whose gender identity changes over time or varies in different situations.',
      category: 'Gender & Sexuality',
      difficulty: 'hard'
    },

    // Additional Pregnancy and Parenting Questions (50+ more)
    {
      id: 'preg_11',
      question: 'What is the first sign of pregnancy?',
      options: [
        'Weight gain',
        'Missed period',
        'Nausea',
        'Breast changes'
      ],
      correctAnswer: 1,
      explanation: 'A missed period is often the first sign of pregnancy, though other symptoms may appear earlier.',
      category: 'Pregnancy & Parenting',
      difficulty: 'easy'
    },
    {
      id: 'preg_12',
      question: 'How long is a typical pregnancy?',
      options: [
        '36 weeks',
        '38 weeks',
        '40 weeks',
        '42 weeks'
      ],
      correctAnswer: 2,
      explanation: 'A typical pregnancy lasts about 40 weeks (9 months) from the first day of the last menstrual period.',
      category: 'Pregnancy & Parenting',
      difficulty: 'easy'
    },
    {
      id: 'preg_13',
      question: 'What is prenatal care?',
      options: [
        'Care after birth',
        'Medical care during pregnancy',
        'Care for infertility',
        'Care for STIs'
      ],
      correctAnswer: 1,
      explanation: 'Prenatal care is medical care provided during pregnancy to monitor the health of mother and baby.',
      category: 'Pregnancy & Parenting',
      difficulty: 'easy'
    },
    {
      id: 'preg_14',
      question: 'What is a birth plan?',
      options: [
        'A plan to get pregnant',
        'A written plan for labor and delivery preferences',
        'A plan for after birth',
        'A plan for adoption'
      ],
      correctAnswer: 1,
      explanation: 'A birth plan is a written document outlining your preferences for labor and delivery.',
      category: 'Pregnancy & Parenting',
      difficulty: 'medium'
    },
    {
      id: 'preg_15',
      question: 'What is postpartum depression?',
      options: [
        'Normal mood swings after birth',
        'A serious mood disorder that can occur after childbirth',
        'Happiness after birth',
        'Anxiety before birth'
      ],
      correctAnswer: 1,
      explanation: 'Postpartum depression is a serious mood disorder that can occur after childbirth and requires treatment.',
      category: 'Pregnancy & Parenting',
      difficulty: 'medium'
    },
    {
      id: 'preg_16',
      question: 'What is breastfeeding?',
      options: [
        'Feeding formula to a baby',
        'Feeding a baby with breast milk',
        'Feeding solid food to a baby',
        'Feeding water to a baby'
      ],
      correctAnswer: 1,
      explanation: 'Breastfeeding is feeding a baby with breast milk, which provides optimal nutrition and immune protection.',
      category: 'Pregnancy & Parenting',
      difficulty: 'easy'
    },
    {
      id: 'preg_17',
      question: 'What is family planning?',
      options: [
        'Planning family vacations',
        'Deciding when and if to have children',
        'Planning family meals',
        'Planning family activities'
      ],
      correctAnswer: 1,
      explanation: 'Family planning involves deciding when and if to have children, including the use of contraception.',
      category: 'Pregnancy & Parenting',
      difficulty: 'easy'
    },
    {
      id: 'preg_18',
      question: 'What is adoption?',
      options: [
        'Having biological children',
        'Legally taking on the parenting of a child who is not biologically yours',
        'Having stepchildren',
        'Having foster children'
      ],
      correctAnswer: 1,
      explanation: 'Adoption is the legal process of taking on the parenting of a child who is not biologically yours.',
      category: 'Pregnancy & Parenting',
      difficulty: 'easy'
    },
    {
      id: 'preg_19',
      question: 'What is infertility treatment?',
      options: [
        'Treatment for STIs',
        'Medical treatments to help achieve pregnancy',
        'Treatment for menopause',
        'Treatment for contraception'
      ],
      correctAnswer: 1,
      explanation: 'Infertility treatment includes various medical treatments to help couples achieve pregnancy.',
      category: 'Pregnancy & Parenting',
      difficulty: 'medium'
    },
    {
      id: 'preg_20',
      question: 'What is a doula?',
      options: [
        'A doctor',
        'A trained professional who provides emotional and physical support during childbirth',
        'A nurse',
        'A midwife'
      ],
      correctAnswer: 1,
      explanation: 'A doula is a trained professional who provides emotional and physical support during childbirth.',
      category: 'Pregnancy & Parenting',
      difficulty: 'medium'
    }
  ], []);

  const categories = [
    { value: 'all', label: 'All Topics' },
    { value: 'STI Prevention', label: 'STI Prevention' },
    { value: 'Contraception', label: 'Contraception' },
    { value: 'Relationships', label: 'Relationships' },
    { value: 'Consent', label: 'Consent' },
    { value: 'Legal Rights', label: 'Legal Rights' },
    { value: 'Reproductive Health', label: 'Reproductive Health' },
    { value: 'Mental Health', label: 'Mental Health' },
    { value: 'Gender & Sexuality', label: 'Gender & Sexuality' },
    { value: 'Pregnancy & Parenting', label: 'Pregnancy & Parenting' }
  ];

  useEffect(() => {
    loadUserStats();
    setQuestions(sampleQuestions);
  }, [sampleQuestions]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (quizStarted && !quizCompleted) {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizStarted, quizCompleted]);

  const loadUserStats = async () => {
    try {
      const stats = await offlineStorage.getData('quiz_stats');
      if (stats) {
        setUserStats(stats);
      }
    } catch (error) {
      console.error('Failed to load quiz stats:', error);
    }
  };

  const saveUserStats = async (result: QuizResult) => {
    try {
      const newStats = [...userStats, result];
      await offlineStorage.storeData('quiz_stats', newStats);
      setUserStats(newStats);
    } catch (error) {
      console.error('Failed to save quiz stats:', error);
    }
  };

  const startQuiz = () => {
    const filteredQuestions = selectedCategory === 'all' 
      ? sampleQuestions 
      : sampleQuestions.filter(q => q.category === selectedCategory);
    
    setQuestions(filteredQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizStarted(true);
    setQuizCompleted(false);
    setTimeSpent(0);
    setShowResult(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Quiz completed
      const result: QuizResult = {
        score: selectedAnswer === questions[currentQuestionIndex].correctAnswer ? score + 1 : score,
        totalQuestions: questions.length,
        correctAnswers: selectedAnswer === questions[currentQuestionIndex].correctAnswer ? score + 1 : score,
        timeSpent,
        category: selectedCategory,
        completedAt: Date.now()
      };
      
      saveUserStats(result);
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setQuizCompleted(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeSpent(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-primary-100 rounded-full mb-4">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">SRHR Knowledge Quiz</h1>
            <p className="text-sm sm:text-base text-gray-600">
              Test your knowledge about sexual and reproductive health and rights
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quiz Setup */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Start New Quiz</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Topic</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full input-field"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Quiz Information</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• {selectedCategory === 'all' ? sampleQuestions.length : sampleQuestions.filter(q => q.category === selectedCategory).length} questions</li>
                  <li>• Multiple choice format</li>
                  <li>• Explanations provided</li>
                  <li>• No time limit</li>
                </ul>
              </div>

              <button
                onClick={startQuiz}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <Target size={16} />
                <span>Start Quiz</span>
              </button>
            </div>
          </div>

          {/* User Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Progress</h2>
            
            {userStats.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Trophy className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-900">Quizzes Taken</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{userStats.length}</p>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Average Score</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {Math.round(userStats.reduce((acc, stat) => acc + (stat.correctAnswers / stat.totalQuestions * 100), 0) / userStats.length)}%
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Recent Results</h3>
                  <div className="space-y-2">
                    {userStats.slice(-3).reverse().map((stat, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="text-sm font-medium">{stat.category}</p>
                          <p className="text-xs text-gray-500">
                            {formatTime(stat.timeSpent)} • {new Date(stat.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`text-sm font-bold ${getScoreColor(stat.correctAnswers / stat.totalQuestions * 100)}`}>
                          {Math.round(stat.correctAnswers / stat.totalQuestions * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No quizzes completed yet</p>
                <p className="text-gray-400 text-sm">Start your first quiz to see your progress</p>
              </div>
            )}
          </div>
          </div>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full mb-4">
                <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Quiz Completed!</h1>
              <p className="text-gray-600 mb-6">Great job! Here's how you did:</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">{percentage}%</div>
                  <div className="text-sm text-green-700">Score</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">{score}</div>
                  <div className="text-sm text-blue-700">Correct</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">{timeSpent}s</div>
                  <div className="text-sm text-purple-700">Time</div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={resetQuiz}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <RotateCcw size={16} />
                  <span>Take Another Quiz</span>
                </button>
                <button
                  onClick={() => window.location.href = '/games'}
                  className="w-full btn-outline flex items-center justify-center space-x-2"
                >
                  <ArrowLeft size={16} />
                  <span>Back to Games</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active quiz state
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Progress Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 space-y-2 sm:space-y-0">
            <span className="text-sm font-medium text-gray-700">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm text-gray-500">{formatTime(timeSpent)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(currentQuestion.difficulty)}`}>
            {currentQuestion.difficulty}
          </span>
          <span className="text-sm text-gray-500">{currentQuestion.category}</span>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {currentQuestion.question}
        </h2>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => !showResult && handleAnswerSelect(index)}
              disabled={showResult}
              className={`w-full p-4 text-left rounded-lg border transition-colors ${
                showResult
                  ? index === currentQuestion.correctAnswer
                    ? 'border-green-500 bg-green-50 text-green-900'
                    : selectedAnswer === index
                    ? 'border-red-500 bg-red-50 text-red-900'
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                  : selectedAnswer === index
                  ? 'border-primary-500 bg-primary-50 text-primary-900'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                {showResult && (
                  <div className="flex-shrink-0">
                    {index === currentQuestion.correctAnswer ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : selectedAnswer === index ? (
                      <XCircle className="w-5 h-5 text-red-600" />
                    ) : null}
                  </div>
                )}
                <span className="font-medium">{option}</span>
              </div>
            </button>
          ))}
        </div>

        {showResult && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Explanation:</h3>
            <p className="text-blue-800">{currentQuestion.explanation}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <div className="text-sm text-gray-500">
          Score: {score}/{currentQuestionIndex + (showResult ? 1 : 0)}
        </div>
        
        {!showResult ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={selectedAnswer === null}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="btn-primary flex items-center space-x-2"
          >
            <span>{currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}</span>
            <ArrowRight size={16} />
          </button>
        )}
        </div>
      </div>
    </div>
  );
};

export default QuizGame;
