import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateApplication, useUpdateApplication } from '../../hooks/useApi';
import type { Application } from '../../types';

const schema = z.object({
  companyName: z.string().min(1, 'Company name required'),
  role: z.string().min(1, 'Role required'),
  status: z.enum(['APPLIED', 'OA', 'INTERVIEW', 'REJECTED', 'OFFER']),
  appliedDate: z.string().optional(),
  location: z.string().optional(),
  jobLink: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  salary: z.string().optional(),
  notes: z.string().optional(),
  nextActionDate: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  source: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
});

type FormData = z.infer<typeof schema>;

interface Props {
  application?: Application;
  onClose: () => void;
}

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
    {children}
    {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
  </div>
);

const inputClass = "w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-all";

export const ApplicationModal = ({ application, onClose }: Props) => {
  const isEdit = !!application;
  const create = useCreateApplication();
  const update = useUpdateApplication();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: application ? {
      companyName: application.companyName,
      role: application.role,
      status: application.status,
      appliedDate: application.appliedDate?.slice(0, 10),
      location: application.location || '',
      jobLink: application.jobLink || '',
      salary: application.salary || '',
      notes: application.notes || '',
      nextActionDate: application.nextActionDate?.slice(0, 10) || '',
      contactName: application.contactName || '',
      contactEmail: application.contactEmail || '',
      source: application.source || '',
      priority: application.priority,
    } : {
      status: 'APPLIED',
      priority: 'MEDIUM',
      appliedDate: new Date().toISOString().slice(0, 10),
    },
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const onSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      appliedDate: data.appliedDate ? new Date(data.appliedDate).toISOString() : undefined,
      nextActionDate: data.nextActionDate ? new Date(data.nextActionDate).toISOString() : undefined,
    };
    if (isEdit) {
      await update.mutateAsync({ id: application!.id, ...payload });
    } else {
      await create.mutateAsync(payload);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {isEdit ? 'Edit Application' : 'Add Application'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {isEdit ? `Editing ${application!.companyName}` : 'Track a new job application'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto max-h-[75vh]">
            <div className="px-6 py-5 space-y-5">
              {/* Core Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Company Name *" error={errors.companyName?.message}>
                  <input {...register('companyName')} placeholder="Google, Stripe, Vercel..." className={inputClass} autoFocus />
                </Field>
                <Field label="Role *" error={errors.role?.message}>
                  <input {...register('role')} placeholder="Software Engineer Intern" className={inputClass} />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Status" error={errors.status?.message}>
                  <select {...register('status')} className={inputClass}>
                    <option value="APPLIED">Applied</option>
                    <option value="OA">Online Assessment</option>
                    <option value="INTERVIEW">Interview</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="OFFER">Offer</option>
                  </select>
                </Field>
                <Field label="Priority" error={errors.priority?.message}>
                  <select {...register('priority')} className={inputClass}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </Field>
                <Field label="Applied Date">
                  <input {...register('appliedDate')} type="date" className={inputClass} />
                </Field>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Location" error={errors.location?.message}>
                  <input {...register('location')} placeholder="San Francisco, CA / Remote" className={inputClass} />
                </Field>
                <Field label="Salary / Compensation">
                  <input {...register('salary')} placeholder="$120k / $45/hr" className={inputClass} />
                </Field>
              </div>

              <Field label="Job Posting URL" error={errors.jobLink?.message}>
                <input {...register('jobLink')} type="url" placeholder="https://careers.company.com/job/123" className={inputClass} />
              </Field>

              {/* Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Contact Name">
                  <input {...register('contactName')} placeholder="Recruiter or hiring manager" className={inputClass} />
                </Field>
                <Field label="Contact Email" error={errors.contactEmail?.message}>
                  <input {...register('contactEmail')} type="email" placeholder="recruiter@company.com" className={inputClass} />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Source">
                  <select {...register('source')} className={inputClass}>
                    <option value="">Select source</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="company-site">Company Website</option>
                    <option value="referral">Referral</option>
                    <option value="indeed">Indeed</option>
                    <option value="handshake">Handshake</option>
                    <option value="other">Other</option>
                  </select>
                </Field>
                <Field label="Next Action Date">
                  <input {...register('nextActionDate')} type="date" className={inputClass} />
                </Field>
              </div>

              <Field label="Notes">
                <textarea
                  {...register('notes')}
                  rows={3}
                  placeholder="Interview details, follow-up reminders, recruiter notes..."
                  className={`${inputClass} resize-none`}
                />
              </Field>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 disabled:opacity-60 transition-all"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Saving...
                  </span>
                ) : (isEdit ? 'Save Changes' : 'Add Application')}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
