import Home from '@/pages/Home';
import Auth from '@/pages/Auth';
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import AdminLogin from '@/pages/admin/AdminLogin';

export const routers = [
  {
    path: '/',
    component: <Home />,
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
];
