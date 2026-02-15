import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.studyspark.app',
  appName: 'Advanced StudySpark',
  webDir: 'out', 
  server: {
    url: 'https://advanced-study-spark.vercel.app/', // <--- REPLACE THIS
    cleartext: true
  }
};

export default config;