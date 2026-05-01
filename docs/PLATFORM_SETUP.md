# Platform Setup

`react-native-permit` does not ship native modules. Native permission setup comes
from `react-native-permissions`.

## iOS Info.plist

Add only the keys your app actually uses.

```xml
<key>NSCameraUsageDescription</key>
<string>Camera access is used to scan QR codes.</string>

<key>NSMicrophoneUsageDescription</key>
<string>Microphone access is used to record audio.</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>Location access is used to show nearby results.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Photo access is used to attach images.</string>

<key>NSUserNotificationsUsageDescription</key>
<string>Notifications are used for reminders and updates.</string>
```

## AndroidManifest.xml

Add only the permissions your app uses.

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
```

## Notes

- Android notifications are runtime permissions only on API 33+.
- Android background location requires special platform handling.
- iOS photo library can return `limited`.
- iOS notifications can return `provisional`.
