# SafeLink SRHR - Accessibility Features

## Overview

SafeLink SRHR has been enhanced with comprehensive accessibility features to serve two critical user groups:
1. **Rural communities with basic phones**
2. **People with disabilities**

## 🎯 Target Users

### Rural Communities with Basic Phones
- Users with feature phones (no smartphone)
- Limited internet connectivity
- Need for offline functionality
- Familiar with SMS and USSD interfaces

### People with Disabilities
- Visual impairments (blind, low vision, color blind)
- Motor disabilities (limited dexterity, paralysis)
- Hearing impairments (deaf, hard of hearing)
- Cognitive disabilities (learning difficulties, memory issues)

## 🚀 Features Implemented

### 1. Visual Accessibility

#### Font Size Controls
- **Normal**: 16px (default)
- **Large**: 20px
- **Extra Large**: 24px
- **Huge**: 32px

#### High Contrast Mode
- Black background with white text
- Yellow accent colors
- High contrast borders and buttons
- Improved visibility for low vision users

#### Color Blind Support
- **Protanopia**: Red-blind filter
- **Deuteranopia**: Green-blind filter
- **Tritanopia**: Blue-blind filter
- Pattern and shape alternatives to color coding

#### Reduced Motion
- Respects `prefers-reduced-motion` system setting
- Minimizes animations and transitions
- Reduces motion sickness and distraction

### 2. Motor Accessibility

#### Keyboard Navigation
- Full Tab navigation support
- Keyboard shortcuts for all functions
- Focus indicators and visual feedback
- Skip links for efficient navigation

#### Voice Commands
- 27+ voice commands available
- Natural language processing
- Commands for navigation, quiz interaction, and settings
- Real-time speech recognition

#### Large Touch Targets
- Minimum 44px touch areas
- Increased padding and spacing
- Easy-to-tap buttons and links
- Mobile-optimized interface

### 3. Cognitive Accessibility

#### Simple Language Mode
- Plain, clear instructions
- Simplified vocabulary
- Consistent terminology
- Easy-to-understand explanations

#### Progress Indicators
- Always visible progress bars
- Clear completion status
- Step-by-step guidance
- Visual feedback for actions

#### Confirmation Dialogs
- Important action confirmations
- Clear yes/no options
- Prevents accidental actions
- User-friendly error messages

### 4. Hearing Accessibility

#### Visual Alerts
- Flash notifications for audio cues
- Visual feedback for all sounds
- Text alternatives for audio content
- Caption support for videos

#### Caption Support
- All videos include captions
- Text alternatives for audio
- Visual indicators for sound events
- Sign language support (planned)

### 5. Rural & Basic Phone Features

#### SMS Services
- Complete SMS-based quiz system
- Health tips via SMS
- Clinic location services
- Emergency alerts
- Multi-language support (English, Bassa, Kpelle, Kru, Vai)

#### USSD Menu System
- *123# style navigation
- Menu-based interface
- Familiar to basic phone users
- Offline functionality

#### Offline Mode
- Full functionality without internet
- Downloaded content access
- Local data storage
- Sync when online

#### Low Bandwidth Mode
- Minimal data usage
- Text-only content
- Compressed images
- Progressive loading

## 🛠️ Technical Implementation

### Core Components

1. **AccessibilityContext** - Centralized settings management
2. **AccessibilityPanel** - Comprehensive settings UI
3. **AccessibilityButton** - Always-visible settings access
4. **AccessibilityDashboard** - Monitoring and management

### Services

1. **SMS Service** - SMS-based interactions
2. **USSD Service** - Menu-based navigation
3. **Voice Command Service** - Speech recognition
4. **Keyboard Navigation Service** - Keyboard support
5. **Offline Accessibility Service** - Enhanced offline capabilities

### CSS Framework

- **accessibility.css** - Comprehensive accessibility styles
- High contrast themes
- Font size adjustments
- Reduced motion support
- Color blind filters
- Large touch targets

## 📱 Usage Instructions

### For Users with Disabilities

#### Visual Impairments
1. Click the accessibility button (bottom-right)
2. Go to "Visual" tab
3. Adjust font size, enable high contrast
4. Use screen reader with keyboard navigation

#### Motor Disabilities
1. Enable keyboard navigation in settings
2. Use Tab key to navigate
3. Enable voice commands for hands-free operation
4. Use large touch targets on mobile

#### Hearing Impairments
1. Enable visual alerts in settings
2. Use caption support for videos
3. All audio content has text alternatives

### For Rural Communities

#### SMS Mode
1. Register phone number in SMS interface
2. Send commands like "QUIZ", "HELP", "CLINIC"
3. Receive health information via SMS
4. Take quizzes through text messages

#### USSD Mode
1. Access USSD interface
2. Navigate using number keys
3. Use familiar menu system
4. Access all features offline

#### Offline Mode
1. Download content when online
2. Access full functionality offline
3. Sync progress when reconnected
4. Low bandwidth optimizations

## 🎮 Voice Commands

