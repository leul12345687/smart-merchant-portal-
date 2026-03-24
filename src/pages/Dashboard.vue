<template>
  <div class="dashboard">
    <h1 class="dashboard-title">
      {{ $t('dashboard.welcome', { name: merchantName }) }}
    </h1>
    <p class="dashboard-subtitle">
      {{ $t('dashboard.overview') }}
    </p>

    <!-- ✅ KEEP ALL CARDS INSIDE -->
    <div class="cards-container">

      <!-- Total Properties -->
      <div class="card card-blue" @click="goToProperties" style="cursor:pointer;">
        <div class="card-icon">🏢</div>
        <div class="card-content">
          <h2>{{ totalProperties }}</h2>
          <p>{{ $t('dashboard.totalProperties') }}</p>
        </div>
      </div>

      <!-- Active Rentals -->
      <div class="card card-green">
        <div class="card-icon">🔑</div>
        <div class="card-content">
          <h2>{{ activeRentals }}</h2>
          <p>{{ $t('dashboard.activeRentals') }}</p>
        </div>
      </div>

      <!-- Revenue This Month -->
      <div class="card card-yellow">
        <div class="card-icon">💰</div>
        <div class="card-content">
          <h2>{{ revenueThisMonth }}</h2>
          <p>{{ $t('dashboard.revenueThisMonth') }}</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const merchantName = ref('')
const totalProperties = ref(0)
const activeRentals = ref(0)
const revenueThisMonth = ref(0)
const properties = ref([]) // ✅ store full list

onMounted(async () => {
  const merchant = JSON.parse(localStorage.getItem('merchant'))
  merchantName.value = merchant?.name || 'Merchant'

  try {
    const token = localStorage.getItem('merchantToken')

    const { data } = await axios.get(
      'https://lmgtech-4.onrender.com/merchant/operations/properties',
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    properties.value = data.properties || []  // ✅ save list

    totalProperties.value = data.total || properties.value.length
    activeRentals.value = properties.value.filter(p => p.status === 'active').length
    revenueThisMonth.value = properties.value.reduce(
      (sum, p) => sum + (p.revenueThisMonth || 0),
      0
    )

  } catch (err) {
    console.error(err)
  }
})

// ✅ Navigate with data
const goToProperties = () => {
  router.push({
    path: '/properties',
    state: { properties: properties.value } // pass data
  })
}
</script>

<style scoped>
.dashboard {
  padding: 2rem;
  font-family: 'Inter', sans-serif;
}

.dashboard-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #5e0c2e;
  text-align: center;
}

.dashboard-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 2rem;
  text-align: center;
}

/* Cards Container */
.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

/* Card Styles */
.card {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  border-radius: 15px;
  color: white;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.12);
}

.card-icon {
  font-size: 2.5rem;
  margin-right: 1rem;
}

.card-content h2 {
  font-size: 1.8rem;
  margin: 0;
}

.card-content p {
  margin: 0;
  font-weight: 500;
}

/* Card Colors */
.card-blue { background: linear-gradient(135deg, #2563eb, #1d4ed8); }
.card-green { background: linear-gradient(135deg, #10b981, #047857); }
.card-yellow { background: linear-gradient(135deg, #f59e0b, #b45309); }

/* Responsive adjustments */
@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }

  .dashboard-title {
    font-size: 1.8rem;
  }

  .dashboard-subtitle {
    font-size: 0.95rem;
    margin-bottom: 1.5rem;
  }

  .card {
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem;
    text-align: center;
  }

  .card-icon {
    margin: 0 0 0.5rem 0;
    font-size: 2rem;
  }

  .card-content h2 {
    font-size: 1.5rem;
  }

  .card-content p {
    font-size: 0.9rem;
  }
}
</style>
