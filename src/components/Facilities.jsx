import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/AuthContext"
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Menu,
  Home,
  BarChart3,
  Settings,
  LogOut,
  User,
  Waves
} from 'lucide-react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export default function Facilities() {
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedFacility, setSelectedFacility] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Add Facility Form State
  const [formData, setFormData] = useState({
    property: '',
    type: '',
    title: '',
    description: '',
    is_active: true,
    meta: {
      capacity: '',
      timings: ''
    },
    image_url: ''
  })
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { user, logout } = useAuth()

  const isAddMode = searchParams.get('mode') === 'add'
  const isEditMode = searchParams.get('mode') === 'edit' && id
  const isDetailView = id && !isEditMode && !isAddMode

  useEffect(() => {
    if (isDetailView || isEditMode) {
      fetchFacilityDetails()
    } else if (!isAddMode) {
      fetchFacilities()
    } else {
      setLoading(false)
    }
  }, [currentPage, statusFilter, typeFilter, id])

  // Populate form data when editing
  useEffect(() => {
    if (isEditMode && selectedFacility) {
      const newFormData = {
        property: selectedFacility.property ?? '',
        type: selectedFacility.type ?? '',
        title: selectedFacility.title ?? '',
        description: selectedFacility.description ?? '',
        is_active: selectedFacility.is_active ?? true,
        meta: {
          capacity: selectedFacility.meta?.capacity ? selectedFacility.meta.capacity.toString() : '',
          timings: selectedFacility.meta?.timings ?? ''
        },
        image_url: selectedFacility.image_url ?? ''
      }
      setFormData(newFormData)
    }
  }, [isEditMode, selectedFacility])

  // Handle refresh parameter to force data reload
  useEffect(() => {
    const refreshParam = searchParams.get('refresh')
    if (refreshParam && !isAddMode && !isDetailView && !isEditMode) {
      fetchFacilities()
      // Clean up the URL by removing the refresh parameter
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.delete('refresh')
      const newUrl = `${window.location.pathname}${newSearchParams.toString() ? '?' + newSearchParams.toString() : ''}`
      window.history.replaceState({}, '', newUrl)
    }
  }, [searchParams, isAddMode, isDetailView, isEditMode])

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }

  const fetchFacilities = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(statusFilter !== 'all' && { status: statusFilter }),
      })

      const response = await fetch(`${API_BASE_URL}/facilities?${params}`, {
        headers: getAuthHeaders(),
      })

      if (!response.ok) throw new Error('Failed to fetch facilities')

      const data = await response.json()

      // Handle both response formats
      const facilitiesData = data.data || data
      const paginationData = data.pagination || {}
      setFacilities(Array.isArray(facilitiesData) ? facilitiesData : [])
      setTotalPages(paginationData.totalPages || 1)
    } catch (error) {
      console.error('Error fetching facilities:', error)
      setFacilities([])
    } finally {
      setLoading(false)
    }
  }

  const fetchFacilityDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/facilities/${id}`, {
        headers: getAuthHeaders(),
      })

      if (!response.ok) throw new Error('Failed to fetch facility details')

      const data = await response.json()
      // Handle both response formats
      setSelectedFacility(data.data || data)
    } catch (error) {
      console.error('Error fetching facility details:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFacilityStatus = async (facilityId, currentStatus) => {
    try {
      const newStatus = !currentStatus
      const response = await fetch(`${API_BASE_URL}/facilities/${facilityId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_active: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update facility status')

      // Refetch facilities to show updated data
      await fetchFacilities()
    } catch (error) {
      console.error('Error updating facility status:', error)
    }
  }

  const deleteFacility = async (facilityId) => {
    if (!confirm('Are you sure you want to delete this facility?')) return

    try {
      const response = await fetch(`${API_BASE_URL}/facilities/${facilityId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (!response.ok) throw new Error('Failed to delete facility')

      // Remove from local state
      setFacilities(prev => prev.filter(facility => facility.id !== facilityId))
    } catch (error) {
      console.error('Error deleting facility:', error)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/auth/sign-in')
  }

  // Form validation
  const validateForm = () => {
    const errors = {}

    if (!formData.property.trim()) {
      errors.property = 'Property ID is required'
    }

    if (!formData.type.trim()) {
      errors.type = 'Facility type is required'
    }

    if (!formData.title.trim()) {
      errors.title = 'Title is required'
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required'
    }

    if (!formData.image_url.trim()) {
      errors.image_url = 'Image URL is required'
    } else if (!/^https?:\/\/.+/.test(formData.image_url)) {
      errors.image_url = 'Image URL must be a valid URL starting with http:// or https://'
    }

    // Validate capacity if provided
    if (formData.meta.capacity && formData.meta.capacity.trim()) {
      const capacity = parseInt(formData.meta.capacity)
      if (isNaN(capacity) || capacity <= 0) {
        errors.capacity = 'Capacity must be a positive number'
      } else if (capacity > 10000) {
        errors.capacity = 'Capacity cannot exceed 10,000'
      }
    }

    // Validate timings if provided
    if (formData.meta.timings && formData.meta.timings.trim()) {
      const timings = formData.meta.timings.trim()
      if (timings.length < 3) {
        errors.timings = 'Timings must be at least 3 characters long'
      } else if (timings.length > 100) {
        errors.timings = 'Timings cannot exceed 100 characters'
      }
      // Basic regex to check for time format (e.g., "9 AM - 5 PM", "24/7", etc.)
      const timePattern = /^[\w\s\-\:\.\/]+$/i
      if (!timePattern.test(timings)) {
        errors.timings = 'Timings format is invalid'
      }
    }

    return errors
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Handle meta field changes
  const handleMetaChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      meta: {
        ...prev.meta,
        [field]: value
      }
    }))

    // Clear error when user starts typing
    if (formErrors[`meta.${field}`]) {
      setFormErrors(prev => ({
        ...prev,
        [`meta.${field}`]: ''
      }))
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        property: formData.property.trim(),
        type: formData.type.trim(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        is_active: formData.is_active,
        meta: {
          capacity: formData.meta.capacity ? parseInt(formData.meta.capacity) : undefined,
          timings: formData.meta.timings.trim() || undefined
        },
        image_url: formData.image_url.trim()
      }

      // Remove undefined values from meta
      if (!payload.meta.capacity) delete payload.meta.capacity
      if (!payload.meta.timings) delete payload.meta.timings

      let response
      if (isEditMode) {
        // Update existing facility
        response = await fetch(`${API_BASE_URL}/facilities/${id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to update facility')
        }

        // Navigate back to facilities list with refresh flag
        navigate('/admin/facilities?refresh=' + Date.now())
      } else {
        // Create new facility
        response = await fetch(`${API_BASE_URL}/facilities`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to create facility')
        }

        // Reset form
        setFormData({
          property: '',
          type: '',
          title: '',
          description: '',
          is_active: true,
          meta: {
            capacity: '',
            timings: ''
          },
          image_url: ''
        })
        setFormErrors({})

        // Navigate back to facilities list with refresh flag
        navigate('/admin/facilities?refresh=' + Date.now())
      }

    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} facility:`, error)
      setFormErrors({ submit: error.message || `Failed to ${isEditMode ? 'update' : 'create'} facility. Please try again.` })
    } finally {
      setIsSubmitting(false)
    }
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
            <h2 className="text-xl font-bold text-primary mb-2">Loading Facilities</h2>
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

  // Add/Edit Facility Form
  if (isAddMode || isEditMode) {
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
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditMode ? 'Edit Facility' : 'Add Facility'}
                </h1>
                <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                  <Waves className="h-4 w-4" />
                  <span>{isEditMode ? 'Update' : 'Create New'}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/facilities')}
                  className="mb-4"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to Facilities
                </Button>
                <h1 className="text-3xl font-bold text-gray-900">
                  {isEditMode ? 'Edit Facility' : 'Add New Facility'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {isEditMode ? 'Update the facility details below' : 'Fill in the details to create a new facility'}
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Facility Information</CardTitle>
                  <CardDescription>
                    Enter all the required information for the new facility
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="property" className="text-sm font-medium">
                            Property ID <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="property"
                            name="property"
                            type="text"
                            placeholder="Enter the property ID"
                            value={formData.property}
                            onChange={handleInputChange}
                            className={formErrors.property ? 'border-red-500' : ''}
                          />
                          {formErrors.property && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.property}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="type" className="text-sm font-medium">
                            Facility Type <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="type"
                            name="type"
                            type="text"
                            placeholder="Enter facility type (e.g., Swimming Pool, Gym, etc.)"
                            value={formData.type}
                            onChange={handleInputChange}
                            className={formErrors.type ? 'border-red-500' : ''}
                          />
                          {formErrors.type && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.type}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label htmlFor="title" className="text-sm font-medium">
                            Title <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="title"
                            name="title"
                            type="text"
                            placeholder="Enter the facility title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className={formErrors.title ? 'border-red-500' : ''}
                          />
                          {formErrors.title && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="description" className="text-sm font-medium">
                            Description <span className="text-red-500">*</span>
                          </Label>
                          <textarea
                            id="description"
                            name="description"
                            placeholder="Detailed description of the facility"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={4}
                            className={`w-full px-3 py-2 border rounded-md bg-white text-gray-900 focus:border-primary focus:ring-1 focus:ring-primary ${
                              formErrors.description ? 'border-red-500' : 'border-gray-200'
                            }`}
                          />
                          {formErrors.description && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Meta Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Additional Information</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="capacity" className="text-sm font-medium">
                            Capacity
                          </Label>
                          <Input
                            id="capacity"
                            name="capacity"
                            type="number"
                            placeholder="Enter capacity (optional)"
                            value={formData.meta.capacity}
                            onChange={(e) => handleMetaChange('capacity', e.target.value)}
                            className={formErrors.capacity ? 'border-red-500' : ''}
                          />
                          {formErrors.capacity && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.capacity}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="timings" className="text-sm font-medium">
                            Timings
                          </Label>
                          <Input
                            id="timings"
                            name="timings"
                            type="text"
                            placeholder="e.g., 6 AM - 10 PM"
                            value={formData.meta.timings}
                            onChange={(e) => handleMetaChange('timings', e.target.value)}
                            className={formErrors.timings ? 'border-red-500' : ''}
                          />
                          {formErrors.timings && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.timings}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Image URL */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Media</h3>

                      <div>
                        <Label htmlFor="image_url" className="text-sm font-medium">
                          Image URL <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="image_url"
                          name="image_url"
                          type="url"
                          placeholder="Enter the image URL"
                          value={formData.image_url}
                          onChange={handleInputChange}
                          className={formErrors.image_url ? 'border-red-500' : ''}
                        />
                        {formErrors.image_url && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.image_url}</p>
                        )}
                        <p className="text-gray-500 text-sm mt-1">
                          URL to the facility image
                        </p>
                      </div>
                    </div>

                    {/* Active Status */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Status</h3>

                      <div className="flex items-center space-x-2">
                        <input
                          id="is_active"
                          name="is_active"
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <Label htmlFor="is_active" className="text-sm font-medium">
                          Active
                        </Label>
                      </div>
                    </div>

                    {/* Submit Error */}
                    {formErrors.submit && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <p className="text-red-800 text-sm">{formErrors.submit}</p>
                      </div>
                    )}

                    {/* Submit Buttons */}
                    <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/admin/facilities')}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="min-w-[120px]"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            {isEditMode ? 'Updating...' : 'Creating...'}
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            {isEditMode ? 'Update Facility' : 'Create Facility'}
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    )
  }

  // Facility Detail/Edit View
  if (isDetailView || isEditMode) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/facilities')}
              className="mb-4"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Facilities
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? 'Edit Facility' : 'Facility Details'}
            </h1>
          </div>

          {selectedFacility && (
            <Card>
              <CardHeader>
                <CardTitle>{selectedFacility.title}</CardTitle>
                <CardDescription>{selectedFacility.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Property ID</Label>
                    <p className="text-gray-700">{selectedFacility.property}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Type</Label>
                    <p className="text-gray-700">{selectedFacility.type}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      selectedFacility.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedFacility.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Capacity</Label>
                    <p className="text-gray-700">{selectedFacility.meta?.capacity || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Timings</Label>
                    <p className="text-gray-700">{selectedFacility.meta?.timings || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <p className="text-gray-700">{new Date(selectedFacility.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                {selectedFacility.image_url && (
                  <div className="mt-6">
                    <Label className="text-sm font-medium">Image</Label>
                    <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={selectedFacility.image_url}
                        alt={selectedFacility.title}
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  // Local search and status filtering
  const filteredFacilities = facilities.filter((facility) => {
    // Status filtering
    if (statusFilter === 'active' && !facility.is_active) return false
    if (statusFilter === 'inactive' && facility.is_active) return false

    // Search filtering
    if (!searchTerm.trim()) return true

    const searchLower = searchTerm.toLowerCase()
    const title = (facility.title || '').toLowerCase()
    const type = (facility.type || '').toLowerCase()
    const description = (facility.description || '').toLowerCase()
    const property = (facility.property || '').toLowerCase()

    return (
      title.includes(searchLower) ||
      type.includes(searchLower) ||
      description.includes(searchLower) ||
      property.includes(searchLower)
    )
  })

  // Facilities List View with Sidebar
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
              <h1 className="text-2xl font-bold text-gray-900">Facilities</h1>
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                <Waves className="h-4 w-4" />
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
                <h1 className="text-3xl font-bold text-gray-900">Facilities</h1>
                <p className="text-gray-600 mt-1">Manage your property facilities</p>
              </div>
              <Button onClick={() => navigate('/admin/facilities/add?mode=add')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Facility
              </Button>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search facilities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={statusFilter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('all')}
                      className={`transition-all duration-200 ${
                        statusFilter === 'all'
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : 'hover:bg-primary/10 hover:text-primary'
                      }`}
                    >
                      All Status
                    </Button>
                    <Button
                      variant={statusFilter === 'active' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('active')}
                      className={`transition-all duration-200 ${
                        statusFilter === 'active'
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'hover:bg-green-50 hover:text-green-700 hover:border-green-300'
                      }`}
                    >
                      Active
                    </Button>
                    <Button
                      variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('inactive')}
                      className={`transition-all duration-200 ${
                        statusFilter === 'inactive'
                          ? 'bg-gray-600 text-white hover:bg-gray-700'
                          : 'hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Inactive
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Facilities Table */}
            <Card>
              <CardHeader>
                <CardTitle>Facility Listings</CardTitle>
                <CardDescription>
                  A comprehensive list of all facilities in your system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Facility</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Property</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Capacity</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFacilities.map((facility) => (
                        <tr
                          key={facility.id || facility._id || Math.random()}
                          className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={async () => {
                            try {
                              // Fetch fresh facility details for preview
                              const response = await fetch(`${API_BASE_URL}/facilities/${facility.id || facility._id}`, {
                                headers: getAuthHeaders(),
                              })

                              if (!response.ok) throw new Error('Failed to fetch facility details')

                              const data = await response.json()
                              setSelectedFacility(data.data || data)
                              setShowPreview(true)
                            } catch (error) {
                              console.error('Error fetching facility details for preview:', error)
                              // Fallback to table data if fetch fails
                              setSelectedFacility(facility)
                              setShowPreview(true)
                            }
                          }}
                        >
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-gray-900">
                                {facility.title || 'Untitled Facility'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {facility.description?.substring(0, 50)}...
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-700">
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              {facility.type || 'N/A'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-700 font-mono text-sm">
                            {facility.property?.substring(0, 12)}...
                          </td>
                          <td className="py-4 px-4 text-gray-700">
                            {facility.meta?.capacity ? `${facility.meta.capacity} people` : 'N/A'}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              facility.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {facility.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/admin/facilities/${facility.id || facility._id}?mode=edit`)}
                                title="Edit Facility"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleFacilityStatus(facility.id || facility._id, facility.is_active)}
                                className={facility.is_active ? 'text-green-600' : 'text-gray-500'}
                                title={facility.is_active ? 'Deactivate' : 'Activate'}
                              >
                                {facility.is_active ? 'Active' : 'Inactive'}
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

            {/* Facility Preview Modal */}
            {showPreview && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {selectedFacility?.title || selectedFacility?.name}
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
                    <p className="text-sm text-gray-600 mb-4">Facility details and information</p>
                    {selectedFacility && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Title:</span>
                            <p className="text-gray-900 mt-1">{selectedFacility.title}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Type:</span>
                            <p className="text-gray-900 mt-1">{selectedFacility.type}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Description:</span>
                            <p className="text-gray-900 mt-1">{selectedFacility.description}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="font-medium text-gray-600">Property ID:</span>
                              <p className="text-gray-900 mt-1 font-mono text-sm">{selectedFacility.property || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Status:</span>
                              <p className="text-gray-900 mt-1">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  selectedFacility.is_active
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {selectedFacility.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </p>
                            </div>
                          </div>
                          {selectedFacility.meta?.capacity && (
                            <div>
                              <span className="font-medium text-gray-600">Capacity:</span>
                              <p className="text-gray-900 mt-1">{selectedFacility.meta.capacity} people</p>
                            </div>
                          )}
                          {selectedFacility.meta?.timings && (
                            <div>
                              <span className="font-medium text-gray-600">Timings:</span>
                              <p className="text-gray-900 mt-1">{selectedFacility.meta.timings}</p>
                            </div>
                          )}
                          {selectedFacility.image_url && (
                            <div>
                              <span className="font-medium text-gray-600 mb-2 block">Image:</span>
                              <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <img
                                  src={selectedFacility.image_url}
                                  alt={selectedFacility.title}
                                  className="w-full h-64 object-cover"
                                />
                              </div>
                            </div>
                          )}
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
