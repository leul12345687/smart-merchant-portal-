<template>
  <div class="financial-page">
    <div class="financial-container">

      <h2 class="title">Merchant Financial Dashboard</h2>

     <div v-if="loading">Loading financial data...</div>
<div v-else-if="error">{{ error }}</div>
<div v-else class="financial-grid">
  <div class="card">
    <h3>Monthly Income</h3>
    <p>{{ formatCurrency(financialInfo?.monthlyIncome) }}</p>
  </div>

  <div class="card">
    <h3>Projected Current Month</h3>
    <p>{{ formatCurrency(financialInfo?.projectedCurrentMonth) }}</p>
  </div>

  <div class="card">
    <h3>Historical Monthly Average</h3>
    <p>{{ formatCurrency(financialInfo?.historicalMonthlyAverage) }}</p>
  </div>

  <div class="card">
    <h3>Trend Slope</h3>
    <p>{{ financialInfo?.trendSlope ?? 0 }}</p>
  </div>

  <div class="card">
    <h3>Yearly Income</h3>
    <p>{{ formatCurrency(financialInfo?.yearlyIncome) }}</p>
  </div>

  <div class="card">
    <h3>Predicted Next Month</h3>
    <p>{{ formatCurrency(financialInfo?.predictedNextMonth) }}</p>
  </div>

  <div class="card">
    <h3>Estimated Yearly Tax</h3>
    <p>{{ formatCurrency(financialInfo?.estimatedTaxYear) }}</p>
  </div>

  <div class="card highlight">
    <h3>Profit After Tax</h3>
    <p>{{ formatCurrency(financialInfo?.profitAfterTax) }}</p>
  </div>

  <div class="card">
    <h3>Months Used For Learning</h3>
    <p>{{ financialInfo?.monthsUsedForLearning ?? 0 }}</p>
  </div>

      </div>

    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue"
import axios from "axios"

const API_BASE = "https://lmgtech-4.onrender.com"

const loading = ref(true)
const error = ref("")
const financialInfo = ref({}) // Initialize as empty object

const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return "0 ETB"
  return new Intl.NumberFormat().format(value) + " ETB"
}

const fetchFinancialInfo = async () => {
  loading.value = true
  error.value = ""
  try {
    const token = localStorage.getItem("merchantToken")
    if (!token) throw new Error("Authentication required. Please login.")

    const response = await axios.get(`${API_BASE}/merchant/financial-info`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    console.log("API response:", response.data)

    if (response.data?.success && response.data.financialInfo) {
      financialInfo.value = response.data.financialInfo
    } else {
      error.value = "No financial data available"
    }
  } catch (err) {
    console.error(err)
    error.value =
      err.response?.data?.message || err.message || "Failed to load financial data"
  } finally {
    loading.value = false
  }
}

onMounted(fetchFinancialInfo)
</script>

<style>
.financial-page {
  min-height: 100vh;
  background: linear-gradient(135deg,#eef2ff,#f8fafc);
  display:flex;
  justify-content:center;
  padding:30px;
}

.financial-container{
  width:100%;
  max-width:1100px;
}

.title{
  text-align:center;
  margin-bottom:25px;
  font-size:28px;
  font-weight:600;
}

.loading{
  text-align:center;
  font-size:18px;
}

.error{
  background:#fee2e2;
  color:#991b1b;
  padding:12px;
  border-radius:8px;
  text-align:center;
}

.financial-grid{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
  gap:18px;
}

.card{
  background:white;
  border-radius:12px;
  padding:18px;
  box-shadow:0 6px 18px rgba(0,0,0,0.06);
}

.card h3{
  font-size:15px;
  color:#64748b;
  margin-bottom:6px;
}

.card p{
  font-size:20px;
  font-weight:600;
}

.highlight{
  background:#dbeafe;
}
</style>