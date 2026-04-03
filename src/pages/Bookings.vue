<template>
  <div class="booking-page">
    <header class="page-topbar">
      <h1>{{ t('bookings.title') }}</h1>
      <p class="page-subtitle">Real-time booking monitoring and status updates</p>
    </header>

    <section class="overview-row">
      <div class="overview-card">
        <p>Active Bookings</p>
        <h2>{{ activeBookings }}</h2>
      </div>
      <div class="overview-card">
        <p>Cancelled Bookings</p>
        <h2>{{ cancelledBookings }}</h2>
      </div>
      <div class="overview-card">
        <p>Total Revenue</p>
        <h2>{{ formatCurrency(totalRevenue) }}</h2>
      </div>
    </section>

    <div class="dashboard-grid">
      <main class="main-panel">
        <div class="panel-card">
          <div class="card-header">Bookings</div>
          <div class="table-wrapper" v-if="!loading && bookings.length">
            <table class="booking-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="booking in filteredBookings" :key="booking.bookingId" @click="openBookingDetails(booking)">
                  <td>{{ booking.propertyName }}</td>
                  <td>{{ booking.customerName }}</td>
                  <td>{{ formatCurrency(booking.totalPrice) }}</td>
                  <td><span :class="['small-badge', statusClass(booking.status)]">{{ booking.status }}</span></td>
                  <td><span :class="['small-badge', paymentClass(booking.paymentStatus)]">{{ booking.paymentStatus }}</span></td>
                  <td><button class="details-btn">View</button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="!loading && !bookings.length" class="no-data">No bookings available</div>
          <div v-if="loading" class="loading-overlay">
            <div class="spinner"></div>
            <p>{{ t('bookings.loading') }}</p>
          </div>
        </div>
      </main>

      <aside class="side-panel">
        <div class="panel-card search-panel">
          <input v-model="searchText" type="text" placeholder="Search bookings" />
          <select v-model="statusFilter">
            <option value="">All status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div class="panel-card upcoming-panel">
          <div class="card-header">Upcoming Bookings</div>
          <ul>
            <li v-for="booking in filteredBookings.slice(0, 5)" :key="booking.bookingId" @click="openBookingDetails(booking)">
              <section>
                <strong>{{ booking.propertyName }}</strong>
                <p>{{ booking.customerName }}</p>
              </section>
              <span class="status-dot" :class="statusClass(booking.status)">{{ booking.status }}</span>
            </li>
          </ul>
          <div v-if="filteredBookings.length === 0" class="no-data">No upcoming booking.</div>
        </div>

        <div class="panel-card chart-panel">
          <div class="card-header">Booking Trends</div>
          <div class="trend-placeholder">Chart will be added here</div>
        </div>
      </aside>
    </div>

    <div v-if="selectedBooking" class="modal-overlay" @click.self="selectedBooking = null">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ selectedBooking.propertyName }}</h3>
          <button class="close-btn" @click="selectedBooking = null">×</button>
        </div>
        <div class="modal-body">
          <p><strong>Customer:</strong> {{ selectedBooking.customerName }}</p>
          <p><strong>Email:</strong> {{ selectedBooking.customerEmail }}</p>
          <p><strong>Phone:</strong> {{ selectedBooking.customerPhone }}</p>
          <p><strong>Dates:</strong> {{ formatDate(selectedBooking.startDate) }} → {{ formatDate(selectedBooking.endDate) }}</p>
          <p><strong>Status:</strong> {{ selectedBooking.status }}</p>
          <p><strong>Payment:</strong> {{ selectedBooking.paymentStatus }}</p>
          <p><strong>Total Price:</strong> {{ formatCurrency(selectedBooking.totalPrice) }}</p>
        </div>
        <div class="modal-actions">
          <button class="delete-btn" @click="deleteBooking(selectedBooking.bookingId)">Delete Booking</button>
          <button class="close-btn" @click="selectedBooking = null">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>              <option value="REJECTED">Rejected</option>
            </select>
          </p>

          <p><strong>Total Price:</strong> {{ selectedBooking.totalPrice }}</p>
          <p><strong>Quantity:</strong> {{ selectedBooking.numberOfProperty }}</p>
        </div>

        <!-- Payment Proof -->
        <div class="payment-proof">
          <h3>Payment Proof</h3>
          <img
            v-if="selectedBooking.paymentProofPath"
            :src="getImageUrl(selectedBooking.paymentProofPath)"
            class="modal-img"
          />
          <p v-else class="text-gray">No payment proof uploaded</p>
        </div>

        <div class="modal-actions">
          <button
            class="delete-btn"
            @click="deleteBooking(selectedBooking.bookingId)"
          >
            Delete Booking
          </button>

          <button class="close-btn" @click="selectedBooking = null">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'

