import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth.store';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Need one uppercase letter')
    .regex(/[0-9]/, 'Need one number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
type FormData = z.infer<typeof schema>;

const inputClass = "w-full px-4 py-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-all";

export const SignupPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const password = watch('password', '');
  const strength = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post('/auth/signup', {
        name: data.name, email: data.email, password: data.password,
      });
      const { user, accessToken, refreshToken } = res.data.data;
      setAuth(user, accessToken, refreshToken);
      toast.success(`Welcome to TrackAI, ${user.name.split(' ')[0]}! 🎉`);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-white dark:bg-gray-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white font-bold">T</div>
          <span className="font-bold text-lg text-gray-900 dark:text-white">TrackAI</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Create your account</h1>
        <p className="text-gray-500 text-sm mb-8">Start tracking your job applications with AI</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Full Name</label>
            <input {...register('name')} placeholder="Aryan Kumar" autoFocus className={inputClass} />
            {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Email</label>
            <input {...register('email')} type="email" placeholder="you@example.com" className={inputClass} />
            {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Password</label>
            <div className="relative">
              <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="Min 8 chars, 1 uppercase, 1 number" className={`${inputClass} pr-10`} />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
            {/* Strength meter */}
            {password && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1,2,3,4].map((s) => (
                    <div key={s} className={`h-1 flex-1 rounded-full transition-all ${
                      strength >= s
                        ? s <= 1 ? 'bg-red-400' : s <= 2 ? 'bg-amber-400' : s <= 3 ? 'bg-yellow-400' : 'bg-green-400'
                        : 'bg-gray-200'
                    }`} />
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  {strength <= 1 ? 'Weak' : strength <= 2 ? 'Fair' : strength <= 3 ? 'Good' : 'Strong'} password
                </p>
              </div>
            )}
            {errors.password && <p className="text-[11px] text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Confirm Password</label>
            <input {...register('confirmPassword')} type="password" placeholder="Repeat your password" className={inputClass} />
            {errors.confirmPassword && <p className="text-[11px] text-red-500 mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-brand-500 text-white text-sm font-semibold rounded-xl hover:bg-brand-600 disabled:opacity-60 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting ? (
              <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Creating account...</>
            ) : 'Create account →'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-500 hover:text-brand-600 font-medium">Sign in</Link>
        </p>

        <p className="text-center text-[10px] text-gray-400 mt-4">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
};
