import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gridline.app',
  appName: 'Gridline',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    url: 'https://gridlinef1.netlify.app',
  }
};

export default config;
