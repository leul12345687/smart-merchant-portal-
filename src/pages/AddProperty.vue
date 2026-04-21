<template>
  <div class="add-property-page">
    <div class="form-container">

      <h2 class="title">{{ t('addProperty.title') }}</h2>

      <!-- Error -->
      <div v-if="error" class="alert error">
        {{ error }}
      </div>

      <!-- Success -->
      <div v-if="success" class="alert success">
        {{ success }}
      </div>
   <div
  v-if="demandInfo && demandInfo.demandLevel"
  class="alert demand">
  <strong>Demand Level:</strong> {{ demandInfo.demandLevel }} <br />
  <strong>Predicted Demand Score:</strong> {{ demandInfo.predictedDemand }} <br />
  <strong>Recommendation:</strong> {{ demandInfo.recommendedAction }} <br />
  <strong>Note:</strong> {{ demandInfo.merchantNotification }}
  </div>

      <form @submit.prevent="submitProperty" class="property-form">

        <!-- Name -->
        <div class="form-group">
          <label>Property Name</label>
          <input v-model="form.name" type="text" required />
        </div>

        <!-- Description -->
        <div class="form-group">
          <label>Description</label>
          <textarea v-model="form.description" required></textarea>
        </div>

        <!-- Category (Dynamic Input + Suggestions) -->
        <div class="form-group category-wrapper">

          <label>Category</label>

          <!-- Input + Clear Button -->
          <div class="category-input-wrapper">
            <input
              v-model="categoryQuery"
              type="text"
              placeholder="Type category..."
              @input="onCategoryInput"
              @focus="showSuggestions = true"
            />

            <button
              v-if="form.category"
              type="button"
              class="clear-btn"
              @click="clearCategory"
            >
              ×
            </button>
          </div>

          <!-- Suggestions -->
          <div
            v-if="showSuggestions && categorySuggestions.length"
            class="category-suggestions"
          >
            <div
              v-for="cat in categorySuggestions"
              :key="cat"
              class="suggestion-item"
              @click="selectCategory(cat)"
            >
              {{ cat }}
            </div>
          </div>

          <!-- No Suggestions -->
          <div
            v-if="showSuggestions && categoryQuery && !categorySuggestions.length"
            class="no-suggestions"
          >
            No existing category — it will be saved as new.
          </div>

          <!-- Selected Category -->
          <div v-if="form.category" class="selected-category">
            Selected: <strong>{{ form.category }}</strong>
          </div>

        </div>

        <!-- Location -->
        <div class="form-group">
          <label>Location</label>
          <input v-model="form.location" required />
        </div>

        <!-- Pricing -->
       <div class="pricing-grid">
  <div class="price-item">
    <label>Rent Per Hour</label>
    <input v-model.number="form.rentalPriceperhour" type="number" placeholder="ETB / hour" />
  </div>

  <div class="price-item">
    <label>Rent Per Day</label>
    <input v-model.number="form.rentalPriceperday" type="number" placeholder="ETB / day" />
  </div>

  <div class="price-item">
    <label>Rent Per Week</label>
    <input v-model.number="form.rentalPriceperweek" type="number" placeholder="ETB / week" />
  </div>

  <div class="price-item">
    <label>Rent Per Month</label>
    <input v-model.number="form.rentalPricepermonth" type="number" placeholder="ETB / month" />
  </div>

  <div class="price-item">
    <label>Rent Per Year</label>
    <input v-model.number="form.rentalPriceperyear" type="number" placeholder="ETB / year" />
  </div>
</div>

        <!-- Quantity -->
        <div class="form-group">
          <label>Number of Properties</label>
          <input v-model.number="form.numberOfProperty" type="number" min="1" required />
        </div>

        <!-- Images -->
        <div class="form-group">
          <label>Upload Images</label>
          <input type="file" multiple accept="image/*" @change="handleImageUpload" />
        </div>

        <!-- Preview -->
        <div v-if="previewImages.length" class="image-preview">
          <img v-for="(img, i) in previewImages" :key="i" :src="img" />
        </div>

        <button type="submit" :disabled="loading">
          {{ loading ? 'Submitting...' : 'Create Property' }}
        </button>

      </form>
    </div>
  </div>
