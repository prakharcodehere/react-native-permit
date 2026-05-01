# Platform configuration examples

Only add native permission declarations for features your app actually uses.

## iOS Info.plist

```xml
<key>NSCameraUsageDescription</key>
<string>Camera access is used to scan QR codes.</string>

<key>NSMicrophoneUsageDescription</key>
<string>Microphone access is used for audio recording.</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>Location access is used to show nearby results.</string>

<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Background location is used for active trip tracking.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Photo access is used to attach images.</string>

<key>NSPhotoLibraryAddUsageDescription</key>
<string>Photo write access is used to save generated images.</string>

<key>NSUserNotificationsUsageDescription</key>
<string>Notifications are used for reminders and updates.</string>

<key>NSUserTrackingUsageDescription</key>
<string>Tracking is used for personalized advertising.</string>
```

## AndroidManifest.xml

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission
  android:name="android.permission.READ_EXTERNAL_STORAGE"
  android:maxSdkVersion="32" />
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-permission android:name="android.permission.ACTIVITY_RECOGNITION" />
<uses-permission android:name="android.permission.BODY_SENSORS" />
```

## Notes

- Android notifications are runtime permissions only on API 33+.
- Android background location requires a separate flow on API 29+.
- iOS photo library can return `limited`.
- iOS notification requests can return `provisional`.
