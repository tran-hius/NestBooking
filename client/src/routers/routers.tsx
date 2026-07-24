import { lazy } from 'react';

// Layouts (keep static to avoid layout flickering)
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import AdminLayout from '@/layouts/AdminLayout';
import AgentLayout from '@/layouts/AgentLayout';

// Pages (lazy load for performance)
const Home = lazy(() => import('@/pages/Home'));
const Auth = lazy(() => import('@/pages/Auth'));
const AdminLogin = lazy(() => import('@/pages/admin/AdminLogin'));
const PartnerAuth = lazy(() => import('@/pages/partner/PartnerAuth'));
const Search = lazy(() => import('@/pages/Search'));
const OTPVerification = lazy(() => import('@/pages/OTPVerification'));
const PersonalInfo = lazy(() => import('@/pages/PersonalInfo'));
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'));
const AgentDashboard = lazy(() => import('@/pages/partner/AgentDashboard'));
const UserManagement = lazy(() => import('@/pages/admin/UserManagement'));
const AgentManagement = lazy(() => import('@/pages/admin/AgentManagement'));
const Notifications = lazy(() => import('@/pages/admin/Notifications'));
const Hotels = lazy(() => import('@/pages/admin/Hotels'));
const Bookings = lazy(() => import('@/pages/admin/Bookings'));
const Reviews = lazy(() => import('@/pages/admin/Reviews'));
const Payments = lazy(() => import('@/pages/admin/Payments'));
const Reports = lazy(() => import('@/pages/admin/Reports'));
const AuditLogs = lazy(() => import('@/pages/admin/AuditLogs'));
const MyBookings = lazy(() => import('@/pages/MyBookings'));
const Checkout = lazy(() => import('@/pages/Checkout'));

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
  {
    path: '/partner/dashboard',
    component: <AgentDashboard />,
    layout: AgentLayout,
  },
  {
    path: '/my-bookings',
    component: <MyBookings />,
    layout: MainLayout,
  },
  {
    path: '/checkout',
    component: <Checkout />,
    layout: MainLayout,
  },
];
