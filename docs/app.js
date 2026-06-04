// Constants
const EARTH_RADIUS_MILES = 3958.8;
const INITIAL_BATCH_SIZE = 16; // 16 cards per page looks great on grid

// Application State
let events = [];
let filteredEvents = [];
let userLocation = { lat: 40.7128, lon: -74.0060 }; // Default to New York City
let activeEventTypes = new Set(["Author Signing", "Book Launch", "Book Club", "Poetry Reading", "Storytime", "Writing Workshop"]);
let currentSort = 'date'; // 'date' or 'distance'
let renderedCount = 0;

// Preset Cities
const CITY_PRESETS = {
  "40.7128,-74.0060": { name: "New York, NY", lat: 40.7128, lon: -74.0060 },
  "34.0522,-118.2437": { name: "Los Angeles, CA", lat: 34.0522, lon: -118.2437 },
  "41.8781,-87.6298": { name: "Chicago, IL", lat: 41.8781, lon: -87.6298 },
  "42.3601,-71.0589": { name: "Boston, MA", lat: 42.3601, lon: -71.0589 },
  "33.7490,-84.3880": { name: "Atlanta, GA", lat: 33.7490, lon: -84.3880 },
  "37.7749,-122.4194": { name: "San Francisco, CA", lat: 37.7749, lon: -122.4194 },
  "47.6062,-122.3321": { name: "Seattle, WA", lat: 47.6062, lon: -122.3321 },
  "39.7392,-104.9903": { name: "Denver, CO", lat: 39.7392, lon: -104.9903 },
  "45.5230,-122.6814": { name: "Portland, OR", lat: 45.5230, lon: -122.6814 },
  "25.7617,-80.1918": { name: "Miami, FL", lat: 25.7617, lon: -80.1918 }
};

// UI Elements
const elements = {
  presetCity: document.getElementById('preset-city'),
  btnGeolocation: document.getElementById('btn-geolocation'),
  latInput: document.getElementById('lat-input'),
  lonInput: document.getElementById('lon-input'),
  locationStatus: document.getElementById('location-status'),
  radiusInput: document.getElementById('radius-input'),
  radiusVal: document.getElementById('radius-val'),
  startDate: document.getElementById('start-date'),
  endDate: document.getElementById('end-date'),
  searchText: document.getElementById('search-text'),
  badgeToggles: document.querySelectorAll('.badge-toggle'),
  sortDate: document.getElementById('sort-date'),
  sortDistance: document.getElementById('sort-distance'),
  resultsCount: document.getElementById('results-count'),
  loading: document.getElementById('loading'),
  emptyState: document.getElementById('empty-state'),
  eventsGrid: document.getElementById('events-grid'),
  btnLoadMore: document.getElementById('btn-load-more'),
  btnResetFilters: document.getElementById('btn-reset-filters'),
  btnClearFilters: document.getElementById('btn-clear-filters')
};

// --- GEOLOCATION & DISTANCE ---

function haversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return null;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_MILES * c;
}

function getBrowserLocation() {
  elements.locationStatus.textContent = "📍 Querying location...";
  elements.locationStatus.className = "status-indicator";

  if (!navigator.geolocation) {
    updateLocationUI(userLocation.lat, userLocation.lon, "⚠️ Browser GPS unsupported. Using NYC.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      userLocation = { lat, lon };
      elements.presetCity.value = "current";
      updateLocationUI(lat, lon, "📍 Browser Location Active");
      applyFiltersAndRender();
    },
    (error) => {
      console.warn("Geolocation failed/blocked:", error);
      updateLocationUI(userLocation.lat, userLocation.lon, "⚠️ Location blocked. Using NYC.");
      applyFiltersAndRender();
    },
    { timeout: 6000 }
  );
}

function updateLocationUI(lat, lon, statusText) {
  elements.latInput.value = lat.toFixed(4);
  elements.lonInput.value = lon.toFixed(4);
  elements.locationStatus.textContent = statusText;
}

// --- GOOGLE LINKS ---

