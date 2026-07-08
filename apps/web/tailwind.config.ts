import sharedConfig from '@pranakaia/ui/tailwind.config';
import type { Config } from 'tailwindcss';

const config: Config = {
  presets: [sharedConfig],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/enterprise/**/*.{js,ts,jsx,tsx,mdx}',
    // Add shared UI components
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
};

export default config;
