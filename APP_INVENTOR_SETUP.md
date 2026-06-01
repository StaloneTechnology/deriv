# App Inventor Setup Instructions for Desy Synthetic Alert

## Overview
The web code has been modified to communicate with App Inventor via WebViewer string messages instead of using HTML5 audio. This allows the alarm to play through App Inventor's native Sound component.

## Components Needed in App Inventor

### 1. WebViewer Component
- **Purpose**: Display the HTML/CSS/JS interface
- **Settings**: 
  - HomeURL: Set to your hosted HTML file or load from assets
  - WebViewString: Enable this property

### 2. Sound Component
- **Purpose**: Play the alarm sound
- **Settings**:
  - Source: Upload your alarm.mp3 file
  - Loop: Set to true for continuous alarm

### 3. Clock Component
- **Purpose**: Monitor WebViewer string changes
- **Settings**:
  - TimerInterval: 100 (milliseconds)
  - TimerEnabled: true

## Block Programming Instructions

### 1. Initialize Components
```
When Screen1.Initialize
do
    Set Sound1.Source to "alarm.mp3"
    Set Clock1.TimerEnabled to true
```

### 2. Monitor WebViewer String
```
When Clock1.Timer
do
    if WebViewer1.WebViewString = "ALARM_ON"
    then
        if Sound1.Playing = false
        then
            call Sound1.Play
    else if WebViewer1.WebViewString = "ALARM_OFF"
    then
        call Sound1.Stop
        call Sound1.Pause
```

### 3. Handle Screen Dismissal
```
When WebViewer1.GotFocus
do
    if WebViewer1.WebViewString = "ALARM_OFF"
    then
        call Sound1.Stop
```

## Alternative Method: Using JavaScript Interface

If the WebViewer string method doesn't work, use the JavaScript Interface:

### 1. Add WebViewer.StringChanged Event
```
When WebViewer1.StringChanged
do
    if WebViewer1.WebViewString = "ALARM_ON"
    then
        call Sound1.Play
    else if WebViewer1.WebViewString = "ALARM_OFF"
    then
        call Sound1.Stop
```

## File Upload Instructions

### 1. Upload HTML Files
- Upload `index.html`, `style.css`, and `script.js` to App Inventor assets
- Or host them online and use the URL in WebViewer.HomeURL

### 2. Upload Audio File
- Upload your `alarm.mp3` file to App Inventor assets
- Set it as the source for the Sound component

## Permissions Required

Add these permissions to your app:
- `INTERNET` (for WebSocket connection)
- `WAKE_LOCK` (to keep screen on if needed)
- `VIBRATE` (optional, for vibration feedback)

## Testing Steps

1. **Test in Companion App**: Use the AI2 Companion app to test before building APK
2. **Verify WebSocket**: Ensure the WebSocket connection works in the WebViewer
3. **Test Alarm**: Trigger the alarm and verify Sound component plays
4. **Test Stop**: Click the alert screen and verify alarm stops

## Troubleshooting

### Alarm Not Playing
- Check if Sound component source is set correctly
- Verify WebViewer string is changing (add a Label to display the string)
- Ensure audio file format is compatible (MP3 recommended)

### WebSocket Not Connecting
- Some WebViewer implementations block WebSocket connections
- Try using a different approach: poll an API instead of WebSocket
- Consider using a native App Inventor extension for WebSocket

### Screen Not Responsive
- Ensure WebViewer has focus
- Check if JavaScript is running (add console.log debugging)
- Verify the HTML loads correctly in WebViewer

## Alternative: Use App Inventor Extensions

If the above method doesn't work, consider using:
- **WebViewString Extension**: Enhanced WebViewer communication
- **Sound Extension**: More audio control options
- **WebSocket Extension**: Native WebSocket support

## Building the APK

1. Go to Build → App (save .apk to my computer)
2. Choose between:
   - Production APK (for publishing)
   - Debug APK (for testing)
3. Download and install on your Android device

## Notes

- The web code now uses `window.AppInventor.setWebViewString()` for communication
- Fallback to `window.Android.playAlarm()` is included for other frameworks
- The HTML5 audio element has been removed since it won't work in WebViewer
- All alarm logic is now handled by App Inventor's native components
