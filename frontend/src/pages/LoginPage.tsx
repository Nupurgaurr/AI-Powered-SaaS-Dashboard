import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth.store';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});
type FormData = z.infer<typeof schema>;

const inputClass = "w-full px-4 py-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-all";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post('/auth/login', data);
      const { user, accessToken, refreshToken } = res.data.data;
      setAuth(user, accessToken, refreshToken);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-500 via-brand-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white/10"
              style={{
                width: `${200 + i * 120}px`,
                height: `${200 + i * 120}px`,
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl font-bold">T</div>
              <span className="text-xl font-bold">TrackAI</span>
            </div>
            <h2 className="text-4xl font-bold leading-tight mb-4">
              Land your dream<br />job, faster.
            </h2>
            <p className="text-brand-100 text-lg leading-relaxed">
              AI-powered job application tracking that helps you stay organized and get more interviews.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { icon: '📊', text: 'Track all applications in one place' },
              { icon: '✨', text: 'AI resume analysis and match scoring' },
              { icon: '💡', text: 'Auto-generate interview prep questions' },
              { icon: '✉️', text: 'Write tailored cover letters in seconds' },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3"
              >
                <span className="text-xl">{f.icon}</span>
                <span className="text-sm font-medium">{f.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white dark:bg-gray-950">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white font-bold">T</div>
            <span className="font-bold text-lg">TrackAI</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Email</label>
              <input {...register('email')} type="email" placeholder="you@example.com" autoFocus className={inputClass} />
              {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Password</label>
              </div>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <p className="text-[11px] text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-brand-500 text-white text-sm font-semibold rounded-xl hover:bg-brand-600 disabled:opacity-60 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Signing in...</>
              ) : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-500 hover:text-brand-600 font-medium">Create one →</Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl">
            <p className="text-[11px] font-semibold text-amber-700 mb-1">🚀 Demo credentials</p>
            <p className="text-[11px] text-amber-600">Email: demo@trackai.dev</p>
            <p className="text-[11px] text-amber-600">Password: Demo1234!</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
