<template>
  <div :class="['login-page', theme]">
    <!-- Top Header Bar -->
    <header class="top-header">
      <div class="header-content">
        <div class="header-left"></div>
        <div class="header-center">
          <h1 class="welcome-title">Welcome to Merchant LMG Tech</h1>
        </div>
        <div class="header-right">
          <LanguageSwitcher @change-language="changeLanguage" />
          <ThemeSwitcher @toggle-theme="toggleTheme" :current-theme="theme" />
          <button class="about-button" @click="showAbout = true" title="About System">
            <svg class="about-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Login card -->
    <div class="login-card">
      <div class="card-header">
        <h2 class="login-title">{{ $t('app.title') }}</h2>
        <p class="login-subtitle">Please sign in to access your merchant dashboard</p>
      </div>

      <form @submit.prevent="login" class="login-form">
        <div class="form-group">
          <label>{{ $t('login.email') }}</label>
          <input
            v-model="email"
            type="email"
            :placeholder="$t('login.email')"
            required
          />
        </div>

        <div class="form-group password-group">
          <label>{{ $t('login.password') }}</label>
          <div class="password-wrapper">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              :placeholder="$t('login.password')"
              required
            />
            <button type="button" @click="togglePassword">
              {{ showPassword ? '🙈' : '👁' }}
            </button>
          </div>
        </div>

        <button type="submit" :disabled="loading" class="login-button">
          {{ loading ? $t('login.loggingIn') : $t('login.login') }}
        </button>
      </form>

      <p v-if="error" class="error">{{ error }}</p>

      <!-- Footer -->
      <div class="login-footer">
        <p>© 2026 LMG Tech. All rights reserved.</p>
      </div>
    </div>

    <!-- About Modal -->
    <div v-if="showAbout" class="about-modal-overlay" @click="showAbout = false">
      <div class="about-modal" @click.stop>
        <div class="about-header">
          <h2>About LMG Tech Merchant Portal</h2>
          <button class="close-button" @click="showAbout = false">×</button>
        </div>
        <div class="about-content">
          <div class="about-section">
            <h3>🚀 Getting Started</h3>
            <p>Welcome to the LMG Tech Merchant Portal! This platform helps property owners and merchants manage their rental properties efficiently.</p>
          </div>

          <div class="about-section">
            <h3>🔐 Login Process</h3>
            <p>Start by logging in with your merchant credentials. The system uses secure authentication to protect your account and data.</p>
          </div>

          <div class="about-section">
            <h3>🏢 Property Management</h3>
            <p>After login, you can:</p>
            <ul>
              <li>Add new properties with detailed information</li>
              <li>View and manage your property listings</li>
              <li>Track property status and availability</li>
              <li>Update property details and pricing</li>
            </ul>
          </div>

          <div class="about-section">
            <h3>📅 Booking System</h3>
            <p>Manage customer bookings with features like:</p>
            <ul>
              <li>View incoming booking requests</li>
              <li>Confirm or reject bookings</li>
              <li>Track payment status</li>
              <li>Manage booking history</li>
            </ul>
          </div>

          <div class="about-section">
            <h3>💰 Financial Dashboard</h3>
            <p>Monitor your business performance with:</p>
            <ul>
              <li>Monthly revenue tracking</li>
              <li>Financial projections and predictions</li>
              <li>Tax calculations</li>
              <li>Profit analysis</li>
              <li>Historical data and trends</li>
            </ul>
          </div>

          <div class="about-section">
            <h3>⚙️ Additional Features</h3>
            <p>The portal includes:</p>
            <ul>
              <li>Multi-language support (English & Amharic)</li>
              <li>Dark/Light theme switching</li>
              <li>Responsive design for mobile devices</li>
              <li>Real-time data updates</li>
              <li>Secure payment processing</li>
            </ul>
          </div>

          <div class="about-section">
            <h3>📞 Support</h3>
            <p>For technical support or questions, please contact LMG Tech support team.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'
import ThemeSwitcher from '../components/ThemeSwitcher.vue'
import axios from 'axios'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')
const showAbout = ref(false)
const router = useRouter()
const { locale } = useI18n()
const theme = ref('light')

// Load saved theme
onMounted(() => {
  theme.value = localStorage.getItem('theme') || 'light'
  document.documentElement.className = theme.value
})

// Toggle password visibility
function togglePassword() {
  showPassword.value = !showPassword.value
}

// Language change
function changeLanguage(lang) {
  locale.value = lang
  localStorage.setItem('locale', lang)
}

// Theme toggle
function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  document.documentElement.className = theme.value
  localStorage.setItem('theme', theme.value)
}

