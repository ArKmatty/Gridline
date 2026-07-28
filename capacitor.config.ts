import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gridline.app',
  appName: 'Gridline',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    url: 'https://YOUR-APP-URL.vercel.app', // Replace with your deployed URL
  }
};

export default config;
