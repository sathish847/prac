import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/AuthContext"
import {
  Search,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Menu,
  Home,
  BarChart3,
  Settings,
  LogOut,
  User,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  Building2,
  Waves
} from 'lucide-react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export default function Enquiry() {
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedEnquiry, setSelectedEnquiry] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { user, logout } = useAuth()

  const isDetailView = id && !searchParams.get('mode')

  useEffect(() => {
    if (isDetailView) {
      fetchEnquiryDetails()
    } else {
      fetchEnquiries()
    }
  }, [currentPage, id])

  // Handle refresh parameter to force data reload
  useEffect(() => {
    const refreshParam = searchParams.get('refresh')
    if (refreshParam && !isDetailView) {
      fetchEnquiries()
      // Clean up the URL by removing the refresh parameter
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.delete('refresh')
      const newUrl = `${window.location.pathname}${newSearchParams.toString() ? '?' + newSearchParams.toString() : ''}`
      window.history.replaceState({}, '', newUrl)
    }
  }, [searchParams, isDetailView])

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }

  const fetchEnquiries = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      })

      const response = await fetch(`${API_BASE_URL}/enquires?${params}`, {
        headers: getAuthHeaders(),
      })

      if (!response.ok) throw new Error('Failed to fetch enquiries')

      const data = await response.json()

      // Handle both response formats
      const enquiriesData = data.data || data
      const paginationData = data.pagination || {}
      setEnquiries(Array.isArray(enquiriesData) ? enquiriesData : [])
      setTotalPages(paginationData.totalPages || 1)
    } catch (error) {
      console.error('Error fetching enquiries:', error)
      setEnquiries([])
    } finally {
      setLoading(false)
    }
  }

  const fetchEnquiryDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/enquires/${id}`, {
        headers: getAuthHeaders(),
      })

      if (!response.ok) throw new Error('Failed to fetch enquiry details')

      const data = await response.json()
      // Handle both response formats
      setSelectedEnquiry(data.data || data)
    } catch (error) {
      console.error('Error fetching enquiry details:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/admin' },
    { icon: Building2, label: 'Properties', href: '/admin/properties' },
    { icon: Waves, label: 'Facilities', href: '/admin/facilities' },
    { icon: MessageSquare, label: 'Enquiries', href: '/admin/enquiries' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="mb-8">
            <img
              src="/logo-dark-full.png"
              alt="Loading..."
              className="h-16 w-auto object-contain mx-auto animate-pulse"
            />
          </div>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-primary mb-2">Loading Enquiries</h2>
            <p className="text-gray-600 text-sm">Please wait while we load your data...</p>
          </div>
          <div className="flex justify-center space-x-2 mt-6">
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  // Enquiry Detail View
  if (isDetailView) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/enquiries')}
              className="mb-4"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Enquiries
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Enquiry Details</h1>
          </div>

          {selectedEnquiry && (
            <Card>
              <CardHeader>
                <CardTitle>{selectedEnquiry.subject || 'Enquiry'}</CardTitle>
                <CardDescription>Customer enquiry details and information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Name</Label>
                    <p className="text-gray-700">{selectedEnquiry.name || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-gray-700">{selectedEnquiry.email || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <p className="text-gray-700">{selectedEnquiry.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Property Interest</Label>
                    <p className="text-gray-700">{selectedEnquiry.property_id || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <p className="text-gray-700">{new Date(selectedEnquiry.createdAt || selectedEnquiry.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Message</Label>
                  <p className="text-gray-700 mt-2 p-3 bg-gray-50 rounded-md">{selectedEnquiry.message || 'No message provided'}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  // Local search filtering
  const filteredEnquiries = enquiries.filter((enquiry) => {
    // Search filtering
    if (!searchTerm.trim()) return true

    const searchLower = searchTerm.toLowerCase()
    const name = (enquiry.name || '').toLowerCase()
    const email = (enquiry.email || '').toLowerCase()
    const phone = (enquiry.phone || '').toLowerCase()
    const subject = (enquiry.subject || '').toLowerCase()
    const message = (enquiry.message || '').toLowerCase()

    return (
      name.includes(searchLower) ||
      email.includes(searchLower) ||
      phone.includes(searchLower) ||
      subject.includes(searchLower) ||
      message.includes(searchLower)
    )
  })

  // Enquiries List View with Sidebar
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
              <h1 className="text-2xl font-bold text-gray-900">Enquiries</h1>
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                <MessageSquare className="h-4 w-4" />
                <span>Management</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="hidden md:flex">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Customer Enquiries</h1>
                <p className="text-gray-600 mt-1">Manage customer enquiries and requests</p>
              </div>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search enquiries..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* Enquiries Table */}
            <Card>
              <CardHeader>
                <CardTitle>Enquiry Listings</CardTitle>
                <CardDescription>
                  A comprehensive list of all customer enquiries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Customer</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Contact</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Subject</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEnquiries.map((enquiry) => (
                        <tr
                          key={enquiry.id || enquiry._id || Math.random()}
                          className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={async () => {
                            try {
                              // Fetch fresh enquiry details for preview
                              const response = await fetch(`${API_BASE_URL}/enquires/${enquiry.id || enquiry._id}`, {
                                headers: getAuthHeaders(),
                              })

                              if (!response.ok) throw new Error('Failed to fetch enquiry details')

                              const data = await response.json()
                              setSelectedEnquiry(data.data || data)
                              setShowPreview(true)
                            } catch (error) {
                              console.error('Error fetching enquiry details for preview:', error)
                              // Fallback to table data if fetch fails
                              setSelectedEnquiry(enquiry)
                              setShowPreview(true)
                            }
                          }}
                        >
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-gray-900">
                                {enquiry.name || 'Anonymous'}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {enquiry.id || enquiry._id || 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-700">
                              <div className="flex items-center space-x-1">
                                <Mail className="h-3 w-3" />
                                <span>{enquiry.email || 'N/A'}</span>
                              </div>
                              <div className="flex items-center space-x-1 mt-1">
                                <Phone className="h-3 w-3" />
                                <span>{enquiry.phone || 'N/A'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-700">
                            <div>
                              <div className="font-medium">{enquiry.subject || 'General Enquiry'}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {enquiry.message?.substring(0, 50)}...
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-700">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span className="text-sm">
                                {new Date(enquiry.createdAt || enquiry.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/admin/enquiries/${enquiry.id || enquiry._id}`)}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enquiry Preview Modal */}
            {showPreview && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {selectedEnquiry?.subject || 'Enquiry Details'}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPreview(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Customer enquiry details and information</p>
                    {selectedEnquiry && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Name:</span>
                            <p className="text-gray-900 mt-1">{selectedEnquiry.name || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Email:</span>
                            <p className="text-gray-900 mt-1">{selectedEnquiry.email || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Phone:</span>
                            <p className="text-gray-900 mt-1">{selectedEnquiry.phone || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Date:</span>
                            <p className="text-gray-900 mt-1">
                              {new Date(selectedEnquiry.createdAt || selectedEnquiry.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Subject:</span>
                            <p className="text-gray-900 mt-1">{selectedEnquiry.subject || 'General Enquiry'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Message:</span>
                            <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded-md">{selectedEnquiry.message || 'No message provided'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
