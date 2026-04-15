import SidebarWrapper from '@/components/layout/SidebarWrapper';
import ThemeToggle from '@/components/ThemeToggle';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-body" style={{ 
      minHeight: '100vh',
      background: '#060d1f',
      minWidth: '600px',
    }}>
      <SidebarWrapper>

        {/* Theme toogle in coltul din dreapta sus */}
        <div className="w-full flex justify-end p-4">
          <ThemeToggle />
        </div>

        {children}
      </SidebarWrapper>
    </div>
  );
}
