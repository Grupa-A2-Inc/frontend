import SidebarWrapper from '@/components/layout/SidebarWrapper';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-body" style={{
      minHeight: '100vh',
      background: '#060d1f',
      minWidth: '600px',
    }}>
      <SidebarWrapper>
        {children}
      </SidebarWrapper>
    </div>
  );
}
