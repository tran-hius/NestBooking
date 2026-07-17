import Home from '@/pages/Home';
import Auth from '@/pages/Auth';
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import AdminLogin from '@/pages/admin/AdminLogin';
import PartnerAuth from '@/pages/partner/PartnerAuth';
import Search from '@/pages/Search';

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
];
