import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Camera } from 'lucide-react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/interviewService';

interface ProfileForm {
  name: string;
  bio: string;
  targetRole: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
}

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<ProfileForm>({
    defaultValues: { name: user?.name, bio: user?.bio, targetRole: user?.targetRole },
  });

  const {
    register: registerPw,
    handleSubmit: handlePwSubmit,
    reset: resetPw,
    formState: { isSubmitting: pwSubmitting },
  } = useForm<PasswordForm>();

  const onSubmit = async (values: ProfileForm) => {
    try {
      await userService.updateProfile(values);
      await refreshUser();
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Update failed');
    }
  };

  const onPasswordSubmit = async (values: PasswordForm) => {
    try {
      await userService.changePassword(values);
      toast.success('Password changed');
      resetPw();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Password change failed');
    }
  };

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarLoading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      await userService.uploadAvatar(formData);
      await refreshUser();
      toast.success('Avatar updated');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Upload failed');
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card className="flex items-center gap-5">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-signal/20 font-display text-2xl font-semibold text-signal">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              user?.name?.charAt(0).toUpperCase()
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarLoading}
            className="absolute -bottom-1 -right-1 rounded-full bg-signal p-1.5 text-oninverse shadow-glow"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={onAvatarChange} />
        </div>
        <div>
          <p className="font-display text-lg font-semibold text-paper">{user?.name}</p>
          <p className="text-sm text-slate-light">{user?.email}</p>
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 font-display text-base font-semibold text-paper">Edit profile</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Full name" {...register('name')} />
          <Input label="Target role" placeholder="e.g. SDE-2 at a product company" {...register('targetRole')} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-light">Bio</label>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-neutral/10 bg-ink-700 px-4 py-2.5 text-sm text-paper outline-none focus:border-signal/60"
              {...register('bio')}
            />
          </div>
          <Button type="submit" isLoading={isSubmitting}>Save changes</Button>
        </form>
      </Card>

      <Card>
        <h3 className="mb-4 font-display text-base font-semibold text-paper">Change password</h3>
        <form onSubmit={handlePwSubmit(onPasswordSubmit)} className="space-y-4">
          <Input label="Current password" type="password" {...registerPw('currentPassword', { required: true })} />
          <Input label="New password" type="password" {...registerPw('newPassword', { required: true, minLength: 8 })} />
          <Button type="submit" variant="secondary" isLoading={pwSubmitting}>Update password</Button>
        </form>
      </Card>
    </div>
  );
}
