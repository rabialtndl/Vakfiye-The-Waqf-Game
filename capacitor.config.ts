import type { CapacitorConfig } from '@capacitor/cli'

// Android APK: `npm run build && npx cap sync android` sonra Android Studio ile derle.
const config: CapacitorConfig = {
  appId: 'com.tekinoglufirin.vakfiye',
  appName: 'Vakfiye',
  webDir: 'dist',
  android: { backgroundColor: '#86AD60' },
}

export default config
