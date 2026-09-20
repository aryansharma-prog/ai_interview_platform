import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import AuthLayout from './AuthLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { authService } from '@/services/authService';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<{ newPassword: string }>();

  const onSubmit = async (values: { newPassword: string }) => {
    setLoading(true);
    try {
      await authService.resetPassword(token, values.newPassword);
      toast.success('Password reset. Please log in.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Set a new password" subtitle="Make it something memorable.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="New password"
          type="password"
          placeholder="At least 8 characters"
          {...register('newPassword', { required: true, minLength: 8 })}
        />
        <Button type="submit" className="w-full" isLoading={loading}>
          Reset password
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-light">
        <Link to="/login" className="font-medium text-signal hover:underline">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
}
