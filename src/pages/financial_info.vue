<template>
  <div class="financial-page">
    <div class="financial-container">

      <h2 class="title">Merchant Financial Dashboard</h2>

      <!-- Loading -->
      <div v-if="loading">Loading financial data...</div>

      <!-- Error -->
      <div v-else-if="error">{{ error }}</div>

      <!-- Data -->
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

        <div class="card">
          <h3>Profit After Tax</h3>
          <p>{{ formatCurrency(financialInfo?.profitAfterTax) }}</p>
        </div>

        <div class="card">
          <h3>Months Used For Learning</h3>
          <p>{{ financialInfo?.monthsUsedForLearning ?? 0 }}</p>
        </div>

      </div>

      <!-- ✅ SIMPLE CHART (just added) -->
      <div v-if="!loading && !error" style="margin-top: 20px;">
        <canvas id="financialChart"></canvas>
      </div>

    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, watch, nextTick, computed } from "vue"
import axios from "axios"
import Chart from "chart.js/auto"

const API_BASE = "https://lmgtech-4.onrender.com"

// ================= STATE =================
const loading = ref(true)
const error = ref("")
const financialInfo = ref({})
const chartInstance = ref(null)

// ================= HELPERS =================
const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return "0 ETB"
  return new Intl.NumberFormat().format(value) + " ETB"
}

// Safely extract numeric values
const safeValue = (val) => (isNaN(val) || val == null ? 0 : Number(val))

// ================= COMPUTED DATA FOR CHART =================
const chartData = computed(() => ({
  labels: [
    "Monthly Income",
    "Projected",
    "Historical Avg",
    "Yearly Income",
    "Next Month",
    "Tax",
    "Profit",
  ],
  values: [
    safeValue(financialInfo.value.monthlyIncome),
    safeValue(financialInfo.value.projectedCurrentMonth),
    safeValue(financialInfo.value.historicalMonthlyAverage),
    safeValue(financialInfo.value.yearlyIncome),
    safeValue(financialInfo.value.predictedNextMonth),
    safeValue(financialInfo.value.estimatedTaxYear),
    safeValue(financialInfo.value.profitAfterTax),
  ],
}))

// ================= CHART RENDER =================
const renderChart = async () => {
  await nextTick()

  const canvas = document.getElementById("financialChart")
  if (!canvas) return

  // destroy old chart
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }

  chartInstance.value = new Chart(canvas, {
    type: "bar",
    data: {
      labels: chartData.value.labels,
      datasets: [
        {
          label: "Amount (ETB)",
          data: chartData.value.values,
          borderWidth: 2,
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
        },
        tooltip: {
          callbacks: {
            label: (ctx) => formatCurrency(ctx.raw),
          },
        },
      },
      scales: {
        y: {
          ticks: {
            callback: (value) => formatCurrency(value),
          },
        },
      },
    },
  })
}

// ================= API CALL =================
const fetchFinancialInfo = async () => {
  loading.value = true
  error.value = ""

  try {
    const token = localStorage.getItem("merchantToken")
    if (!token) throw new Error("Authentication required. Please login.")

    const response = await axios.get(
      `${API_BASE}/merchant/financial-info`,
      {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000, // ⏱️ prevent hanging requests
      }
    )

    const data = response?.data

    if (data?.success && data.financialInfo) {
      financialInfo.value = data.financialInfo
    } else {
      throw new Error("No financial data available")
    }

  } catch (err) {
    console.error("Fetch error:", err)

    if (err.code === "ECONNABORTED") {
      error.value = "Request timeout. Try again."
    } else if (err.response?.status === 401) {
      error.value = "Session expired. Please login again."
    } else {
      error.value =
        err.response?.data?.message ||
        err.message ||
        "Failed to load financial data"
    }
  } finally {
    loading.value = false
  }
}

// ================= WATCH (AUTO UPDATE CHART) =================
watch(
  financialInfo,
  async (newVal) => {
    if (newVal && Object.keys(newVal).length > 0) {
      await renderChart()
    }
  },
  { deep: true }
)

// ================= LIFECYCLE =================
onMounted(fetchFinancialInfo)
</script><style>
.financial-page {
  min-height: 100vh;
  background: linear-gradient(135deg,#eef2ff,#f8fafc);
  display: flex;
  justify-content: center;
  padding: 30px;
}

.financial-container {
  width: 100%;
  max-width: 1100px;
}

.title {
  text-align: center;
  margin-bottom: 25px;
  font-size: 28px;
  font-weight: 600;
}

.loading {
  text-align: center;
  font-size: 18px;
}

.error {
  background: #fee2e2;
  color: #991b1b;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
}

.financial-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
}

/* Cards */
.card {
  background: white;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.06);
}

.card h3 {
  font-size: 15px;
  color: #64748b;
  margin-bottom: 6px;
}

.card p {
  font-size: 20px;
  font-weight: 600;
}

/* Highlight */
.highlight {
  background: #dbeafe;
}

/* ✅ NEW: Chart container (simple) */
canvas {
  margin-top: 20px;
  background: white;
  padding: 10px;
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.06);
  max-height: 400px;
  width: 100%;
}
</style>