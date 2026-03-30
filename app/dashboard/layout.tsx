import SidebarWrapper from '@/components/layout/SidebarWrapper';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarWrapper>
      {children}
    </SidebarWrapper>
  );
}