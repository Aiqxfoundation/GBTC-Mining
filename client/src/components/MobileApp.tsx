import { useState, useEffect } from "react";
import { Route, Switch, Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import MiningDashboard from "@/pages/mining-dashboard.tsx";
import PurchasePowerPage from "@/pages/purchase-power-page.tsx";
import DepositPage from "@/pages/deposit-page.tsx";
import WithdrawPage from "@/pages/withdraw-page.tsx";
import TransferPage from "@/pages/transfer-page.tsx";
import GlobalInfoPage from "@/pages/global-info-page.tsx";
import ReferralPage from "@/pages/referral-page.tsx";
import AdminPage from "@/pages/admin-page";
import { ProtectedRoute } from "@/lib/protected-route";

export default function MobileApp() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [showBottomNav, setShowBottomNav] = useState(true);

  // Hide bottom nav on certain pages
  useEffect(() => {
    const hideNavPages = ["/", "/auth"];
    setShowBottomNav(!hideNavPages.includes(location));
  }, [location]);

  const navItems = [
    { 
      path: "/dashboard", 
      icon: "fas fa-cube", 
      label: "Mine",
      color: "text-primary"
    },
    { 
      path: "/deposit", 
      icon: "fas fa-wallet", 
      label: "Deposit",
      color: "text-accent"
    },
    { 
      path: "/power", 
      icon: "fas fa-microchip", 
      label: "Hashrate",
      color: "text-chart-4"
    },
    { 
      path: "/global", 
      icon: "fas fa-globe", 
      label: "Global",
      color: "text-chart-3"
    },
    { 
      path: "/referral", 
      icon: "fas fa-users", 
      label: "Referral",
      color: "text-chart-5"
    }
  ];

  if (user?.isAdmin) {
    navItems.push({
      path: "/admin",
      icon: "fas fa-cog",
      label: "Admin",
      color: "text-destructive"
    });
  }

  return (
    <div className="mobile-app">
      {/* Main Content Area */}
      <div className={`app-content ${showBottomNav ? 'pb-20' : ''}`}>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/auth" component={AuthPage} />
          <ProtectedRoute path="/dashboard" component={MiningDashboard} />
          <ProtectedRoute path="/power" component={PurchasePowerPage} />
          <ProtectedRoute path="/deposit" component={DepositPage} />
          <ProtectedRoute path="/withdraw" component={WithdrawPage} />
          <ProtectedRoute path="/transfer" component={TransferPage} />
          <ProtectedRoute path="/global" component={GlobalInfoPage} />
          <ProtectedRoute path="/referral" component={ReferralPage} />
          <ProtectedRoute path="/admin" component={AdminPage} />
        </Switch>
      </div>

      {/* Bottom Navigation */}
      {showBottomNav && user && (
        <nav className="bottom-nav">
          <div className="nav-container">
            {navItems.map((item) => {
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <button
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    data-testid={`nav-${item.label.toLowerCase()}`}
                  >
                    <i className={`${item.icon} nav-icon ${isActive ? item.color : 'text-muted-foreground'}`}></i>
                    <span className={`nav-label ${isActive ? item.color : 'text-muted-foreground'}`}>
                      {item.label}
                    </span>
                    {isActive && (
                      <div className="nav-indicator" />
                    )}
                  </button>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}