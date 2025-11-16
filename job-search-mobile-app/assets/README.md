# App Assets

This directory contains all the visual assets for the Job Search AI Assistant app.

## Required Assets

### App Icons

1. **icon.png** (1024x1024px)
   - Main app icon used for iOS and Android
   - Should have transparent background
   - PNG format
   - Design should be simple and recognizable at small sizes

2. **adaptive-icon.png** (1024x1024px)
   - Android adaptive icon
   - The icon should fit within a circular mask
   - Leave 108px safe zone from edges

3. **favicon.png** (48x48px)
   - Web favicon
   - PNG format

### Splash Screen

4. **splash.png** (1284x2778px recommended)
   - Loading screen shown when app starts
   - Should match your brand colors
   - Can include logo and app name
   - PNG format

## Design Guidelines

### Color Scheme
- Primary: #0176d3 (Salesforce Blue)
- Accent: #00a1e0 (Light Blue)
- Success: #4bca81 (Green)
- Error: #ea001e (Red)
- Background: #f4f6f9 (Light Gray)

### Icon Design Tips
- Use simple, bold shapes
- Avoid text in icons (except logo)
- Test at different sizes (16px, 32px, 64px, 512px, 1024px)
- Ensure good contrast
- Consider both light and dark backgrounds

### Tools for Creating Assets

**Design Tools**:
- Figma (free online tool)
- Adobe Illustrator
- Sketch (Mac only)
- Canva (templates available)

**Icon Generators**:
- [App Icon Generator](https://appicon.co/)
- [Expo Icon Generator](https://icon.kitchen/)

## App Store Assets

### iOS App Store

Create screenshots for these sizes:
- 6.7" Display (iPhone 14 Pro Max): 1290 x 2796
- 6.5" Display (iPhone 14 Plus): 1284 x 2778
- 5.5" Display (iPhone 8 Plus): 1242 x 2208
- 12.9" iPad Pro: 2048 x 2732

### Google Play Store

Required graphics:
1. **Feature Graphic** (1024 x 500px)
   - Showcased at top of store listing
   - Include app name and key features

2. **Phone Screenshots** (at least 2)
   - Min: 320px
   - Max: 3840px
   - Aspect ratio between 16:9 and 9:16

3. **Tablet Screenshots** (optional but recommended)
   - 7-inch and 10-inch tablet sizes

## Screenshot Recommendations

Showcase these key features in your screenshots:

1. **Dashboard** - Show analytics and overview
2. **Job Search** - Display job listings with AI scores
3. **AI Analysis** - Show the AI analysis feature
4. **Resume Builder** - Demonstrate resume creation
5. **Application Tracking** - Show application pipeline
6. **Settings** - Display customization options

### Screenshot Tips
- Add text overlays explaining features
- Use actual app content (not lorem ipsum)
- Show the app in use with real data
- Maintain consistent style across all screenshots
- Include device frames for professional look

## Placeholder Assets

Until you create custom assets, you can use:

```javascript
// In app.json
{
  "icon": "./assets/icon.png",
  "splash": {
    "image": "./assets/splash.png",
    "resizeMode": "contain",
    "backgroundColor": "#0176d3"
  }
}
```

## Asset Optimization

Before deploying, optimize your assets:

**PNG Optimization**:
- [TinyPNG](https://tinypng.com/)
- [ImageOptim](https://imageoptim.com/) (Mac)

**Format Conversion**:
- Use PNG for icons (supports transparency)
- Use JPG for screenshots (smaller file size)

## Resources

- [Expo Assets Guide](https://docs.expo.dev/guides/assets/)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Android Material Design](https://material.io/design)
- [App Store Screenshot Sizes](https://help.apple.com/app-store-connect/#/devd274dd925)
- [Google Play Asset Guidelines](https://support.google.com/googleplay/android-developer/answer/9866151)
