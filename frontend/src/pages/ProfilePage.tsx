import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth.store';
import { useResumes } from '../hooks/useApi';
import { format } from 'date-fns';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().max(500).optional(),
  linkedinUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

const inputClass = "w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-200 transition-all";
const labelClass = "block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5";

export const ProfilePage = () => {
  const { user, setUser } = useAuthStore();
  const { data: resumes } = useResumes();
  const [skills, setSkills] = useState<string[]>(user?.skills || []);
  const [targetRoles, setTargetRoles] = useState<string[]>(user?.targetRoles || []);
  const [newSkill, setNewSkill] = useState('');
  const [newRole, setNewRole] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio || '',
      linkedinUrl: user?.linkedinUrl || '',
      githubUrl: user?.githubUrl || '',
      portfolioUrl: user?.portfolioUrl || '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const res = await api.patch('/users/profile', { ...data, skills, targetRoles });
      setUser(res.data.data);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('resume', file);
    form.append('isDefault', 'true');
    try {
      await api.post('/resumes/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Resume uploaded!');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const addSkill = () => {
    const s = newSkill.trim();
    if (s && !skills.includes(s)) { setSkills([...skills, s]); setNewSkill(''); }
  };
  const addRole = () => {
    const r = newRole.trim();
    if (r && !targetRoles.includes(r)) { setTargetRoles([...targetRoles, r]); setNewRole(''); }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account and preferences</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Avatar + Name card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-5 mb-6">
            <div className="w-16 h-16 bg-brand-100 text-brand-500 rounded-2xl flex items-center justify-center text-2xl font-bold">
              {initials}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">{user?.name}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className="inline-block mt-1 text-[10px] font-medium bg-brand-50 text-brand-500 px-2 py-0.5 rounded-full uppercase">
                {user?.plan} Plan
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input {...register('name')} className={inputClass} />
              {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input value={user?.email || ''} disabled className={`${inputClass} opacity-60 cursor-not-allowed`} />
            </div>
          </div>

          <div className="mt-4">
            <label className={labelClass}>Bio</label>
            <textarea {...register('bio')} rows={3} placeholder="Tell us about yourself, your career goals..." className={`${inputClass} resize-none`} />
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Social & Portfolio</h2>
          <div className="space-y-4">
            {[
              { key: 'linkedinUrl', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/username', icon: '💼' },
              { key: 'githubUrl', label: 'GitHub URL', placeholder: 'https://github.com/username', icon: '🐙' },
              { key: 'portfolioUrl', label: 'Portfolio URL', placeholder: 'https://yoursite.com', icon: '🌐' },
            ].map(({ key, label, placeholder, icon }) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-lg w-8 text-center">{icon}</span>
                <div className="flex-1">
                  <label className={labelClass}>{label}</label>
                  <input
                    {...register(key as keyof FormData)}
                    type="url"
                    placeholder={placeholder}
                    className={inputClass}
                  />
                  {errors[key as keyof FormData] && (
                    <p className="text-[11px] text-red-500 mt-1">{(errors[key as keyof FormData] as { message?: string })?.message}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Skills</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {skills.map((s) => (
              <span key={s} className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-50 text-brand-600 text-xs font-medium rounded-full">
                {s}
                <button type="button" onClick={() => setSkills(skills.filter(sk => sk !== s))} className="text-brand-400 hover:text-red-500 text-xs">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
              placeholder="Add a skill (e.g. React, Python, AWS)..."
              className={`${inputClass} flex-1`}
            />
            <button type="button" onClick={addSkill} className="px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-xl hover:bg-brand-600 transition-colors">
              Add
            </button>
          </div>
        </div>

        {/* Target Roles */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Target Roles</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {targetRoles.map((r) => (
              <span key={r} className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                {r}
                <button type="button" onClick={() => setTargetRoles(targetRoles.filter(tr => tr !== r))} className="text-green-400 hover:text-red-500 text-xs">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRole(); } }}
              placeholder="Add target role (e.g. SWE Intern, ML Engineer)..."
              className={`${inputClass} flex-1`}
            />
            <button type="button" onClick={addRole} className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors">
              Add
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 text-white text-sm font-medium rounded-xl hover:bg-brand-600 disabled:opacity-60 transition-all"
          >
            {saving ? (
              <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Saving...</>
            ) : 'Save Profile'}
          </button>
        </div>
      </form>

      {/* Resume Section */}
      <div className="mt-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">📄 Resumes</h2>
          <label className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white text-xs font-medium rounded-xl hover:bg-brand-600 cursor-pointer transition-colors">
            {uploading ? 'Uploading...' : '+ Upload Resume'}
            <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResumeUpload} />
          </label>
        </div>
        {resumes && resumes.length > 0 ? (
          <div className="space-y-2.5">
            {resumes.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📄</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{r.fileName}</p>
                    <p className="text-[10px] text-gray-400">
                      {(r.fileSize / 1024).toFixed(0)} KB · Uploaded {format(new Date(r.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {r.isDefault && (
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Default</span>
                  )}
                  <a href={r.fileUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-brand-500 hover:text-brand-600 font-medium">View</a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No resumes uploaded yet.</p>
            <p className="text-xs mt-1">Upload a resume to use with AI tools.</p>
          </div>
        )}
      </div>
    </div>
  );
};
