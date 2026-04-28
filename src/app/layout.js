import { Inter, Bebas_Neue } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';

// Inter - Clean, professional font for body text and general use
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

// Bebas Neue - Bold, condensed font for headings, team names, and scores - SPORTS STYLE
const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bebas',
  display: 'swap',
});

export const metadata = {
  title: 'APL Scoreboard',
  description: 'Live cricket scoreboard & tournament panel - Professional Sports Display',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${inter.variable} ${bebasNeue.variable}`}>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
