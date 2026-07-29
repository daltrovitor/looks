import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AuthModal from './components/AuthModal';
import CheckoutModal from './components/CheckoutModal';
import EbookReaderModal from './components/EbookReaderModal';
import IaChatModal from './components/IaChatModal';
import { supabase, getCurrentProfile } from './utils/supabaseClient';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('landing');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [readerModalOpen, setReaderModalOpen] = useState(false);
  const [iaModalOpen, setIaModalOpen] = useState(false);
  const [iaInitialQuery, setIaInitialQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState(null);

  const handleOpenIaChat = (query = '') => {
    if (typeof query === 'string' && query) {
      setIaInitialQuery(query);
    } else {
      setIaInitialQuery('');
    }
    setIaModalOpen(true);
  };

  // Progress State
  const [progressState, setProgressState] = useState(() => {
    try {
      const saved = localStorage.getItem('looksnow_progress');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Re-fetch user profile from Supabase DB to ensure accurate VIP status
  const refreshUserProfile = async () => {
    try {
      const profile = await getCurrentProfile();
      if (profile) {
        setUser(profile);
        return profile;
      }
    } catch (err) {
      console.warn('Erro ao atualizar perfil do usuário:', err);
    }
    return null;
  };

  // Check Supabase Auth Session on Mount
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const profile = await getCurrentProfile();
        if (profile && isMounted) {
          setUser(profile);
          setCurrentView('dashboard');
        }
      } catch (err) {
        console.warn('Verificação de Auth ignorada:', err);
      }
    };

    checkAuth();

    let subscription = null;
    try {
      const authListener = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user && isMounted) {
          const profile = await getCurrentProfile();
          setUser(profile || {
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
            is_pro: false
          });
          setCurrentView('dashboard');
        }
      });
      subscription = authListener?.data?.subscription;
    } catch (err) {
      console.warn('Erro no ouvinte do Supabase Auth:', err);
    }

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Update Reading Progress
  const handleUpdateProgress = async (moduleId, progress, chapterNum) => {
    const updated = {
      ...progressState,
      [moduleId]: {
        progress,
        lastChapter: chapterNum,
        updatedAt: new Date().toISOString()
      }
    };
    setProgressState(updated);
    try {
      localStorage.setItem('looksnow_progress', JSON.stringify(updated));
    } catch (e) {
      console.warn('Erro ao salvar no localStorage:', e);
    }

    // Sync with Supabase RLS database if logged in
    if (user?.id) {
      try {
        await supabase
          .from('user_progress')
          .upsert({
            user_id: user.id,
            module_id: moduleId,
            progress_percent: progress,
            last_read_chapter: chapterNum,
            completed: progress >= 100
          });
      } catch (err) {
        console.warn('Erro na sincronização de progresso no Supabase:', err);
      }
    }
  };

  const handleOpenReader = (moduleData) => {
    setSelectedModule(moduleData);
    setReaderModalOpen(true);
  };

  const handleAuthSuccess = async (userData) => {
    if (userData) {
      setUser(userData);
    } else {
      await refreshUserProfile();
    }
    setCurrentView('dashboard');
  };

  const handleCheckoutSuccess = async (checkoutUser) => {
    // Ao receber sucesso do checkout
    let finalUser = checkoutUser;
    
    // Tenta obter o perfil atualizado do banco de dados
    const updatedProfile = await refreshUserProfile();
    if (updatedProfile) {
      finalUser = { ...updatedProfile, is_pro: true };
    } else if (user) {
      finalUser = { ...user, is_pro: true };
    }

    if (finalUser) {
      setUser(finalUser);
    }

    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('SignOut error:', e);
    }
    setUser(null);
    setCurrentView('landing');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 font-sans text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      
      {/* NAVBAR */}
      <Navbar
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenCheckout={() => setCheckoutModalOpen(true)}
        onOpenIaChat={handleOpenIaChat}
        currentView={currentView}
        setCurrentView={setCurrentView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onLogout={handleLogout}
      />

      {/* VIEW SWITCHER */}
      <main className="flex-1">
        {currentView === 'dashboard' ? (
          <Dashboard
            user={user}
            progressState={progressState}
            onOpenReader={handleOpenReader}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpenIaChat={handleOpenIaChat}
          />
        ) : (
          <LandingPage
            onOpenCheckout={() => setCheckoutModalOpen(true)}
            onOpenAuth={() => setAuthModalOpen(true)}
            onOpenIaChat={handleOpenIaChat}
          />
        )}
      </main>

      {/* FOOTER */}
      <Footer />

      {/* MODALS */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <CheckoutModal
        isOpen={checkoutModalOpen}
        user={user}
        onClose={() => setCheckoutModalOpen(false)}
        onCheckoutSuccess={handleCheckoutSuccess}
        onUserAuthenticated={(u) => setUser(u)}
      />

      <EbookReaderModal
        moduleData={selectedModule}
        isOpen={readerModalOpen}
        progressState={progressState}
        onClose={() => setReaderModalOpen(false)}
        onUpdateProgress={handleUpdateProgress}
      />

      <IaChatModal
        isOpen={iaModalOpen}
        initialQuery={iaInitialQuery}
        onClose={() => {
          setIaModalOpen(false);
          setIaInitialQuery('');
        }}
        onOpenCheckout={() => {
          setIaModalOpen(false);
          setCheckoutModalOpen(true);
        }}
      />

    </div>
  );
}
