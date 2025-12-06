import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useAuth } from '@/contexts/AuthContext'
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
  Waves,
  MessageSquare
} from 'lucide-react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export default function Properties() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Add Property Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location_url: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    latitude: '',
    longitude: '',
    plots_per_square_feet: '',
    amenities: [],
    layout_url: ''
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
      fetchPropertyDetails()
    } else if (!isAddMode) {
      fetchProperties()
    } else {
      setLoading(false)
    }
  }, [currentPage, statusFilter, typeFilter, id])

  // Populate form data when editing
  useEffect(() => {
    if (isEditMode && selectedProperty) {
      setFormData({
        title: selectedProperty.title || '',
        description: selectedProperty.description || '',
        location_url: selectedProperty.location_url || '',
        city: selectedProperty.city || '',
        state: selectedProperty.state || '',
        country: selectedProperty.country || '',
        pincode: selectedProperty.pincode || '',
        latitude: selectedProperty.location?.coordinates ? selectedProperty.location.coordinates[1].toString() : '',
        longitude: selectedProperty.location?.coordinates ? selectedProperty.location.coordinates[0].toString() : '',
        plots_per_square_feet: selectedProperty.plots_per_square_feet ? selectedProperty.plots_per_square_feet.toString() : '',
        amenities: selectedProperty.meta?.amenities || [],
        layout_url: selectedProperty.layout_url || ''
      })
    }
  }, [isEditMode, selectedProperty])

  // Handle refresh parameter to force data reload
  useEffect(() => {
    const refreshParam = searchParams.get('refresh')
    if (refreshParam && !isAddMode && !isDetailView && !isEditMode) {
      fetchProperties()
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

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(statusFilter !== 'all' && { status: statusFilter }),
      })

      const response = await fetch(`${API_BASE_URL}/properties?${params}`, {
        headers: getAuthHeaders(),
      })

      if (!response.ok) throw new Error('Failed to fetch properties')

      const data = await response.json()
      // Handle both response formats
      const propertiesData = data.data || data
      const paginationData = data.pagination || {}

      setProperties(Array.isArray(propertiesData) ? propertiesData : [])
      setTotalPages(paginationData.totalPages || 1)
    } catch (error) {
      console.error('Error fetching properties:', error)
      setProperties([])
    } finally {
      setLoading(false)
    }
  }

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
        headers: getAuthHeaders(),
      })

      if (!response.ok) throw new Error('Failed to fetch property details')

      const data = await response.json()
      // Handle both response formats
      setSelectedProperty(data.data || data)
    } catch (error) {
      console.error('Error fetching property details:', error)
    } finally {
      setLoading(false)
    }
  }

  const togglePropertyStatus = async (propertyId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'draft' : 'active'
      const response = await fetch(`${API_BASE_URL}/properties/${propertyId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update property status')

      // Refetch properties to show updated data
      await fetchProperties()
    } catch (error) {
      console.error('Error updating property status:', error)
    }
  }

  const deleteProperty = async (propertyId) => {
    if (!confirm('Are you sure you want to delete this property?')) return

    try {
      const response = await fetch(`${API_BASE_URL}/properties/${propertyId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (!response.ok) throw new Error('Failed to delete property')

      // Remove from local state
      setProperties(prev => prev.filter(prop => prop.id !== propertyId))
    } catch (error) {
      console.error('Error deleting property:', error)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/auth/sign-in')
  }

  // Form validation
  const validateForm = () => {
    const errors = {}

    if (!formData.title.trim()) {
      errors.title = 'Title is required'
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required'
    }

    if (!formData.city.trim()) {
      errors.city = 'City is required'
    }

    if (!formData.state.trim()) {
      errors.state = 'State is required'
    }

    if (!formData.country.trim()) {
      errors.country = 'Country is required'
    }

    if (!formData.pincode.trim()) {
      errors.pincode = 'Pincode is required'
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      errors.pincode = 'Pincode must be 6 digits'
    }

    if (!formData.latitude.trim()) {
      errors.latitude = 'Latitude is required'
    } else if (isNaN(formData.latitude) || formData.latitude < -90 || formData.latitude > 90) {
      errors.latitude = 'Latitude must be between -90 and 90'
    }

    if (!formData.longitude.trim()) {
      errors.longitude = 'Longitude is required'
    } else if (isNaN(formData.longitude) || formData.longitude < -180 || formData.longitude > 180) {
      errors.longitude = 'Longitude must be between -180 and 180'
    }

    if (!formData.plots_per_square_feet.trim()) {
      errors.plots_per_square_feet = 'Price per square feet is required'
    } else if (isNaN(formData.plots_per_square_feet) || formData.plots_per_square_feet <= 0) {
      errors.plots_per_square_feet = 'Price must be a positive number'
    }

    // Validate amenities - at least one required
    if (!formData.amenities || formData.amenities.length === 0) {
      errors.amenities = 'At least one amenity is required'
    }

    // Validate location URL - required and valid format
    if (!formData.location_url.trim()) {
      errors.location_url = 'Location URL is required'
    } else if (!/^https?:\/\/.+/.test(formData.location_url)) {
      errors.location_url = 'Location URL must be a valid URL starting with http:// or https://'
    }

    // Validate layout URL - required and valid format
    if (!formData.layout_url.trim()) {
      errors.layout_url = 'Layout URL is required'
    } else if (!/^https?:\/\/.+/.test(formData.layout_url)) {
      errors.layout_url = 'Layout URL must be a valid URL starting with http:// or https://'
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

  // Handle amenities - add new amenity
  const addAmenity = () => {
    const newAmenity = formData.newAmenity?.trim()
    if (newAmenity && !formData.amenities.includes(newAmenity)) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity],
        newAmenity: ''
      }))
    }
  }

  // Handle amenities - remove amenity
  const removeAmenity = (amenityToRemove) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(amenity => amenity !== amenityToRemove)
    }))
  }

  // Handle new amenity input
  const handleNewAmenityChange = (e) => {
    setFormData(prev => ({
      ...prev,
      newAmenity: e.target.value
    }))
  }

  // Handle amenities input (for backward compatibility)
  const handleAmenitiesChange = (e) => {
    const value = e.target.value
    const amenities = value.split(',').map(item => item.trim()).filter(item => item.length > 0)
    setFormData(prev => ({
      ...prev,
      amenities
    }))
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
        title: formData.title.trim(),
        description: formData.description.trim(),
        location_url: formData.location_url.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim(),
        pincode: formData.pincode.trim(),
        location: {
          type: 'Point',
          coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)]
        },
        plots_per_square_feet: parseFloat(formData.plots_per_square_feet),
        meta: {
          amenities: formData.amenities.filter(amenity => amenity.length > 0)
        },
        layout_url: formData.layout_url.trim()
      }

      let response
      if (isEditMode) {
        // Update existing property
        response = await fetch(`${API_BASE_URL}/properties/${id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to update property')
        }

        // Navigate back to properties list with refresh flag
        navigate('/admin/properties?refresh=' + Date.now())
      } else {
        // Create new property
        response = await fetch(`${API_BASE_URL}/properties`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to create property')
        }

        // Reset form
        setFormData({
          title: '',
          description: '',
          location_url: '',
          city: '',
          state: '',
          country: '',
          pincode: '',
          latitude: '',
          longitude: '',
          plots_per_square_feet: '',
          amenities: [],
          layout_url: ''
        })
        setFormErrors({})

        // Navigate back to properties list with refresh flag
        navigate('/admin/properties?refresh=' + Date.now())
      }

    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} property:`, error)
      setFormErrors({ submit: error.message || `Failed to ${isEditMode ? 'update' : 'create'} property. Please try again.` })
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
            <h2 className="text-xl font-bold text-primary mb-2">Loading Properties</h2>
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

  // Add/Edit Property Form
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
                  {isEditMode ? 'Edit Property' : 'Add Property'}
                </h1>
                <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                  <Building2 className="h-4 w-4" />
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
                  onClick={() => navigate('/admin/properties')}
                  className="mb-4"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to Properties
                </Button>
                <h1 className="text-3xl font-bold text-gray-900">
                  {isEditMode ? 'Edit Property' : 'Add New Property'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {isEditMode ? 'Update the property details below' : 'Fill in the details to create a new property listing'}
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Property Information</CardTitle>
                  <CardDescription>
                    Enter all the required information for the new property
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label htmlFor="title" className="text-sm font-medium">
                            Property Title <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="title"
                            name="title"
                            type="text"
                            placeholder="Enter the property title"
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
                            placeholder="Detailed description of the property"
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

                    {/* Location Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Location Information</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city" className="text-sm font-medium">
                            City <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="city"
                            name="city"
                            type="text"
                            placeholder="Enter the city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className={formErrors.city ? 'border-red-500' : ''}
                          />
                          {formErrors.city && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="state" className="text-sm font-medium">
                            State <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="state"
                            name="state"
                            type="text"
                            placeholder="Enter the state"
                            value={formData.state}
                            onChange={handleInputChange}
                            className={formErrors.state ? 'border-red-500' : ''}
                          />
                          {formErrors.state && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.state}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="country" className="text-sm font-medium">
                            Country <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="country"
                            name="country"
                            type="text"
                            placeholder="Enter the country"
                            value={formData.country}
                            onChange={handleInputChange}
                            className={formErrors.country ? 'border-red-500' : ''}
                          />
                          {formErrors.country && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.country}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="pincode" className="text-sm font-medium">
                            Pincode <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="pincode"
                            name="pincode"
                            type="text"
                            placeholder="Enter the pincode"
                            value={formData.pincode}
                            onChange={handleInputChange}
                            className={formErrors.pincode ? 'border-red-500' : ''}
                          />
                          {formErrors.pincode && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.pincode}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Coordinates */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Coordinates</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="latitude" className="text-sm font-medium">
                            Latitude <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="latitude"
                            name="latitude"
                            type="number"
                            step="any"
                            placeholder="Enter the latitude"
                            value={formData.latitude}
                            onChange={handleInputChange}
                            className={formErrors.latitude ? 'border-red-500' : ''}
                          />
                          {formErrors.latitude && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.latitude}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="longitude" className="text-sm font-medium">
                            Longitude <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="longitude"
                            name="longitude"
                            type="number"
                            step="any"
                            placeholder="Enter the longitude"
                            value={formData.longitude}
                            onChange={handleInputChange}
                            className={formErrors.longitude ? 'border-red-500' : ''}
                          />
                          {formErrors.longitude && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.longitude}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Pricing</h3>

                      <div>
                        <Label htmlFor="plots_per_square_feet" className="text-sm font-medium">
                          Price per Square Feet (₹) <span className="text-red-500">*</span>
                        </Label>
                          <Input
                            id="plots_per_square_feet"
                            name="plots_per_square_feet"
                            type="number"
                            min="0"
                            step="any"
                            placeholder="Enter the price per square feet"
                            value={formData.plots_per_square_feet}
                            onChange={handleInputChange}
                            className={formErrors.plots_per_square_feet ? 'border-red-500' : ''}
                          />
                        {formErrors.plots_per_square_feet && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.plots_per_square_feet}</p>
                        )}
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Amenities <span className="text-red-500">*</span></h3>

                      <div className="space-y-3">
                        {/* Add New Amenity */}
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="Enter amenity"
                            value={formData.newAmenity || ''}
                            onChange={handleNewAmenityChange}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                addAmenity()
                              }
                            }}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            onClick={addAmenity}
                            variant="outline"
                            size="sm"
                            className="px-4"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </div>

                        {/* Current Amenities */}
                        {formData.amenities.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Added Amenities ({formData.amenities.length})
                            </Label>
                            <div className="flex flex-wrap gap-2">
                              {formData.amenities.map((amenity, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-1 bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm"
                                >
                                  <span>{amenity}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeAmenity(amenity)}
                                    className="ml-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                                    title="Remove amenity"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <p className="text-gray-500 text-sm">
                          Add amenities one by one. Click the "Add" button or press Enter to add each amenity.
                        </p>
                      </div>
                    </div>

                    {/* URLs */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Additional Links</h3>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label htmlFor="location_url" className="text-sm font-medium">
                            Location URL <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="location_url"
                            name="location_url"
                            type="url"
                            placeholder="Enter the location URL"
                            value={formData.location_url}
                            onChange={handleInputChange}
                            className={formErrors.location_url ? 'border-red-500' : ''}
                          />
                          {formErrors.location_url && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.location_url}</p>
                          )}
                          <p className="text-gray-500 text-sm mt-1">
                            Link to Google Maps or location service
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="layout_url" className="text-sm font-medium">
                            Layout URL <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="layout_url"
                            name="layout_url"
                            type="url"
                            placeholder="Enter the layout URL"
                            value={formData.layout_url}
                            onChange={handleInputChange}
                            className={formErrors.layout_url ? 'border-red-500' : ''}
                          />
                          {formErrors.layout_url && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.layout_url}</p>
                          )}
                          <p className="text-gray-500 text-sm mt-1">
                            Link to property layout document or image
                          </p>
                        </div>
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
                        onClick={() => navigate('/admin/properties')}
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
                            {isEditMode ? 'Update Property' : 'Create Property'}
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

  // Property Detail/Edit View
  if (isDetailView || isEditMode) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/properties')}
              className="mb-4"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Properties
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? 'Edit Property' : 'Property Details'}
            </h1>
          </div>

          {selectedProperty && (
            <Card>
              <CardHeader>
                <CardTitle>{selectedProperty.title || selectedProperty.name}</CardTitle>
                <CardDescription>{selectedProperty.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Location</Label>
                    <p className="text-gray-700">
                      {selectedProperty.location?.coordinates
                        ? `${selectedProperty.location.coordinates[1]}, ${selectedProperty.location.coordinates[0]}`
                        : selectedProperty.address || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Type</Label>
                    <p className="text-gray-700">{selectedProperty.type || selectedProperty.propertyType}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Price</Label>
                    <p className="text-gray-700">${selectedProperty.price?.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Area</Label>
                    <p className="text-gray-700">{selectedProperty.area || selectedProperty.size} sq ft</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      selectedProperty.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedProperty.status}
                    </span>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <p className="text-gray-700">{new Date(selectedProperty.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  // Local search filtering
  const filteredProperties = properties.filter((property) => {
    if (!searchTerm.trim()) return true

    const searchLower = searchTerm.toLowerCase()
    const title = (property.title || '').toLowerCase()
    const city = (property.city || '').toLowerCase()
    const state = (property.state || '').toLowerCase()
    const country = (property.country || '').toLowerCase()
    const pincode = (property.pincode || '').toString()
    const description = (property.description || '').toLowerCase()
    const amenities = (property.meta?.amenities || []).join(' ').toLowerCase()

    return (
      title.includes(searchLower) ||
      city.includes(searchLower) ||
      state.includes(searchLower) ||
      country.includes(searchLower) ||
      pincode.includes(searchLower) ||
      description.includes(searchLower) ||
      amenities.includes(searchLower)
    )
  })

  // Properties List View with Sidebar
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
              <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                <Building2 className="h-4 w-4" />
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
                <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
                <p className="text-gray-600 mt-1">Manage your property listings</p>
              </div>
              <Button onClick={() => navigate('/admin/properties/add?mode=add')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Property
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
                        placeholder="Search properties..."
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
                      variant={statusFilter === 'draft' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter('draft')}
                      className={`transition-all duration-200 ${
                        statusFilter === 'draft'
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

            {/* Properties Table */}
            <Card>
              <CardHeader>
                <CardTitle>Property Listings</CardTitle>
                <CardDescription>
                  A comprehensive list of all properties in your system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Property</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Location</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Price per Sq Ft</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Amenities</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProperties.map((property) => (
                        <tr
                          key={property.id || property._id || Math.random()}
                          className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => {
                            setSelectedProperty(property)
                            setShowPreview(true)
                          }}
                        >
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-gray-900">
                                {property.title || 'Untitled Property'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {property.city}, {property.state} - {property.pincode}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-700">
                            <div>
                              <div className="text-sm">{property.city}, {property.state}</div>
                              <div className="text-xs text-gray-500">{property.country}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-700 font-medium">
                            <div>
                              {property.price && (
                                <div className="text-sm">₹{property.price?.toLocaleString()}</div>
                              )}
                              <div className="text-xs text-gray-500">
                                ₹{property.plots_per_square_feet?.toLocaleString() || 'N/A'} / sq ft
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-700">
                            <div className="flex flex-wrap gap-1">
                              {property.meta?.amenities?.slice(0, 2).map((amenity, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                                >
                                  {amenity}
                                </span>
                              ))}
                              {property.meta?.amenities?.length > 2 && (
                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                  +{property.meta.amenities.length - 2} more
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              property.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : property.status === 'inactive'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {property.status || 'Active'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/admin/properties/${property.id || property._id}?mode=edit`)}
                                title="Edit Property"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => togglePropertyStatus(property.id || property._id, property.status)}
                                className={property.status === 'active' ? 'text-green-600' : 'text-gray-500'}
                                title={property.status === 'active' ? 'Deactivate' : 'Activate'}
                              >
                                {property.status === 'active' ? 'Active' : 'Inactive'}
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

            {/* Property Preview Modal */}
            {showPreview && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {selectedProperty?.title || selectedProperty?.name}
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
                    <p className="text-sm text-gray-600 mb-4">Property details and information</p>
                    {selectedProperty && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Title:</span>
                            <p className="text-gray-900 mt-1">{selectedProperty.title}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Description:</span>
                            <p className="text-gray-900 mt-1">{selectedProperty.description}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="font-medium text-gray-600">City:</span>
                              <p className="text-gray-900 mt-1">{selectedProperty.city}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">State:</span>
                              <p className="text-gray-900 mt-1">{selectedProperty.state}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="font-medium text-gray-600">Country:</span>
                              <p className="text-gray-900 mt-1">{selectedProperty.country}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Pincode:</span>
                              <p className="text-gray-900 mt-1">{selectedProperty.pincode}</p>
                            </div>
                          </div>
                          {selectedProperty.price && (
                            <div>
                              <span className="font-medium text-gray-600">Total Price:</span>
                              <p className="text-gray-900 mt-1">₹{selectedProperty.price?.toLocaleString()}</p>
                            </div>
                          )}
                          <div>
                            <span className="font-medium text-gray-600">Price per Sq Ft:</span>
                            <p className="text-gray-900 mt-1">₹{selectedProperty.plots_per_square_feet?.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Coordinates:</span>
                            <p className="text-gray-900 mt-1">
                              {selectedProperty.location?.coordinates
                                ? `${selectedProperty.location.coordinates[1]}, ${selectedProperty.location.coordinates[0]}`
                                : 'N/A'}
                            </p>
                          </div>
                          {selectedProperty.meta?.amenities && selectedProperty.meta.amenities.length > 0 && (
                            <div>
                              <span className="font-medium text-gray-600">Amenities:</span>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {selectedProperty.meta.amenities.map((amenity, index) => (
                                  <span
                                    key={index}
                                    className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                                  >
                                    {amenity}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {selectedProperty.location_url && (
                            <div>
                              <span className="font-medium text-gray-600 mb-2 block">Location Preview:</span>
                              <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <iframe
                                  src={selectedProperty.location_url}
                                  className="w-full h-64 border-0"
                                  title="Location Map"
                                  allowFullScreen
                                />
                              </div>
                              <a
                                href={selectedProperty.location_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline text-sm mt-2 inline-block"
                              >
                                Open in New Tab
                              </a>
                            </div>
                          )}
                          {selectedProperty.layout_url && (
                            <div className="mt-4">
                              <span className="font-medium text-gray-600 mb-2 block">Layout Preview:</span>
                              <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <iframe
                                  src={selectedProperty.layout_url}
                                  className="w-full h-96 border-0"
                                  title="Property Layout"
                                />
                              </div>
                              <a
                                href={selectedProperty.layout_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline text-sm mt-2 inline-block"
                              >
                                Open in New Tab
                              </a>
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
