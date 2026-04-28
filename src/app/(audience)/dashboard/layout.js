import UserLayout from '@/components/UserLayout';

export default function DashboardLayout({ children }) {
  return (
    <UserLayout>
      {children}
    </UserLayout>
  );
}