</template>
<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import axios from 'axios'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const API_BASE = 'https://lmgtech-e1q0.onrender.com'

// =======================================
// STATE (ALL REQUIRED VARIABLES)
// =======================================
const form = ref({
  name: '',
  description: '',
  category: '',
  location: '',
  rentalPriceperhour: 0,
  rentalPriceperday: 0,
  rentalPriceperweek: 0,
  rentalPricepermonth: 0,
  rentalPriceperyear: 0,
  numberOfProperty: 1,
})

const images = ref([])
const previewImages = ref([])

const error = ref('')
const success = ref('')
const loading = ref(false)

const demandInfo = ref(null)
const demandLoading = ref(false)
let demandController = null

// =======================================
// CATEGORY AUTOCOMPLETE STATE
// =======================================
const categoryQuery = ref('')
const categorySuggestions = ref([])
const showSuggestions = ref(false)
let categorySearchTimeout = null

// =======================================
// CLEAN UP IMAGE PREVIEWS
// =======================================
onBeforeUnmount(() => {
  previewImages.value.forEach(url => URL.revokeObjectURL(url))
})
// =======================================
// APPLY TYPED CATEGORY (NEW CATEGORY SUPPORT)
// =======================================
const applyTypedCategory = () => {
  const typed = categoryQuery.value.trim()

  if (typed) {
    form.value.category = typed
  }
}

// CATEGORY INPUT HANDLER (DEBOUNCE)

const onCategoryInput = () => {
  showSuggestions.value = true

  // 🟢 Always update category with typed text
  form.value.category = categoryQuery.value.trim()

  if (categorySearchTimeout) clearTimeout(categorySearchTimeout)

  categorySearchTimeout = setTimeout(fetchCategorySuggestions, 350)
}

// =======================================
// FETCH CATEGORY SUGGESTIONS (BACKEND)
// =======================================
const fetchCategorySuggestions = async () => {
  const query = categoryQuery.value.trim()
  if (!query) {
    categorySuggestions.value = []
    return
  }

  try {
    const response = await axios.get(
      `${API_BASE}/merchant/properties/categories/search`,
      { params: { q: query } }
    )

    categorySuggestions.value = response.data.categories || []
  } catch {
    categorySuggestions.value = []
  }
}

// =======================================
// SELECT CATEGORY
// =======================================
const selectCategory = (cat) => {
  form.value.category = cat
  categoryQuery.value = cat
  showSuggestions.value = false
  categorySuggestions.value = []
}

// =======================================
// CLEAR CATEGORY
// =======================================
const clearCategory = () => {
  form.value.category = ''
  categoryQuery.value = ''
  categorySuggestions.value = []
  showSuggestions.value = false
}

// =======================================
// DEMAND PREVIEW WHEN CATEGORY CHANGES
// =======================================
watch(
  () => form.value.category,
  async (newCategory) => {
    try {
      demandInfo.value = null
      if (!newCategory) return

      const token = localStorage.getItem('merchantToken')
      if (!token) return

      if (demandController) {
        demandController.abort()
      }

      demandController = new AbortController()
      demandLoading.value = true

      const response = await axios.get(
        `${API_BASE}/merchant/properties/demand-preview`,
        {
          params: { category: newCategory },
          headers: { Authorization: `Bearer ${token}` },
          signal: demandController.signal,
        }
      )

      demandInfo.value = response.data
    } catch (err) {
      if (err.name === 'AbortError') return
      console.warn('Demand preview failed:', err.message)
    } finally {
      demandLoading.value = false
    }
  }
)

// =======================================
// IMAGE HANDLER
// =======================================
const handleImageUpload = (e) => {
  previewImages.value.forEach(url => URL.revokeObjectURL(url))

  images.value = Array.from(e.target.files)
  previewImages.value = images.value.map(file =>
    URL.createObjectURL(file)
  )
}

