# Job Search AI Assistant - Standalone Mobile App

An AI-powered job search companion mobile app that helps you find, analyze, and apply to jobs with confidence. Built with React Native and Expo, deployable to both iOS App Store and Google Play Store.

## Features

### 🎯 Core Functionality
- **Job Posting Management**: Save and organize job postings from any source
- **AI-Powered Analysis**: Leverage Claude AI to analyze job fit, requirements, and red flags
- **Smart Resume Builder**: Create master resumes and generate tailored versions for specific jobs
- **Application Tracking**: Track your applications through various stages (interested, applied, callback, interview, offer)
- **Analytics Dashboard**: Visualize your job search progress with charts and statistics

### 🤖 Claude AI Integration
- Job posting analysis with fit scoring (0-100%)
- Automated resume tailoring based on job requirements
- Cover letter generation
- Interview preparation and question suggestions
- Salary competitiveness assessment

### 📱 Platform Support
- iOS (iPhone & iPad)
- Android (phones & tablets)
- Cross-platform with a single codebase

## Technology Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation
- **UI Components**: React Native Paper
- **Database**: SQLite (expo-sqlite)
- **AI Integration**: Claude API from Anthropic
- **PDF Generation**: expo-print
- **Storage**: Async Storage + Secure Store

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- EAS CLI (for building): `npm install -g eas-cli`
- Xcode (for iOS development on Mac)
- Android Studio (for Android development)

## Installation

1. **Clone the repository and navigate to the app directory**:
   ```bash
   cd job-search-mobile-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Run on a device**:
   - **iOS Simulator**: Press `i` in the terminal or run `npm run ios`
   - **Android Emulator**: Press `a` in the terminal or run `npm run android`
   - **Physical Device**: Scan the QR code with Expo Go app

## Configuration

### Claude API Key

To enable AI features, you need a Claude API key from Anthropic:

1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create an account or sign in
3. Generate an API key
4. Open the app and go to **Settings**
5. Tap "API Key" and enter your Claude API key
6. Save and start using AI-powered features

### User Profile

Complete your profile in the Settings screen to enhance AI-generated resumes:
- Full Name
- Email
- Phone
- LinkedIn Profile
- GitHub Profile
- Portfolio Website

## Building for Production

### Setup EAS (Expo Application Services)

1. **Create an Expo account** at [expo.dev](https://expo.dev)

2. **Login to EAS**:
   ```bash
   eas login
   ```

3. **Configure your project**:
   ```bash
   eas build:configure
   ```

### Build for iOS

1. **Update app.json** with your bundle identifier:
   ```json
   {
     "ios": {
       "bundleIdentifier": "com.yourcompany.jobsearchai"
     }
   }
   ```

2. **Build the app**:
   ```bash
   eas build --platform ios
   ```

3. **Submit to App Store**:
   - Update `eas.json` with your Apple credentials
   - Run: `eas submit --platform ios`

### Build for Android

1. **Update app.json** with your package name:
   ```json
   {
     "android": {
       "package": "com.yourcompany.jobsearchai"
     }
   }
   ```

2. **Build the app**:
   ```bash
   eas build --platform android
   ```

3. **Submit to Google Play**:
   - Create a service account key
   - Update `eas.json` with the service account path
   - Run: `eas submit --platform android`

## App Store Requirements

### iOS App Store

1. **Apple Developer Account** ($99/year)
2. **App Store Assets**:
   - App icon (1024x1024px)
   - Screenshots for different device sizes
   - App description and keywords
   - Privacy policy URL

3. **Required Information**:
   - App category: Business / Productivity
   - Age rating: 4+
   - Privacy policy

### Google Play Store

1. **Google Play Developer Account** ($25 one-time fee)
2. **Play Store Assets**:
   - Feature graphic (1024x500px)
   - App icon (512x512px)
   - Screenshots for phones and tablets
   - App description

3. **Required Information**:
   - Content rating questionnaire
   - Target audience
   - Privacy policy URL

## Usage Guide

### Adding Job Postings

1. Go to the **Search** tab
2. Tap the **+** button
3. Enter job details (title, company, location, etc.)
4. Optionally add recruiter contact information
5. Save the job
6. Tap "Analyze" to get AI-powered insights

### Creating a Master Resume

1. Go to the **Resumes** tab
2. Tap the **+** button
3. Enter your resume information:
   - Name
   - Content (formatted resume text)
   - Skills
   - Experience
   - Education
   - Certifications
4. Check "Set as Master Resume"
5. Save

### Generating Tailored Resumes

1. Ensure you have a master resume created
2. Add job postings you want to apply to
3. Go to **Resumes** tab
4. Tap **+** → **AI Generate**
5. Select a job posting
6. Claude AI will generate a tailored resume and cover letter
7. Export as PDF or share directly

### Tracking Applications

1. Go to **Applications** tab
2. View all your applications
3. Filter by status
4. Tap on an application to update its status
5. Track timeline of callbacks and interviews

## Database Schema

The app uses SQLite with the following main tables:

- **job_postings**: Job listings with AI analysis
- **applications**: Application tracking with status and dates
- **resumes**: Resume storage with master resume support
- **resume_packages**: Generated tailored resumes for specific jobs
- **user_profile**: User information and settings

## Privacy & Security

- All data is stored locally on your device
- Claude API key is stored securely using Expo Secure Store
- No data is shared with third parties
- API calls to Claude are made directly from your device using your API key

## Troubleshooting

### App won't build

- Clear cache: `expo start -c`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Expo and React Native versions compatibility

### Database errors

- The database is automatically created on first launch
- If you experience issues, try clearing app data and restarting

### Claude AI not working

- Verify your API key is correct in Settings
- Check your internet connection
- Ensure you have API credits available in your Anthropic account

## Roadmap

- [ ] Push notifications for application deadlines
- [ ] Calendar integration for interview scheduling
- [ ] Multiple job board integrations (LinkedIn, Indeed, etc.)
- [ ] Network tracking and relationship management
- [ ] Salary negotiation assistance
- [ ] Dark mode support
- [ ] Multi-language support

## Source Repository

This app was built based on the job search functionality from:
https://github.com/abbyluggery/Full-ND-app-build

## License

Copyright (c) 2024. All rights reserved.

## Support

For issues, questions, or feature requests, please contact:
- Email: support@example.com
- GitHub Issues: [Your repository URL]

## Credits

- Built with React Native and Expo
- AI powered by Claude from Anthropic
- Icons by MaterialCommunityIcons
- UI components by React Native Paper

---

**Happy Job Hunting! 🎯**
