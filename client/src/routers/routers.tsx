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
const PropertyTypeSelection = lazy(() => import('@/pages/partner/PropertyTypeSelection'));
const Search = lazy(() => import('@/pages/Search'));
const OTPVerification = lazy(() => import('@/pages/OTPVerification'));
const PersonalInfo = lazy(() => import('@/pages/PersonalInfo'));
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'));
const AgentDashboard = lazy(() => import('@/pages/partner/AgentDashboard'));
const AgentHotels = lazy(() => import('@/pages/partner/AgentHotels'));
const AgentHotelForm = lazy(() => import('@/pages/partner/AgentHotelForm'));
const AgentRoomTypes = lazy(() => import('@/pages/partner/AgentRoomTypes'));
const AgentRooms = lazy(() => import('@/pages/partner/AgentRooms'));
const AgentBookings = lazy(() => import('@/pages/partner/AgentBookings'));
const UserManagement = lazy(() => import('@/pages/admin/UserManagement'));
const AgentManagement = lazy(() => import('@/pages/admin/AgentManagement'));
const Hotels = lazy(() => import('@/pages/admin/Hotels'));
const Bookings = lazy(() => import('@/pages/admin/Bookings'));
const MyBookings = lazy(() => import('@/pages/MyBookings'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const HotelDetail = lazy(() => import('@/pages/HotelDetail'));
const Destinations = lazy(() => import('@/pages/admin/Destinations'));
const Support = lazy(() => import('@/pages/Support'));

export const routers = [
  {
    path: '/',
    component: <Home />,
    layout: MainLayout,
  },
  {
    path: '/hotel/:id',
    component: <HotelDetail />,
    layout: MainLayout,
  },
  {
    path: '/search',
    component: <Search />,
    layout: MainLayout,
  },
  {
    path: '/support',
    component: <Support />,
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
      path: '/partner/property-type',
      component: <PropertyTypeSelection />,
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
    path: '/admin/destinations',
    component: <Destinations />,
    layout: AdminLayout,
  },
  {
    path: '/partner/dashboard',
    component: <AgentDashboard />,
    layout: AgentLayout,
  },
  {
    path: '/partner/hotels',
    component: <AgentHotels />,
    layout: AgentLayout,
  },
  {
    path: '/partner/hotels/new',
    component: <AgentHotelForm />,
    layout: AgentLayout,
  },
  {
    path: '/partner/hotels/:hotelId',
    component: <AgentHotelForm />,
    layout: AgentLayout,
  },
  {
    path: '/partner/hotels/:hotelId/room-types',
    component: <AgentRoomTypes />,
    layout: AgentLayout,
  },
  {
    path: '/partner/hotels/:hotelId/rooms',
    component: <AgentRooms />,
    layout: AgentLayout,
  },
  {
    path: '/partner/bookings',
    component: <AgentBookings />,
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

