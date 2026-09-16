import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { PublicLayout } from './components/PublicLayout';

// Pages
import { Landing } from './pages/Landing';
import { About } from './pages/About';
import { Pricing } from './pages/Pricing';
import { Coaches } from './pages/Coaches';
import { Contact } from './pages/Contact';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Members } from './pages/Members';
import { Payments } from './pages/Payments';
import { Inventory } from './pages/Inventory';
import { Exercises } from './pages/Exercises';
import { WorkoutPlans } from './pages/WorkoutPlans';
import { WorkoutPlanEdit } from './pages/WorkoutPlanEdit';
import { DietPlans } from './pages/DietPlans';
import { DietPlanEdit } from './pages/DietPlanEdit';
import { Plans } from './pages/Plans';
import { Messenger } from './pages/Messenger';
import { Report } from './pages/Report';
import { Staff } from './pages/Staff';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import { Calculator } from './pages/Calculator';
import { Timer } from './pages/Timer';
import { Logs } from './pages/Logs';
import { MarketplacePlanDetail } from './pages/MarketplacePlanDetail';
import { Marketplace } from './pages/Marketplace';
import { TrainerPlans } from './pages/TrainerPlans';
import { AdminMarketplace } from './pages/AdminMarketplace';
import MyPurchases from './pages/MyPurchases';
import TrainerRefunds from './pages/TrainerRefunds';
import CoinShop from './pages/CoinShop';
import Shop from './pages/Shop';
import ShopProductDetail from './pages/ShopProductDetail';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes with Public Layout (Header + Footer) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/coaches" element={<Coaches />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/:id" element={<MarketplacePlanDetail />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:id" element={<ShopProductDetail />} />
          <Route path="/coin-shop" element={<CoinShop />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />



        {/* Protected Application Routes with Layout Shell */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard / Overview */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'STAFF', 'TRAINER']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Members */}
          <Route
            path="/members"
            element={
              <ProtectedRoute requiredPerm="MEMBERS">
                <Members />
              </ProtectedRoute>
            }
          />

          {/* Payments */}
          <Route
            path="/payments"
            element={
              <ProtectedRoute requiredPerm="PAYMENTS">
                <Payments />
              </ProtectedRoute>
            }
          />

          {/* Inventory */}
          <Route
            path="/inventory"
            element={
              <ProtectedRoute requiredPerm="INVENTORY">
                <Inventory />
              </ProtectedRoute>
            }
          />

          {/* Workout Plans */}
          <Route
            path="/workout-plans"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'TRAINER']}>
                <WorkoutPlans />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workout-plans/new"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'TRAINER']}>
                <WorkoutPlanEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workout-plans/:id"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'TRAINER']}>
                <WorkoutPlanEdit />
              </ProtectedRoute>
            }
          />

          {/* Diet Plans */}
          <Route
            path="/diet-plans"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'TRAINER']}>
                <DietPlans />
              </ProtectedRoute>
            }
          />
          <Route
            path="/diet-plans/new"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'TRAINER']}>
                <DietPlanEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/diet-plans/:id"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'TRAINER']}>
                <DietPlanEdit />
              </ProtectedRoute>
            }
          />

          {/* Exercise Library */}
          <Route
            path="/exercises"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'TRAINER']}>
                <Exercises />
              </ProtectedRoute>
            }
          />

          {/* Subscription Plans */}
          <Route
            path="/plans"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Plans />
              </ProtectedRoute>
            }
          />

          {/* Marketplace */}
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/:id" element={<MarketplacePlanDetail />} />
          <Route path="/my-purchases" element={<MyPurchases />} />
          <Route
            path="/trainer-plans"
            element={
              <ProtectedRoute allowedRoles={['TRAINER', 'ADMIN']}>
                <TrainerPlans />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trainer-refunds"
            element={
              <ProtectedRoute allowedRoles={['TRAINER', 'ADMIN']}>
                <TrainerRefunds />
              </ProtectedRoute>
            }
          />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:id" element={<ShopProductDetail />} />
          <Route path="/coin-shop" element={<CoinShop />} />
          <Route
            path="/admin/marketplace"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminMarketplace />
              </ProtectedRoute>
            }
          />

          {/* Messenger Chat */}
          <Route path="/messenger" element={<Messenger />} />

          {/* Reports & Analytics */}
          <Route
            path="/report"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'STAFF', 'TRAINER']}>
                <Report />
              </ProtectedRoute>
            }
          />

          {/* Staff & Users */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Staff />
              </ProtectedRoute>
            }
          />

          {/* Settings */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* System Logs */}
          <Route
            path="/logs"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Logs />
              </ProtectedRoute>
            }
          />

          {/* Profile */}
          <Route path="/profile" element={<Profile />} />

          {/* Free Tools — now inside main Layout with professional nav */}
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/timer" element={<Timer />} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
