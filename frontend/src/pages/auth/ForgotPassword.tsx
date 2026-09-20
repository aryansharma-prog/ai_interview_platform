import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import AuthLayout from './AuthLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { authService } from '@/services/authService';

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<{ email: string }>();

  const onSubmit = async (values: { email: string }) => {
    setLoading(true);
    try {
      await authService.forgotPassword(values.email);
      setSent(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset your password" subtitle="We'll email you a reset link.">
      {sent ? (
        <p className="rounded-xl border border-mint/20 bg-mint/10 p-4 text-sm text-mint">
          If that email exists in our system, a reset link is on its way.
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Email" type="email" placeholder="you@example.com" {...register('email', { required: true })} />
          <Button type="submit" className="w-full" isLoading={loading}>
            Send reset link
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-slate-light">
        <Link to="/login" className="font-medium text-signal hover:underline">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
}
