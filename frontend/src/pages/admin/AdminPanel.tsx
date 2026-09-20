import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Trash2, Power } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { adminService } from '@/services/interviewService';

export default function AdminPanel() {
  const qc = useQueryClient();

  const { data: analytics } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminService.analytics().then((r) => r.data.data),
  });

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminService.listUsers({ limit: 50 }).then((r) => r.data.data.users),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => adminService.toggleActive(id),
    onSuccess: () => {
      toast.success('User status updated');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteUser(id),
    onSuccess: () => {
      toast.success('User deleted');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card>
          <p className="text-xs text-slate">Total users</p>
          <p className="mt-2 font-display text-3xl font-semibold text-paper">{analytics?.totalUsers ?? '–'}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate">Total interviews</p>
          <p className="mt-2 font-display text-3xl font-semibold text-signal">{analytics?.totalInterviews ?? '–'}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate">Platform avg score</p>
          <p className="mt-2 font-display text-3xl font-semibold text-mint">{analytics?.averageScore ?? '–'}</p>
        </Card>
      </div>

      <Card>
        <h3 className="mb-4 font-display text-base font-semibold text-paper">Manage users</h3>
        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : (
          <div className="divide-y divide-neutral/5">
            {users?.map((u: any) => (
              <div key={u._id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-paper">{u.name}</p>
                  <p className="text-xs text-slate">{u.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={u.isActive ? 'mint' : 'coral'}>{u.isActive ? 'Active' : 'Deactivated'}</Badge>
                  <button
                    onClick={() => toggleMutation.mutate(u._id)}
                    className="rounded-lg p-2 text-slate-light hover:bg-neutral/5 hover:text-signal"
                    title="Toggle active"
                  >
                    <Power className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete ${u.name}?`)) deleteMutation.mutate(u._id);
                    }}
                    className="rounded-lg p-2 text-slate-light hover:bg-coral/10 hover:text-coral"
                    title="Delete user"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