const { t } = useI18n()

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://lmgtech-4.onrender.com/merchant'

const CLOUD_BASE_URL =
  import.meta.env.VITE_CLOUD_URL ||
  'https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload'

const token = localStorage.getItem('merchantToken')

const bookings = ref([])
const loading = ref(true)
const selectedBooking = ref(null)
const searchText = ref('')
const statusFilter = ref('')

const activeBookings = computed(() =>
  bookings.value.filter((b) => b.status === 'CONFIRMED' || b.status === 'PENDING').length
)
const cancelledBookings = computed(() =>
  bookings.value.filter((b) => b.status === 'CANCELLED').length
)
const totalRevenue = computed(() =>
  bookings.value.reduce((total, b) => total + (Number(b.totalPrice) || 0), 0)
)

const filteredBookings = computed(() => {
  let list = bookings.value
  if (statusFilter.value) {
    list = list.filter((b) => b.status === statusFilter.value)
  }
  if (searchText.value.trim()) {
    const q = searchText.value.trim().toLowerCase()
    list = list.filter(
      (b) =>
        b.propertyName?.toLowerCase().includes(q) ||
        b.customerName?.toLowerCase().includes(q)
    )
  }
  return list
})

const statusClass = (status) => {
  if (status === 'CONFIRMED') return 'status-confirmed'
  if (status === 'COMPLETED') return 'status-completed'
  if (status === 'CANCELLED') return 'status-cancelled'
  if (status === 'PENDING') return 'status-pending'
  return 'status-default'
}

const paymentClass = (status) => {
  if (status === 'PAID') return 'status-paid'
  if (status === 'UNPAID') return 'status-unpaid'
  if (status === 'PENDING_REVIEW') return 'status-pending'
  if (status === 'EXPIRED') return 'status-expired'
  return 'status-default'
}

const getImageUrl = (url) => {
  if (!url) return ''
  return url.startsWith('http')
    ? url
    : `${CLOUD_BASE_URL}/${url.replace(/\\/g, '/')}`
}

const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : '—')

const formatCurrency = (value) => {
  const amount = Number(value) || 0
  return new Intl.NumberFormat().format(amount) + ' ETB'
}

