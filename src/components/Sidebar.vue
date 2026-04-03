<template>
  <aside :class="['sidebar', { 'sidebar-closed': !open, 'mobile': isMobile }]">
    <div class="sidebar-header">
      <h2>Smart Portal</h2>
    </div>
    <ul>
      <li>
        <router-link to="/dashboard" active-class="active">
          <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-9 9a1 1 0 001.414 1.414L2 12.414V19a1 1 0 001 1h3a1 1 0 001-1v-3a1 1 0 011-1h2a1 1 0 011 1v3a1 1 0 001 1h3a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-9-9z"/>
          </svg>
          Home
        </router-link>
      </li>
      <li>
        <router-link to="/properties" active-class="active">
          <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
          </svg>
          Properties
        </router-link>
      </li>
      <li>
        <router-link to="/properties/add" active-class="active">
          <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
          </svg>
          Add Property
        </router-link>
      </li>
      <li>
        <router-link to="/bookings" active-class="active">
          <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
          </svg>
          Bookings
        </router-link>
      </li>
      <li>
        <router-link to="/financial" active-class="active">
          <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/>
          </svg>
          Financial Dashboard
        </router-link>
      </li>
    </ul>
  </aside>
</template>

<script setup>
import { defineProps, ref, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  open: { type: Boolean, default: true }
});

const isMobile = ref(window.innerWidth <= 768);

function handleResize() {
  isMobile.value = window.innerWidth <= 768;
}

onMounted(() => {
  window.addEventListener('resize', handleResize);
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.sidebar {
  width: 220px;
  background: #ffffff;
  border-radius: 10px;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  min-height: 100vh;
  transition: all 0.3s ease;
  position: relative;
  z-index: 30;
}

.sidebar-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.sidebar-header h2 {
  color: #374151;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

/* Sidebar closed */
.sidebar-closed {
  width: 0;
  padding: 0;
  overflow: hidden;
}

/* Mobile slide-in sidebar */
.mobile {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  transform: translateX(-100%);
  transition: transform 0.3s ease-in-out;
  z-index: 50;
  border-radius: 0;
}

.mobile.sidebar-closed {
  transform: translateX(-100%);
}

.mobile:not(.sidebar-closed) {
  transform: translateX(0);
}

/* Menu list */
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
li {
  margin-bottom: 0.5rem;
}
a {
  text-decoration: none;
  color: #6b79a0;
  display: flex;
  align-items: center;
  padding: 0.7rem 1rem;
  border-radius: 6px;
  transition: 0.2s;
}
.icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.75rem;
  flex-shrink: 0;
}
a.active, a:hover {
  background-color: #7184b7;
  color: white;
}

/* Mobile tweaks */
@media (max-width: 768px) {
  .sidebar {
    width: 220px;
    padding: 1rem;
    box-shadow: 0 0 12px rgba(0,0,0,0.2);
  }
  li {
    margin-bottom: 1rem;
  }
  a {
    font-size: 1rem;
    padding: 0.7rem 1rem;
  }
}
</style>
