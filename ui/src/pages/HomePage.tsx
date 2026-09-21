import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';
import type { HomePage as HomePageData } from '../types/api';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { Stats } from '../components/Stats';
import { Tariffs } from '../components/Tariffs';
import { Advantages } from '../components/Advantages';
import { About } from '../components/About';
import { Tournaments } from '../components/Tournaments';
import { Events } from '../components/Events';
import { Teams } from '../components/Teams';
import { Faq } from '../components/Faq';
import { Contact } from '../components/Contact';
import { Footer } from '../components/Footer';
import { BrandTitle } from '../components/ui/BrandTitle';

function PageLoader() {
  const { t } = useTranslation();

  return (
    <div className="flex h-[100dvh] flex-col items-center justify-center bg-[#050508]">
      <BrandTitle size="loader" />
      <p className="mono-label mt-6 text-[10px]">{t('loading')}</p>
    </div>
  );
}

export function HomePage() {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<HomePageData | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(false);
      try {
        const home = await api.getHome(i18n.language);
        if (!cancelled) setData(home);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [i18n.language]);

  if (loading) {
    return (
      <>
        <Header />
        <PageLoader />
      </>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#050508] px-4 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">{t('error')}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#050508]">
      <Header />

      <main className="bg-[#050508]">
        <div className="snap-intro">
          <Hero club={data.club} />
        </div>
        <About club={data.club} />
        <Tariffs />
        <Advantages />
        <Stats />
        <Tournaments tournaments={data.featuredTournaments} />
        <Events events={data.recentEvents} />
        <Teams teams={data.topTeams} />
        <Faq items={data.faq} />
        <Contact club={data.club} />
      </main>

      <Footer club={data.club} />
    </div>
  );
}
