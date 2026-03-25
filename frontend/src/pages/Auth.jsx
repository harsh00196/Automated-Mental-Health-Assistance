import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { User, Lock, Mail, ArrowRight } from 'lucide-react';
import { supabase } from '../supabaseClient';
import authHero from '../assets/auth_hero.png'; // We will place the generated image here

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setLoading(true);
        try {
          const { data } = await api.post('/auth/supabase-login', {
            access_token: session.access_token
          });
          localStorage.setItem('token', data.access_token);
          localStorage.setItem('user', JSON.stringify(data.user));
          navigate('/');
        } catch (err) {
          setError(err.response?.data?.msg || 'Failed to authenticate with backend');
          await supabase.auth.signOut();
        } finally {
          setLoading(false);
        }
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const { data } = await api.post('/auth/login', { email: formData.email, password: formData.password });
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/');
      } else {
        await api.post('/auth/register', formData);
        setIsLogin(true);
        setError('Registration successful! Please login.');
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/guest');
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError('Guest login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`
        }
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message || 'Google login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-background">
      
      {/* Left Design Section */}
      <div className="hidden lg:flex w-1/2 bg-[#f8fbff] flex-col justify-center items-center p-12 relative overflow-hidden">
        {/* Soft background shape */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#eef4ff] rounded-full mix-blend-multiply opacity-50 pointer-events-none"></div>
        
        <div className="z-10 max-w-md w-full">
          <h2 className="text-4xl font-bold text-gray-800 tracking-tight leading-tight">
            You're not alone.
          </h2>
          <p className="text-gray-500 mt-4 text-[17px] leading-relaxed">
            Let's take care of your mind together. Track your moods, access calming resources, and chat with an empathetic AI.
          </p>
          
          <div className="mt-12 w-full aspect-square relative rounded-[40px] overflow-hidden bg-white/50 backdrop-blur-sm border border-white/60 shadow-xl flex items-center justify-center">
             {/* We will apply the generated image here later, fallback style for now */}
             <div className="w-full h-full bg-cover bg-center opacity-90 transition-all hover:scale-105 duration-700" style={{ backgroundImage: `url(${authHero})`, backgroundColor: '#eef4ff' }}>
               {!authHero && <div className="w-full h-full bg-[#A0C4FF]/10 flex items-center justify-center animate-pulse rounded-[40px]"></div>}
             </div>
          </div>
        </div>
      </div>

      {/* Right Login Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-white shadow-[-20px_0_40px_rgba(0,0,0,0.02)] z-10 rounded-l-[40px] lg:rounded-l-[60px]">
        
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden text-center space-y-2 mb-10">
            <h2 className="text-3xl font-bold text-gray-800">You're not alone.</h2>
            <p className="text-gray-500 text-sm">Let's take care of your mind together.</p>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-800 text-center lg:text-left mb-1">
              {isLogin ? 'Welcome Back!' : 'Create Account'}
            </h3>
            <p className="text-gray-400 text-sm text-center lg:text-left mb-8">
              {isLogin ? 'Please enter your details to sign in.' : 'Join us to start your journey.'}
            </p>
          </div>

          {error && (
            <div className={`p-4 rounded-2xl text-sm font-medium border ${error.includes('successful') ? 'bg-[#CAFFBF]/20 text-[#4ca642] border-[#CAFFBF]/50' : 'bg-red-50 text-red-500 border-red-100'}`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative group">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-[18px] h-[18px] group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  name="username"
                  placeholder="How should we call you?"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all outline-none text-[15px] placeholder:text-gray-400 font-medium text-gray-700"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            )}
            
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-[18px] h-[18px] group-focus-within:text-primary transition-colors" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all outline-none text-[15px] placeholder:text-gray-400 font-medium text-gray-700"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-[18px] h-[18px] group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all outline-none text-[15px] placeholder:text-gray-400 font-medium text-gray-700"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-[#4d7ade] text-white font-semibold py-3.5 rounded-2xl transition-all shadow-[0_8px_20px_rgba(90,139,241,0.25)] hover:shadow-[0_12px_25px_rgba(90,139,241,0.35)] hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-4 cursor-pointer text-[15px]"
            >
              {loading ? 'Processing...' : isLogin ? 'Log In' : 'Sign Up'}
              {!loading && <ArrowRight className="w-4 h-4 ml-1" strokeWidth={2.5} />}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="text-gray-400 text-sm font-medium">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </span>
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-primary text-sm font-bold hover:underline focus:outline-none cursor-pointer"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </div>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 text-gray-400 bg-white font-medium text-[13px]">Or continue with</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white border border-gray-200 text-gray-700 font-medium py-3 rounded-2xl hover:bg-gray-50 transition-all flex items-center justify-center gap-3 cursor-pointer hover:shadow-[0_4px_15px_rgba(0,0,0,0.03)] text-[14px]"
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button
              onClick={handleGuestLogin}
              disabled={loading}
              className="w-full bg-white border border-gray-200 text-gray-700 font-medium py-3 rounded-2xl hover:bg-gray-50 transition-all flex items-center justify-center gap-3 cursor-pointer hover:shadow-[0_4px_15px_rgba(0,0,0,0.03)] text-[14px]"
            >
              <User className="w-[18px] h-[18px] text-gray-500" />
              Guest Mode (Anonymous)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
