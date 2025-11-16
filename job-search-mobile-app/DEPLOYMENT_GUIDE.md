# Deployment Guide - Job Search AI Assistant

This guide walks you through deploying the Job Search AI Assistant to both iOS App Store and Google Play Store.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Preparing Your App](#preparing-your-app)
3. [iOS Deployment](#ios-deployment)
4. [Android Deployment](#android-deployment)
5. [Post-Deployment](#post-deployment)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Accounts

- **Expo Account**: Sign up at [expo.dev](https://expo.dev)
- **Apple Developer Account**: $99/year - [developer.apple.com](https://developer.apple.com)
- **Google Play Developer Account**: $25 one-time - [play.google.com/console](https://play.google.com/console)

### Required Tools

```bash
# Install Expo CLI globally
npm install -g expo-cli

# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
eas login
```

## Preparing Your App

### 1. Update App Configuration

Edit `app.json`:

```json
{
  "expo": {
    "name": "Job Search AI Assistant",
    "slug": "job-search-ai-assistant",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.yourcompany.jobsearchai",
      "buildNumber": "1.0.0",
      "supportsTablet": true
    },
    "android": {
      "package": "com.yourcompany.jobsearchai",
      "versionCode": 1
    }
  }
}
```

### 2. Create App Assets

Create the following assets in the `assets/` directory:

#### Required Assets:
- `icon.png` - 1024x1024px app icon
- `splash.png` - Splash screen image
- `adaptive-icon.png` - 1024x1024px (Android only)
- `favicon.png` - 48x48px (Web only)

### 3. Configure EAS Build

Initialize EAS configuration:

```bash
eas build:configure
```

This creates `eas.json` with build profiles.

### 4. Update Privacy Policy

Create a privacy policy for your app. Required information:

- What data you collect
- How you use the data
- Data storage and security
- Third-party services (Claude API)
- User rights

Host it online and add the URL to your app store listings.

## iOS Deployment

### Step 1: Prepare iOS Build

1. **Update Bundle Identifier**:
   - Choose a unique identifier: `com.yourcompany.jobsearchai`
   - Update in `app.json`

2. **Create App in App Store Connect**:
   - Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
   - Click "My Apps" → "+" → "New App"
   - Fill in app information
   - Save the App ID

3. **Prepare App Store Assets**:
   - App icon: 1024x1024px
   - Screenshots for:
     - iPhone 6.7" (iPhone 14 Pro Max)
     - iPhone 6.5" (iPhone 14 Plus)
     - iPhone 5.5" (iPhone 8 Plus)
     - iPad Pro 12.9" (3rd gen)

### Step 2: Build for iOS

```bash
# Build for iOS
eas build --platform ios

# Or build for production
eas build --platform ios --profile production
```

This will:
- Create a cloud build
- Generate an IPA file
- Provide a download link

### Step 3: Submit to App Store

#### Option 1: Using EAS Submit (Recommended)

1. Update `eas.json` with your Apple credentials:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD123456"
      }
    }
  }
}
```

2. Submit:

```bash
eas submit --platform ios
```

#### Option 2: Manual Submission

1. Download the IPA from EAS build
2. Upload using Transporter app (Mac)
3. Go to App Store Connect
4. Select your app → TestFlight or App Store
5. Select the build
6. Complete app information
7. Submit for review

### Step 4: App Store Information

Complete the following in App Store Connect:

**App Information**:
- Name: Job Search AI Assistant
- Subtitle: AI-Powered Job Search Companion
- Category: Business / Productivity
- Age Rating: 4+

**Description**:
```
Transform your job search with AI-powered insights and automation.

FEATURES:
• AI-Powered Job Analysis - Get instant fit scores and insights
• Smart Resume Builder - Generate tailored resumes for each job
• Application Tracker - Never lose track of your applications
• Cover Letter Generator - Create compelling cover letters instantly
• Interview Prep - Get AI-generated interview questions and tips

POWERED BY CLAUDE AI:
Leverage cutting-edge AI from Anthropic to analyze job postings, identify the best opportunities, and create personalized application materials.

PRIVACY FIRST:
All your data stays on your device. We don't collect or share your personal information.
```

**Keywords**: job search, resume, AI, career, applications, interviews, Claude

**Support URL**: Your support website

**Privacy Policy URL**: Your privacy policy URL

### Step 5: App Review Information

- **App Review Information**: Provide demo account if needed
- **Version Release**: Choose automatic or manual release
- **Submit for Review**: Click "Submit for Review"

**Review Time**: Typically 24-48 hours

## Android Deployment

### Step 1: Prepare Android Build

1. **Update Package Name**:
   - Choose: `com.yourcompany.jobsearchai`
   - Update in `app.json`

2. **Create App in Google Play Console**:
   - Go to [play.google.com/console](https://play.google.com/console)
   - Click "Create app"
   - Fill in app details
   - Complete content rating questionnaire

3. **Prepare Play Store Assets**:
   - App icon: 512x512px
   - Feature graphic: 1024x500px
   - Screenshots:
     - Phone: 16:9 or 9:16 aspect ratio
     - Tablet: 7" and 10" (optional)
   - Video (optional)

### Step 2: Build for Android

```bash
# Build APK (for testing)
eas build --platform android --profile preview

# Build AAB (for production)
eas build --platform android --profile production
```

### Step 3: Create Service Account (for automated submission)

1. **In Google Cloud Console**:
   - Go to IAM & Admin → Service Accounts
   - Create service account
   - Grant "Service Account User" role
   - Create and download JSON key

2. **In Google Play Console**:
   - Settings → API Access
   - Link the service account
   - Grant permissions (Release manager)

3. **Save the JSON key** as `google-play-service-account.json`

### Step 4: Submit to Google Play

#### Option 1: Using EAS Submit

1. Update `eas.json`:

```json
{
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "production"
      }
    }
  }
}
```

2. Submit:

```bash
eas submit --platform android
```

#### Option 2: Manual Submission

1. Download AAB from EAS build
2. Go to Google Play Console
3. Production → Create new release
4. Upload AAB file
5. Complete release notes
6. Review and rollout

### Step 5: Google Play Store Information

**Store Listing**:
- **App Name**: Job Search AI Assistant
- **Short Description** (80 chars):
  ```
  AI-powered job search with smart resume builder and application tracking
  ```
- **Full Description**:
  ```
  Transform your job search with the power of artificial intelligence!

  🎯 SMART JOB ANALYSIS
  Get instant AI-powered insights on every job posting. Know your fit score, required skills, and potential red flags before you apply.

  📝 INTELLIGENT RESUME BUILDER
  Create a master resume and let AI generate tailored versions for each job. Perfect your application in minutes, not hours.

  📊 APPLICATION TRACKING
  Never lose track of your applications. Track every opportunity from interested to offer, with automated timeline tracking.

  ✍️ AI-GENERATED COVER LETTERS
  Generate compelling, personalized cover letters that highlight your relevant experience and skills.

  💼 INTERVIEW PREPARATION
  Get AI-generated interview questions, talking points, and company research topics.

  🔒 PRIVACY FIRST
  Your data stays on your device. We use end-to-end encryption and never share your information.

  POWERED BY CLAUDE AI from Anthropic - the most advanced AI for understanding and generating human-like text.

  PERFECT FOR:
  • Job seekers looking for their next opportunity
  • Career changers exploring new fields
  • Recent graduates entering the job market
  • Professionals seeking better opportunities

  Download now and take control of your job search!
  ```

**Categorization**:
- **App Category**: Business
- **Tags**: Jobs, Career, Resume, AI, Productivity

**Contact Details**:
- Email
- Website
- Phone (optional)

**Privacy Policy**: URL to your privacy policy

### Step 6: Content Rating

Complete the content rating questionnaire:
- Violence: None
- Sexual Content: None
- Language: None
- Controlled Substances: None
- Gambling: None

Expected rating: **Everyone**

### Step 7: Pricing & Distribution

- **Price**: Free
- **Countries**: Select all or specific countries
- **Content Guidelines**: Confirm compliance
- **US Export Laws**: Confirm compliance

## Post-Deployment

### Monitor Reviews

- **iOS**: App Store Connect → Ratings & Reviews
- **Android**: Google Play Console → Ratings & Reviews
- Respond to user feedback promptly

### Analytics

Consider adding analytics:
- Firebase Analytics
- Amplitude
- Mixpanel

### Updates

To release updates:

1. **Update version**:
   - iOS: Increment `buildNumber` in `app.json`
   - Android: Increment `versionCode` in `app.json`
   - Both: Update `version` (e.g., 1.0.0 → 1.1.0)

2. **Build**:
   ```bash
   eas build --platform all --profile production
   ```

3. **Submit**:
   ```bash
   eas submit --platform all
   ```

### Marketing

- Create landing page
- Social media presence
- Product Hunt launch
- Blog posts about features
- Video tutorials

## Troubleshooting

### Build Failures

**Issue**: Build fails with dependency errors
```bash
# Solution: Clear cache and rebuild
rm -rf node_modules
npm install
eas build --platform [ios|android] --clear-cache
```

**Issue**: iOS provisioning profile errors
```bash
# Solution: Revoke and regenerate certificates
eas credentials
# Select "Build Credentials" → "iOS" → "Reset credentials"
```

### Submission Errors

**iOS Rejection - Missing Privacy Policy**:
- Add privacy policy URL in App Store Connect
- Ensure it's accessible and covers all data usage

**Android Rejection - Content Policy**:
- Review Google Play's content policies
- Ensure app doesn't violate any policies
- Provide clear app description

### Common Issues

**Issue**: App crashes on launch
- Check Expo SDK and React Native version compatibility
- Test on both iOS and Android before submission
- Review crash logs in App Store Connect / Play Console

**Issue**: API integration not working
- Verify API keys are not hardcoded
- Test with production API endpoints
- Check network permissions

## Checklist Before Submission

### iOS
- [ ] Bundle identifier configured
- [ ] App icon (1024x1024) created
- [ ] Screenshots for all required devices
- [ ] Privacy policy URL ready
- [ ] App description written
- [ ] Keywords selected
- [ ] Support URL configured
- [ ] Age rating set
- [ ] Build tested on real device

### Android
- [ ] Package name configured
- [ ] App icon (512x512) created
- [ ] Feature graphic (1024x500) created
- [ ] Phone screenshots ready
- [ ] Privacy policy URL ready
- [ ] App description written
- [ ] Content rating completed
- [ ] Pricing & distribution set
- [ ] Build tested on real device

## Resources

- [Expo Documentation](https://docs.expo.dev)
- [EAS Build Guide](https://docs.expo.dev/build/introduction/)
- [EAS Submit Guide](https://docs.expo.dev/submit/introduction/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy](https://play.google.com/about/developer-content-policy/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)

## Support

For deployment issues:
- Expo Forums: [forums.expo.dev](https://forums.expo.dev)
- Discord: [expo.dev/discord](https://expo.dev/discord)
- Stack Overflow: Tag with `expo` and `react-native`

---

Good luck with your deployment! 🚀
