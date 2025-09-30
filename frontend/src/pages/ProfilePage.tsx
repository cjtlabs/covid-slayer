import { useAppSelector } from '../hooks/index.ts';
import { Card } from '../components/ui/Card.tsx';

export function ProfilePage() {
  const { user } = useAppSelector((s) => s.auth);

  return (
    <div className="layout-split">
      <Card title="Profile">
        {!user ? (
          <div className="empty-state">No profile loaded.</div>
        ) : (
          <div className="profile-details">
            <div className="profile-item"><span>Name</span><span>{user.fullname}</span></div>
            <div className="profile-item"><span>Email</span><span>{user.email}</span></div>
          </div>
        )}
      </Card>
    </div>
  );
}