// Login function
async function login() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await axios.post(
      'https://lmgtech-e1q0.onrender.com/merchant/login',
      { email: email.value, password: password.value }
    )
    localStorage.setItem('merchantToken', data.token)
    localStorage.setItem('merchant', JSON.stringify(data.merchant))
    router.push('/')
  } catch (err) {
    error.value = err.response?.data?.message || 'Invalid credentials'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Container */
.login-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 0;
  background: linear-gradient(135deg, #f3f4f6, #1e3a8a);
  font-family: 'Inter', sans-serif;
  position: relative;
}

/* Top Header */
.top-header {
  background: linear-gradient(135deg, #1e3a8a, #3b82f6);
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: relative;
  z-index: 10;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.header-left {
  flex: 1;
}

.header-center {
  flex: 2;
  text-align: center;
}

.header-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
}

.welcome-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.about-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 0.5rem;
  cursor: pointer;
  color: white;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.about-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.about-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Login Card */
.login-card {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  width: 100%;
  max-width: 450px;
  text-align: center;
  margin: 2rem auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-header {
  margin-bottom: 2rem;
}

.login-title {
  font-size: 2rem;
  color: #1e3a8a;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.login-subtitle {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
  font-weight: 400;
}

/* Form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  text-align: left;
}

.form-group input {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  border-radius: 10px;
  border: 2px solid #e5e7eb;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group input::placeholder {
  font-size: 0.95rem;
  color: #9ca3af;
}

/* Password wrapper */
.password-wrapper {
  position: relative;
}

.password-wrapper button {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: #6b7280;
}

/* Submit button */
.login-button {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  font-weight: 600;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(59, 130, 246, 0.3);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* Error message */
.error {
  color: #ef4444;
  margin-top: 1rem;
  font-weight: 500;
  background: #fef2f2;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #fecaca;
}

/* Footer */
.login-footer {
  margin-top: auto;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.login-footer p {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

/* Dark mode */
.dark .top-header {
  background: linear-gradient(135deg, #1f2937, #374151);
}

.dark .login-card {
  background-color: #1f2937;
  color: #f3f4f6;
}

.dark .login-page {
  background: linear-gradient(135deg, #111827, #1e3a8a);
}

.dark .login-title {
  color: #f3f4f6;
}

.dark .login-subtitle {
  color: #d1d5db;
}

.dark input {
  background-color: #374151;
  color: #f3f4f6;
  border: 2px solid #4b5563;
}

.dark input:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
}

.dark .password-wrapper button {
  color: #9ca3af;
}

.dark .login-button {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
}

.dark .login-footer p {
  color: #9ca3af;
}

.dark .error {
  background: #451a1a;
  border-color: #dc2626;
  color: #fca5a5;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .top-header {
    padding: 1rem;
  }

  .welcome-title {
    font-size: 1.25rem;
  }

  .header-right {
    gap: 0.5rem;
  }

  .login-card {
    padding: 2rem 1.5rem;
    margin: 1rem;
    max-width: none;
  }

  .login-title {
    font-size: 1.75rem;
  }

  .form-group input {
    padding: 0.875rem;
    font-size: 1rem;
  }

  .login-button {
    padding: 0.875rem;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .header-left,
  .header-right {
    flex: none;
  }

  .welcome-title {
    font-size: 1.1rem;
  }

  .login-card {
    padding: 1.5rem 1rem;
  }

  .login-title {
    font-size: 1.5rem;
  }

  .form-group input {
    padding: 0.75rem;
    font-size: 0.95rem;
  }

  .login-button {
    padding: 0.75rem;
    font-size: 0.95rem;
  }
}

/* About Modal */
.about-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.about-modal {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.about-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #1e3a8a, #3b82f6);
  color: white;
  border-radius: 12px 12px 0 0;
}

.about-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.about-content {
  padding: 1.5rem;
}

.about-section {
  margin-bottom: 1.5rem;
}

.about-section h3 {
  color: #1e3a8a;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.about-section p {
  color: #374151;
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.about-section ul {
  color: #374151;
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.about-section li {
  margin-bottom: 0.25rem;
  line-height: 1.5;
}

/* Dark mode for modal */
.dark .about-modal {
  background: #1f2937;
  color: #f3f4f6;
}

.dark .about-header {
  background: linear-gradient(135deg, #374151, #4b5563);
}

.dark .about-section h3 {
  color: #60a5fa;
}

.dark .about-section p,
.dark .about-section li {
  color: #d1d5db;
}

.dark .close-button {
  color: #d1d5db;
}

.dark .close-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Mobile modal adjustments */
@media (max-width: 768px) {
  .about-modal {
    max-width: 95vw;
    margin: 1rem;
  }

  .about-header {
    padding: 1rem;
  }

  .about-header h2 {
    font-size: 1.1rem;
  }

  .about-content {
    padding: 1rem;
  }

  .about-section h3 {
    font-size: 1rem;
  }
}
</style>