### Navigation Commands
- "Go home" - Navigate to home page
- "Go to quiz" - Navigate to quiz page
- "Go to clinics" - Navigate to clinics page
- "Go to emergency" - Navigate to emergency page
- "Go back" - Go back to previous page

### Quiz Commands
- "Start quiz" - Start a new quiz
- "Select option a" - Select option A
- "Select option b" - Select option B
- "Select option c" - Select option C
- "Select option d" - Select option D
- "Submit answer" - Submit current answer
- "Next question" - Go to next question
- "Read question" - Read question aloud
- "Read explanation" - Read explanation aloud

### General Commands
- "Help" - Show help information
- "Accessibility settings" - Open accessibility settings
- "Increase font size" - Make text larger
- "Decrease font size" - Make text smaller
- "High contrast mode" - Toggle high contrast
- "Start listening" - Begin voice recognition
- "Stop listening" - End voice recognition

## ⌨️ Keyboard Shortcuts

### Navigation
- **Ctrl + H** - Go to home page
- **Ctrl + Q** - Go to quiz page
- **Ctrl + C** - Go to clinics page
- **Ctrl + E** - Go to emergency page
- **Ctrl + S** - Go to settings page
- **Escape** - Go back

### Quiz
- **1, 2, 3, 4** - Select options A, B, C, D
- **Enter** - Submit answer
- **Arrow Right** - Next question
- **Arrow Left** - Previous question
- **N** - Next question
- **P** - Previous question

### Accessibility
- **Ctrl + +** - Increase font size
- **Ctrl + -** - Decrease font size
- **Ctrl + 0** - Reset font size
- **Ctrl + Shift + H** - Toggle high contrast
- **Ctrl + Shift + M** - Toggle reduced motion
- **F1** - Show help
- **F2** - Accessibility settings
- **F3** - Toggle voice commands
- **F4** - Toggle keyboard navigation

## 📊 Monitoring & Analytics

### Accessibility Dashboard
- Real-time feature status
- Usage statistics
- Service health monitoring
- Storage usage tracking
- User engagement metrics

### Key Metrics
- SMS users count
- USSD session count
- Offline content downloads
- Voice command usage
- Keyboard navigation usage
- Accessibility feature adoption

## 🔧 Configuration

### Environment Variables
```bash
# SMS Gateway Configuration
SMS_GATEWAY_URL=your_sms_gateway_url
SMS_API_KEY=your_sms_api_key

# USSD Configuration
USSD_SHORT_CODE=*123#
USSD_SERVICE_URL=your_ussd_service_url

# Voice Recognition
VOICE_RECOGNITION_LANG=en-US
VOICE_COMMANDS_ENABLED=true

# Offline Storage
MAX_OFFLINE_STORAGE=100MB
AUTO_DOWNLOAD_ENABLED=true
```

### Local Storage Keys
- `accessibility-settings` - User accessibility preferences
- `sms-users` - SMS user data
- `sms-messages` - SMS message history
- `offline-content` - Downloaded content
- `offline-progress` - User progress data
- `offline-settings` - Offline mode settings

## 🌍 Multi-Language Support

### Supported Languages
- **English** (en) - Default
- **Bassa** (bassa) - Local language
- **Kpelle** (kpelle) - Local language
- **Kru** (kru) - Local language
- **Vai** (vai) - Local language

### Language Features
- SMS commands in local languages
- USSD menus in local languages
- Voice commands in local languages
- Accessibility instructions in local languages

## 🚀 Future Enhancements

### Planned Features
- Sign language video support
- Braille display compatibility
- Advanced voice recognition
- AI-powered accessibility
- Community accessibility features
- Accessibility analytics dashboard
- Mobile app with accessibility features
- Integration with assistive technologies

### Research Areas
- Machine learning for accessibility
- Natural language processing
- Computer vision for accessibility
- Haptic feedback systems
- Brain-computer interfaces
- Accessibility in low-resource settings

## 📞 Support & Resources

### Getting Help
- Use "HELP" command in SMS mode
- Press F1 for keyboard help
- Say "Help" for voice command help
- Access accessibility dashboard at `/accessibility`

### Resources
- [Web Content Accessibility Guidelines (WCAG) 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [Section 508 Compliance](https://www.section508.gov/)
- [Mobile Accessibility Guidelines](https://www.w3.org/WAI/mobile/)
- [Voice User Interface Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/voice-commands.html)

## 🤝 Contributing

### Accessibility Testing
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Test with keyboard-only navigation
- Test with voice commands
- Test with high contrast mode
- Test with reduced motion
- Test with different font sizes
- Test on basic phones
- Test in offline mode

### Reporting Issues
- Use the accessibility dashboard to report issues
- Include browser and device information
- Describe the accessibility barrier
- Suggest improvements
- Test with different assistive technologies

## 📄 License

This accessibility implementation is part of the SafeLink SRHR project and follows the same MIT license.

---

**SafeLink SRHR** - Making sexual and reproductive health and rights accessible to everyone, everywhere.