const fetchBookings = async () => {
  loading.value = true
  try {
    const res = await axios.get(`${API_BASE_URL}/operations/bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    bookings.value = res.data.bookings || []
  } catch (err) {
    console.error(err.response?.data || err.message)
  } finally {
    loading.value = false
  }
}

const updateBookingStatus = async (booking) => {
  const oldStatus = booking.status
  try {
    await axios.patch(
      `${API_BASE_URL}/operations/bookings/${booking.bookingId}/status`,
      { status: booking.status },
      { headers: { Authorization: `Bearer ${token}` } }
    )
  } catch (err) {
    booking.status = oldStatus
    alert('Failed to update booking status')
  }
}

const updatePaymentStatus = async (booking) => {
  const oldStatus = booking.paymentStatus
  try {
    await axios.patch(
      `${API_BASE_URL}/operations/bookings/${booking.bookingId}/status`,
      { paymentStatus: booking.paymentStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    )
  } catch (err) {
    booking.paymentStatus = oldStatus
    alert('Failed to update payment status')
    console.error(err.response?.data || err.message)
  }
}

const deleteBooking = async (id) => {
  if (!confirm('Delete this booking?')) return
  try {
    await axios.delete(`${API_BASE_URL}/operations/bookings/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    bookings.value = bookings.value.filter((b) => b.bookingId !== id)
    selectedBooking.value = null
  } catch (err) {
    alert('Failed to delete booking')
  }
}

const openBookingDetails = (booking) => {
  selectedBooking.value = booking
}

onMounted(fetchBookings)
</script>
<style scoped>
.booking-page {
  padding: 1.5rem;
  font-family: 'Inter', sans-serif;
  background: #f8fafc;
  min-height: calc(100vh - 2rem);
}

.page-topbar {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1.5rem;
}

.page-topbar h1 {
  font-size: 2.8rem;
  color: #102161;
  margin: 0;
}

.page-subtitle {
  color: #4b5563;
  margin: 0;
  font-size: 1.05rem;
}

.overview-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.overview-card {
  background: white;
  border-radius: 12px;
  padding: 1rem 1.2rem;
  box-shadow: 0 8px 20px rgba(16, 33, 97, 0.1);
  border-left: 5px solid #2563eb;
}

.overview-card p {
  font-weight: 600;
  color: #64748b;
  margin: 0;
}

.overview-card h2 {
  font-size: 2rem;
  margin: 0.3rem 0 0;
  color: #102161;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
}

.panel-card {
  background: white;
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  padding: 1.2rem;
}

.card-header {
  font-size: 1.1rem;
  color: #1e40af;
  margin-bottom: 0.75rem;
  font-weight: 700;
}

.table-wrapper {
  overflow-x: auto;
}

.booking-table {
  width: 100%;
  border-collapse: collapse;
}

.booking-table th,
.booking-table td {
  border-bottom: 1px solid #e2e8f0;
  padding: 0.8rem 0.6rem;
  text-align: left;
  font-size: 0.9rem;
}

.booking-table th {
  color: #334155;
  font-weight: 600;
  background: #f8fafc;
}

.booking-table tr:hover {
  background: #f1f5f9;
  cursor: pointer;
}

.small-badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.status-confirmed { background: #10b981; }
.status-completed { background: #2563eb; }
.status-cancelled { background: #ef4444; }
.status-pending { background: #f59e0b; }
.status-default { background: #64748b; }
.status-paid { background: #0ea5e9; }
.status-unpaid { background: #f43f5e; }
.status-expired { background: #6b7280; }

.details-btn {
  background: #1e40af;
  color: white;
  border: none;
  border-radius: 7px;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
}

.details-btn:hover { opacity: 0.92; }

.side-panel {
  display: grid;
  gap: 1rem;
}

.search-panel input,
.search-panel select {
  width: 100%;
  margin-bottom: 0.75rem;
  padding: 0.65rem 0.8rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
}

.upcoming-panel ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.upcoming-panel li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
  padding: 0.65rem 0;
  cursor: pointer;
}

.upcoming-panel li:last-child { border-bottom: none; }

.status-dot {
  border-radius: 999px;
  padding: 0.2rem 0.6rem;
  font-size: 0.75rem;
  color: white;
}

.trend-placeholder {
  height: 150px;
  border-radius: 10px;
  border: 1px dashed #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 0.95rem;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 60;
  padding: 1rem;
}

.modal {
  width: min(100%, 520px);
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #1e3a8a;
  color: white;
  padding: 0.8rem 1rem;
}

.modal-header h3 { margin: 0; }

.close-btn,
.delete-btn {
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.modal-body {
  padding: 1rem;
  display: grid;
  gap: 0.4rem;
}

.modal-actions {
  padding: 1rem;
  display: flex;
  gap: 0.6rem;
}

.delete-btn {
  flex: 1;
  background: #ef4444;
  color: white;
}

.close-btn {
  flex: 1;
  background: #64748b;
  color: white;
}

.spinner {
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 999px;
  width: 24px;
  height: 24px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 220px;
}

.no-data {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 1rem;
  color: #64748b;
}

@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  .overview-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-topbar h1 { font-size: 2rem; }
  .overview-card h2 { font-size: 1.6rem; }
}
</style>
