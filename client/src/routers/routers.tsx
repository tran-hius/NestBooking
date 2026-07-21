import Home from '@/pages/Home';
import Auth from '@/pages/Auth';
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import AdminLogin from '@/pages/admin/AdminLogin';
import PartnerAuth from '@/pages/partner/PartnerAuth';
import Search from '@/pages/Search';
import OTPVerification from '@/pages/OTPVerification';
import PersonalInfo from '@/pages/PersonalInfo';
import AdminLayout from '@/layouts/AdminLayout';
import Dashboard from '@/pages/admin/Dashboard';
import UserManagement from '@/pages/admin/UserManagement';
import AgentManagement from '@/pages/admin/AgentManagement';
import Notifications from '@/pages/admin/Notifications';
import Hotels from '@/pages/admin/Hotels';
import Bookings from '@/pages/admin/Bookings';
import Reviews from '@/pages/admin/Reviews';
import Payments from '@/pages/admin/Payments';
import Reports from '@/pages/admin/Reports';
import AuditLogs from '@/pages/admin/AuditLogs';

export const routers = [
  {
    path: '/',
    component: <Home />,
    layout: MainLayout,
  },
  {
    path: '/search',
    component: <Search />,
    layout: MainLayout,
  },
  {
    path: '/verify-otp',
    component: <OTPVerification />,
    layout: null,
  },
  {
    path: '/settings/personal-details',
    component: <PersonalInfo />,
    layout: MainLayout,
  },
  {
    path: '/login',
    component: <Auth />,
    layout: AuthLayout,
  },
  {
    path: '/register',
    component: <Auth />,
    layout: AuthLayout,
  },
  {
    path: '/admin/login',
    component: <AdminLogin />,
    layout: null,
  },
  {
    path: '/partner/register',
    component: <PartnerAuth />,
    layout: null,
  },
  {
    path: '/admin/dashboard',
    component: <Dashboard />,
    layout: AdminLayout,
  },
  {
    path: '/admin/users',
    component: <UserManagement />,
    layout: AdminLayout,
  },
  {
    path: '/admin/agents',
    component: <AgentManagement />,
    layout: AdminLayout,
  },
  {
    path: '/admin/notifications',
    component: <Notifications />,
    layout: AdminLayout,
  },
  {
    path: '/admin/hotels',
    component: <Hotels />,
    layout: AdminLayout,
  },
  {
    path: '/admin/bookings',
    component: <Bookings />,
    layout: AdminLayout,
  },
  {
    path: '/admin/reviews',
    component: <Reviews />,
    layout: AdminLayout,
  },
  {
    path: '/admin/payments',
    component: <Payments />,
    layout: AdminLayout,
  },
  {
    path: '/admin/reports',
    component: <Reports />,
    layout: AdminLayout,
  },
  {
    path: '/admin/audit',
    component: <AuditLogs />,
    layout: AdminLayout,
  },
];