function getGoogleCalendarUrl(event) {
  const title = `[${event.eventType}] ${event.bookTitle} - ${event.author}`;
  
  const formatCalDate = (isoStr) => {
    return isoStr.replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const startCalDate = formatCalDate(event.date);
  
  // Estimate event duration as 2 hours
  const startDate = new Date(event.date);
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
  const endCalDate = formatCalDate(endDate.toISOString());

  const location = `${event.venue}, ${event.address}, ${event.city}, ${event.state} ${event.zip}`;
  const details = `${event.description}\n\nBook Title: ${event.bookTitle}\nAuthor: ${event.author}\nGenre: ${event.genre}\nISBN: ${event.isbn}\nStore Website: ${event.website}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startCalDate}/${endCalDate}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
}

function getGoogleMapsUrl(event) {
  return `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lon}&destination=${event.lat},${event.lon}`;
}

// --- FILTER & RENDER ---

function applyFiltersAndRender() {
  const radius = parseFloat(elements.radiusInput.value) || 100;
  
  // Parse inputs as local dates
  const startVal = elements.startDate.value;
  const endVal = elements.endDate.value;
  
  const start = startVal ? new Date(startVal + 'T00:00:00') : new Date(-8640000000000000);
  const end = endVal ? new Date(endVal + 'T23:59:59') : new Date(8640000000000000);
  const query = elements.searchText.value.toLowerCase().trim();

  // 1. Filter events list
  filteredEvents = events.filter(evt => {
    // Event type check
    if (!activeEventTypes.has(evt.eventType)) return false;

    // Date range check
    const evtDate = new Date(evt.date);
    if (evtDate < start || evtDate > end) return false;

    // Distance check
    evt.distance = haversineDistance(userLocation.lat, userLocation.lon, evt.lat, evt.lon);
    if (evt.distance !== null && evt.distance > radius) {
      return false;
    }

    // Text search (Title, bookTitle, Author, Venue, City, State, Genre)
    if (query) {
      const matchText = `${evt.title} ${evt.bookTitle} ${evt.author} ${evt.venue} ${evt.city} ${evt.state} ${evt.genre} ${evt.isbn}`.toLowerCase();
      if (!matchText.includes(query)) return false;
    }

    return true;
  });

  // 2. Sort results
  if (currentSort === 'date') {
    filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (currentSort === 'distance') {
    filteredEvents.sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });
  }

  // 3. Update count
  elements.resultsCount.textContent = `Found ${filteredEvents.length} ${filteredEvents.length === 1 ? 'event' : 'events'} matching filters`;

  // 4. Reset rendering
  renderedCount = 0;
  elements.eventsGrid.innerHTML = '';
  
  if (filteredEvents.length === 0) {
    elements.emptyState.classList.remove('hidden');
    elements.btnLoadMore.classList.add('hidden');
  } else {
    elements.emptyState.classList.add('hidden');
    renderNextBatch();
  }
}

function renderNextBatch() {
  const nextBatch = filteredEvents.slice(renderedCount, renderedCount + INITIAL_BATCH_SIZE);
  
  const fragment = document.createDocumentFragment();
  nextBatch.forEach(evt => {
    const card = createEventCard(evt);
    fragment.appendChild(card);
  });
  
  elements.eventsGrid.appendChild(fragment);
  renderedCount += nextBatch.length;

  if (renderedCount < filteredEvents.length) {
    elements.btnLoadMore.classList.remove('hidden');
  } else {
    elements.btnLoadMore.classList.add('hidden');
  }
}

function createEventCard(evt) {
  const card = document.createElement('article');
  card.className = 'event-card';
  
  // Format Date and Time
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const d = new Date(evt.date);
  const dateString = d.toLocaleDateString('en-US', options);
  const timeString = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  
  // Distance string
  const distanceStr = evt.distance !== null ? `${evt.distance.toFixed(1)} miles away` : '';
  
  card.innerHTML = `
    <span class="event-badge" style="background-color: ${evt.eventColor}">
      <i class="fa-solid ${evt.eventIcon}"></i> ${evt.eventType}
    </span>
    <div class="event-card-body">
      <div class="book-cover-container">
        <div class="book-cover-shadow"></div>
        <img class="book-cover" src="${evt.coverUrl}" alt="Book Cover for ${evt.bookTitle}" loading="lazy">
      </div>
      <div class="event-info">
        <h3 class="event-card-title" title="${evt.title}">${evt.title}</h3>
        <div class="book-details">
          Featured Book: <strong>${evt.bookTitle}</strong>
        </div>
        <div class="book-author">By ${evt.author}</div>
        <span class="genre-tag">${evt.genre}</span>
        
        <div class="event-time">
          <i class="fa-solid fa-clock"></i> ${dateString} @ ${timeString}
        </div>
        
        <div class="event-venue">
          <i class="fa-solid fa-location-dot"></i>
          <div>
            <strong>${evt.venue}</strong><br>
            <span style="font-size: 0.8rem; color: var(--text-muted);">${evt.address}, ${evt.city}, ${evt.state}</span>
          </div>
        </div>
        
        ${distanceStr ? `
        <div class="event-distance">
          <i class="fa-solid fa-road"></i> ${distanceStr}
        </div>` : ''}
        
        <p class="event-description" title="${evt.description}">${evt.description}</p>
      </div>
    </div>
    <div class="event-actions">
      <a href="${getGoogleMapsUrl(evt)}" target="_blank" class="btn btn-map" title="Get Google Maps navigation directions">
        <i class="fa-solid fa-diamond-turn-right"></i> Directions
      </a>
      <a href="${getGoogleCalendarUrl(evt)}" target="_blank" class="btn btn-cal" title="Add event to Google Calendar">
        <i class="fa-solid fa-calendar-plus"></i> Add to Cal
      </a>
      <a href="${evt.website}" target="_blank" class="btn btn-web" title="Visit bookstore website for tickets or updates">
        <i class="fa-solid fa-store"></i> Store Details
      </a>
    </div>
  `;
  
  return card;
}

// --- SETUP EVENT LISTENERS ---

function init() {
  // 1. Initial dates anchoring (defaults to today and 45 days in the future)
  const today = new Date();
  const formatStr = (d) => d.toISOString().split('T')[0];
  elements.startDate.value = formatStr(today);
  
  const future = new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000);
  elements.endDate.value = formatStr(future);

  // 2. Preset City selection listener
  elements.presetCity.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val === 'current') {
      getBrowserLocation();
    } else {
      const parts = val.split(',');
      if (parts.length === 2) {
        const lat = parseFloat(parts[0]);
        const lon = parseFloat(parts[1]);
        userLocation = { lat, lon };
        updateLocationUI(lat, lon, `📍 Preset: ${CITY_PRESETS[val].name}`);
        applyFiltersAndRender();
      }
    }
  });

  // 3. Geolocation button listener
  elements.btnGeolocation.addEventListener('click', () => {
    getBrowserLocation();
  });

  // 4. Coordinates inputs inputs change
  const handleCoordChange = () => {
    const lat = parseFloat(elements.latInput.value);
    const lon = parseFloat(elements.lonInput.value);
    if (!isNaN(lat) && !isNaN(lon)) {
      userLocation = { lat, lon };
      elements.presetCity.value = "custom";
      // Check if custom option exists, else add it
      let customOpt = elements.presetCity.querySelector('option[value="custom"]');
      if (!customOpt) {
        customOpt = document.createElement('option');
        customOpt.value = 'custom';
        customOpt.textContent = '📍 Custom Coordinates';
        elements.presetCity.appendChild(customOpt);
      }
      elements.presetCity.value = 'custom';
      elements.locationStatus.textContent = '📍 Custom Coordinates Active';
      applyFiltersAndRender();
    }
  };
  elements.latInput.addEventListener('input', handleCoordChange);
  elements.lonInput.addEventListener('input', handleCoordChange);

  // 5. Radius slider change
  elements.radiusInput.addEventListener('input', (e) => {
    const val = e.target.value;
    elements.radiusVal.textContent = `${val} miles`;
  });
  elements.radiusInput.addEventListener('change', () => {
    applyFiltersAndRender();
  });

  // 6. Date inputs change
  elements.startDate.addEventListener('change', () => applyFiltersAndRender());
  elements.endDate.addEventListener('change', () => applyFiltersAndRender());

  // 7. Text Search change (debounce search input)
  let searchDebounce;
  elements.searchText.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      applyFiltersAndRender();
    }, 250);
  });

  // 8. Event Type Badge Toggles
  elements.badgeToggles.forEach(badge => {
    badge.addEventListener('click', () => {
      const type = badge.getAttribute('data-type');
      if (activeEventTypes.has(type)) {
        activeEventTypes.delete(type);
        badge.classList.remove('active');
      } else {
        activeEventTypes.add(type);
        badge.classList.add('active');
      }
      applyFiltersAndRender();
    });
  });

  // 9. Sort Buttons
  elements.sortDate.addEventListener('click', () => {
    if (currentSort !== 'date') {
      currentSort = 'date';
      elements.sortDate.classList.add('active');
      elements.sortDistance.classList.remove('active');
      applyFiltersAndRender();
    }
  });

  elements.sortDistance.addEventListener('click', () => {
    if (currentSort !== 'distance') {
      currentSort = 'distance';
      elements.sortDistance.classList.add('active');
      elements.sortDate.classList.remove('active');
      applyFiltersAndRender();
    }
  });

  // 10. Load More Button
  elements.btnLoadMore.addEventListener('click', () => {
    renderNextBatch();
  });

  // 11. Reset / Clear Filters buttons
  const resetFilters = () => {
    const today = new Date();
    const formatStr = (d) => d.toISOString().split('T')[0];
    elements.startDate.value = formatStr(today);
    
    const future = new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000);
    elements.endDate.value = formatStr(future);
    elements.radiusInput.value = '100';
    elements.radiusVal.textContent = '100 miles';
    elements.searchText.value = '';
    
    // Select NYC by default
    elements.presetCity.value = '40.7128,-74.0060';
    userLocation = { lat: 40.7128, lon: -74.0060 };
    updateLocationUI(40.7128, -74.0060, '📍 Preset: New York, NY');

    // Turn all badge toggles active
    activeEventTypes = new Set(["Author Signing", "Book Launch", "Book Club", "Poetry Reading", "Storytime", "Writing Workshop"]);
    elements.badgeToggles.forEach(badge => badge.classList.add('active'));

    // Reset sort
    currentSort = 'date';
    elements.sortDate.classList.add('active');
    elements.sortDistance.classList.remove('active');

    applyFiltersAndRender();
  };

  elements.btnResetFilters.addEventListener('click', resetFilters);
  elements.btnClearFilters.addEventListener('click', resetFilters);

  // 12. Load events dataset
  fetchEventsData();
}

async function fetchEventsData() {
  try {
    elements.loading.classList.remove('hidden');
    elements.eventsGrid.classList.add('hidden');
    
    const response = await fetch('data/events.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch event database (Status: ${response.status})`);
    }
    
    events = await response.json();
    
    // Simulate minor delay to appreciate the custom book-opening flip animation
    setTimeout(() => {
      elements.loading.classList.add('hidden');
      elements.eventsGrid.classList.remove('hidden');
      applyFiltersAndRender();
    }, 800);

  } catch (error) {
    console.error("Critical error fetching events.json:", error);
    elements.loading.innerHTML = `
      <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; color: #ef4444;"></i>
      <h3 style="color: var(--text-white); margin-top: 10px;">Failed to Load Book Events</h3>
      <p style="color: var(--text-muted); max-width: 450px; margin: 5px auto 0;">
        We encountered a problem fetching the database: ${error.message}. Please check if the build has run successfully.
      </p>
    `;
  }
}

// Kickstart application when DOM is ready
document.addEventListener('DOMContentLoaded', init);