// =======================================
// SUBMIT PROPERTY
// =======================================
const submitProperty = async () => {
  error.value = ''
  success.value = ''
  loading.value = true

  try {
    const token = localStorage.getItem('merchantToken')
    if (!token) throw new Error('Authentication required')

    if (!images.value.length)
      throw new Error('At least one image is required')

    if (!form.value.category.trim())
      throw new Error('Category is required')

    const formData = new FormData()

    Object.entries(form.value).forEach(([key, value]) => {
      formData.append(key, value ?? '')
    })

    images.value.forEach(file => {
      formData.append('images', file)
    })

    const response = await axios.post(
      `${API_BASE}/merchant/properties`,
      formData,
      {
        params: { lang: locale.value },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    success.value = response.data.message

    // Reset form
    form.value = {
      name: '',
      description: '',
      category: '',
      location: '',
      rentalPriceperhour: 0,
      rentalPriceperday: 0,
      rentalPriceperweek: 0,
      rentalPricepermonth: 0,
      rentalPriceperyear: 0,
      numberOfProperty: 1,
    }

    categoryQuery.value = ''
    categorySuggestions.value = []
    showSuggestions.value = false

    previewImages.value.forEach(url => URL.revokeObjectURL(url))
    images.value = []
    previewImages.value = []
    demandInfo.value = null

  } catch (err) {
    if (err.response?.data?.prediction) {
      error.value = `
AI rejected this image.
Prediction: ${err.response.data.prediction}
Confidence: ${err.response.data.confidence}
`
    } else {
      error.value =
        err.response?.data?.message ||
        err.message ||
        'Something went wrong'
    }
  } finally {
    loading.value = false
  }
}
</script>
<style scoped>
.add-property-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #e0f2fe, #eff6ff);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.form-container {
  background: white;
  width: 100%;
  max-width: 780px;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;
}

.form-container:hover {
  transform: translateY(-2px);
}

.title {
  text-align: center;
  margin-bottom: 1.4rem;
  font-size: 1.6rem;
  font-weight: 600;
  color: #0f172a;
}

/* Form group */
.form-group {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  position: relative;
}

label {
  font-weight: 500;
  color: #1f2937;
}

input,
textarea,
select {
  padding: 0.7rem;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  font-size: 0.95rem;
  transition: border 0.2s ease;
  width: 100%;
}

input:focus,
textarea:focus,
select:focus {
  border-color: #2563eb;
  outline: none;
}

/* ========================= */
/* CATEGORY DROPDOWN STYLE   */
/* ========================= */

.category-wrapper {
  position: relative;
}

.category-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.clear-btn {
  position: absolute;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #64748b;
}

.clear-btn:hover {
  color: #ef4444;
}

.category-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
  max-height: 200px;
  overflow-y: auto;
  z-index: 20;
  margin-top: 5px;
}

.suggestion-item {
  padding: 0.6rem 0.8rem;
  cursor: pointer;
  transition: background 0.15s ease;
}

.suggestion-item:hover {
  background: #eff6ff;
}

.no-suggestions {
  margin-top: 6px;
  font-size: 0.85rem;
  color: #64748b;
}

.selected-category {
  margin-top: 6px;
  font-size: 0.85rem;
  color: #1d4ed8;
}

/* ========================= */
/* PRICING GRID              */
/* ========================= */

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.8rem;
  margin-bottom: 1rem;
}

/* ========================= */
/* IMAGE PREVIEW             */
/* ========================= */

.image-preview {
  display: flex;
  gap: 10px;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.image-preview img {
  width: 85px;
  height: 85px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

/* ========================= */
/* BUTTON                    */
/* ========================= */

button {
  width: 100%;
  padding: 0.85rem;
  border: none;
  border-radius: 10px;
  background: #2563eb;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

button:hover {
  background: #1d4ed8;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ========================= */
/* ALERTS                    */
/* ========================= */

.alert {
  padding: 0.9rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  font-size: 0.95rem;
}

.error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.success {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.demand {
  background: #e0f2fe;
  color: #0c4a6e;
  border: 1px solid #bae6fd;
}

/* ========================= */
/* RESPONSIVE                */
/* ========================= */

@media (max-width: 768px) {
  .form-container {
    padding: 1.5rem;
    border-radius: 12px;
  }

  .pricing-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .image-preview img {
    width: 70px;
    height: 70px;
  }
}

@media (max-width: 480px) {
  .pricing-grid {
    grid-template-columns: 1fr;
  }

  button {
    padding: 0.75rem;
  }
}
</style>