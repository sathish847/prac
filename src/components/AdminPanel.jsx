import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from '@/contexts/AuthContext'
import {
  Menu,
  Home,
  Users,
  Settings,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  TrendingUp,
  Activity,
  DollarSign,
  ShoppingCart,
  Building2,
  Waves,
  MessageSquare
} from 'lucide-react'

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/admin' },
  { icon: Building2, label: 'Properties', href: '/admin/properties' },
  { icon: Waves, label: 'Facilities', href: '/admin/facilities' },
  { icon: MessageSquare, label: 'Enquiries', href: '/admin/enquiries' },
]

export default function AdminPanel() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  useEffect(() => {
    // Simulate dashboard data loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500) // Show loading for 1.5 seconds

    return () => clearTimeout(timer)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/auth/sign-in')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo/Brand Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <img
            src="/logo-sm.png"
            alt="Shri Shri Mahaperiyavaa Housing and Properties Pvt Ltd. Logo"
            className="w-8 h-8 object-contain"
          />
          {!sidebarCollapsed && (
            <div>
              <h2 className="text-primary font-bold text-sm leading-tight">Shri Shri Mahaperiyavaa</h2>
              <p className="text-gray-500 text-xs">Housing & Properties</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            className={`w-full justify-start hover:bg-primary/10 hover:text-primary transition-all duration-200 group ${
              sidebarCollapsed ? 'px-3' : 'px-4'
            }`}
            onClick={() => {
              navigate(item.href)
              setMobileMenuOpen(false)
            }}
          >
            <item.icon className="h-5 w-5 text-gray-500 group-hover:text-primary group-hover:scale-110 transition-all" />
            {!sidebarCollapsed && (
              <span className="ml-3 text-gray-700 group-hover:text-primary transition-colors">
                {item.label}
              </span>
            )}
          </Button>
        ))}
      </nav>

      {/* User Section & Logout */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        {!sidebarCollapsed && (
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 text-sm font-medium truncate">Admin User</p>
              <p className="text-gray-500 text-xs truncate">{user?.email || 'admin@example.com'}</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          className={`w-full justify-start hover:bg-red-50 hover:text-red-600 transition-all duration-200 ${
            sidebarCollapsed ? 'px-3' : 'px-4'
          }`}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          {!sidebarCollapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </div>
  )

  // Show loading screen while dashboard is loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          {/* Logo */}
          <div className="mb-8">
            <img
              src="/logo-dark-full.png"
              alt="Shri Shri Mahaperiyavaa Housing and Properties Pvt Ltd. Logo"
              className="h-16 w-auto object-contain mx-auto animate-pulse"
            />
          </div>

          {/* Loading Text */}
          <div className="mb-4">
            <h2 className="text-xl font-bold text-primary mb-2 leading-tight">Loading Dashboard</h2>
            <p className="text-gray-600 text-sm">Please wait while we load your data...</p>
          </div>

          {/* Loading Animation */}
          <div className="flex justify-center space-x-2 mt-6">
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Desktop Sidebar */}
      <div className={`hidden md:flex flex-col transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'w-20' : 'w-72'
      }`}>
        <SidebarContent />
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full hover:bg-primary/10 text-gray-500 hover:text-primary"
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden fixed top-4 left-4 z-50 bg-white shadow-lg hover:shadow-xl transition-shadow"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 border-r-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4 md:ml-0 ml-16 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                <Home className="h-4 w-4" />
                <span>Overview</span>
              </div>
            </div>

          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Users</p>
                  <p className="text-gray-900 text-3xl font-bold">12,345</p>
                  <p className="text-green-600 text-xs mt-1 font-medium">+12% from last month</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Revenue</p>
                  <p className="text-gray-900 text-3xl font-bold">$45,678</p>
                  <p className="text-green-600 text-xs mt-1 font-medium">+8% from last month</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Orders</p>
                  <p className="text-gray-900 text-3xl font-bold">1,234</p>
                  <p className="text-green-600 text-xs mt-1 font-medium">+15% from last month</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Growth</p>
                  <p className="text-gray-900 text-3xl font-bold">23.5%</p>
                  <p className="text-green-600 text-xs mt-1 font-medium">+5% from last month</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">New user registered</p>
                    <p className="text-gray-500 text-sm">2 minutes ago</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
