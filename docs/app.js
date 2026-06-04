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

// Author Official Websites
const AUTHOR_WEBSITES = {
  "Elise Kova": "https://www.elisekova.com/events/",
  "Sarah J. Maas": "https://sarahjmaas.com/",
  "Rebecca Ross": "https://rebeccarossauthor.com/",
  "Rebecca Yarros": "https://www.rebeccayarros.com/",
  "Jennifer L. Armentrout": "https://jenniferlarmentrout.com/",
  "Brandon Sanderson": "https://www.brandonsanderson.com/",
  "Travis Baldree": "https://travisbaldree.com/",
  "V.E. Schwab": "https://www.veschwab.com/",
  "R.F. Kuang": "https://www.rfkuang.com/",
  "Colleen Hoover": "https://www.colleenhoover.com/",
  "Emily Henry": "https://www.emilyhenrybooks.com/",
  "Abby Jimenez": "https://www.abbyjimenez.com/",
  "Ali Hazelwood": "https://alihazelwood.com/",
  "Taylor Jenkins Reid": "https://www.taylorjenkinsreid.com/",
  "Stephen King": "https://stephenking.com/",
  "Amor Towles": "https://amortowles.com/",
  "James Clear": "https://jamesclear.com/",
  "Rick Rubin": "https://rickrubin.com/",
  "Michelle Obama": "https://becomingmichelleobama.com/"
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
  btnClearFilters: document.getElementById('btn-clear-filters'),
  filterAuthor: document.getElementById('filter-author'),
  ignoreDistance: document.getElementById('ignore-distance'),
  authorSearchFallback: document.getElementById('author-search-fallback')
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
  const selectedAuthor = elements.filterAuthor ? elements.filterAuthor.value : 'all';
  const ignoreDist = elements.ignoreDistance ? elements.ignoreDistance.checked : false;

  // 1. Filter events list
  filteredEvents = events.filter(evt => {
    // Event type check
    if (!activeEventTypes.has(evt.eventType)) return false;

    // Author filter check
    if (selectedAuthor && selectedAuthor !== 'all' && evt.author !== selectedAuthor) return false;

    // Date range check
    const evtDate = new Date(evt.date);
    if (evtDate < start || evtDate > end) return false;

    // Distance check
    evt.distance = haversineDistance(userLocation.lat, userLocation.lon, evt.lat, evt.lon);
    if (!ignoreDist && evt.distance !== null && evt.distance > radius) {
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

  // Update dynamic Google Search Fallbacks Banner
  const queryRaw = elements.searchText.value;
  updateAuthorFallbackWidget(selectedAuthor, queryRaw);
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
        
        ${evt.sourceUrl && evt.sourceName ? `
        <div class="event-source">
          <i class="fa-solid fa-circle-check" style="color: var(--secondary);"></i>
          <span>Source: <a href="${evt.sourceUrl}" target="_blank" class="source-link" title="Verify event details at the official source">${escapeHtml(evt.sourceName)}</a></span>
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
    if (elements.filterAuthor) {
      elements.filterAuthor.value = 'all';
    }
    if (elements.ignoreDistance) {
      elements.ignoreDistance.checked = false;
    }
    if (elements.radiusInput) {
      elements.radiusInput.disabled = false;
      elements.radiusInput.style.opacity = '1';
    }
    
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

  // 12. Author Filter change listener
  if (elements.filterAuthor) {
    elements.filterAuthor.addEventListener('change', () => {
      applyFiltersAndRender();
    });
  }

  // 13. Ignore Distance Checkbox listener
  if (elements.ignoreDistance) {
    elements.ignoreDistance.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      if (elements.radiusInput) {
        elements.radiusInput.disabled = isChecked;
        elements.radiusInput.style.opacity = isChecked ? '0.4' : '1';
      }
      applyFiltersAndRender();
    });
  }

  // 14. Load events dataset
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
    populateAuthorDropdown();
    
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

function populateAuthorDropdown() {
  if (!elements.filterAuthor) return;
  
  // Extract unique authors
  const uniqueAuthors = [...new Set(events.map(evt => evt.author))].sort();
  
  // Clear options except the first one ("All Authors")
  elements.filterAuthor.innerHTML = '<option value="all">✍️ All Authors</option>';
  
  uniqueAuthors.forEach(author => {
    const opt = document.createElement('option');
    opt.value = author;
    opt.textContent = author;
    elements.filterAuthor.appendChild(opt);
  });
}

// --- GOOGLE SEARCH FALLBACK WIDGET ---

function updateAuthorFallbackWidget(selectedAuthor, query) {
  const fallbackContainer = elements.authorSearchFallback;
  if (!fallbackContainer) return;

  let targetAuthor = "";
  
  if (selectedAuthor && selectedAuthor !== 'all') {
    targetAuthor = selectedAuthor;
  } else if (query && query.trim().length > 0) {
    const trimmedQuery = query.trim();
    // Check if query matches any known author in our events database
    const queryLower = trimmedQuery.toLowerCase();
    const knownAuthors = [...new Set(events.map(evt => evt.author))];
    const matchedAuthor = knownAuthors.find(auth => 
      auth.toLowerCase().includes(queryLower) || queryLower.includes(auth.toLowerCase())
    );
    
    if (matchedAuthor) {
      targetAuthor = matchedAuthor;
    } else if (trimmedQuery.split(/\s+/).length >= 2 || trimmedQuery.length >= 4) {
      // Use search text if it's long enough to be an author's name
      targetAuthor = trimmedQuery;
    }
  }

  if (!targetAuthor) {
    fallbackContainer.classList.add('hidden');
    fallbackContainer.innerHTML = '';
    return;
  }

  fallbackContainer.classList.remove('hidden');
  
  const links = [];
  
  // 1. Official site mapping
  const officialSite = AUTHOR_WEBSITES[targetAuthor];
  if (officialSite) {
    links.push({
      label: "Official Website",
      url: officialSite,
      icon: "fa-globe"
    });
  } else {
    links.push({
      label: "Find Official Site",
      url: `https://www.google.com/search?q=${encodeURIComponent('"' + targetAuthor + '" official author website events')}`,
      icon: "fa-globe"
    });
  }

  // 2. Google Search
  links.push({
    label: "Google Tour Search",
    url: `https://www.google.com/search?q=${encodeURIComponent('"' + targetAuthor + '" book signing event tour 2026')}`,
    icon: "fa-google"
  });

  // 3. Eventbrite
  links.push({
    label: "Eventbrite Signings",
    url: `https://www.google.com/search?q=site:eventbrite.com+${encodeURIComponent('"' + targetAuthor + '"')}`,
    icon: "fa-ticket"
  });

  // 4. Barnes & Noble Events
  links.push({
    label: "Barnes & Noble",
    url: `https://www.google.com/search?q=site:stores.barnesandnoble.com+${encodeURIComponent('"' + targetAuthor + '"')}`,
    icon: "fa-store"
  });

  // 5. Books-A-Million
  links.push({
    label: "Books-A-Million",
    url: `https://www.google.com/search?q=site:booksamillion.com/events+${encodeURIComponent('"' + targetAuthor + '"')}`,
    icon: "fa-store"
  });

  // 6. Fabled Fantasy Events
  links.push({
    label: "Fabled Events",
    url: `https://www.google.com/search?q=site:fabledfantasyevents.com+${encodeURIComponent('"' + targetAuthor + '"')}`,
    icon: "fa-wand-magic-sparkles"
  });

  // 7. Convention Panels (Dragon Con, Comic Con)
  links.push({
    label: "Conventions & Panels",
    url: `https://www.google.com/search?q=site:dragoncon.org+OR+site:comic-con.org+OR+site:newyorkcomiccon.com+OR+site:emeraldcitycomiccon.com+${encodeURIComponent('"' + targetAuthor + '"')}`,
    icon: "fa-users"
  });

  fallbackContainer.innerHTML = `
    <div class="fallback-banner-header">
      <i class="fa-solid fa-magnifying-glass-arrow-right"></i>
      <span>Looking for more events by ${escapeHtml(targetAuthor)}?</span>
    </div>
    <p class="fallback-banner-text">
      Because local calendars change frequently, try searching these major ticketing & venue directories on Google for <strong>${escapeHtml(targetAuthor)}</strong>:
    </p>
    <div class="fallback-links-container">
      ${links.map(lnk => `
        <a href="${lnk.url}" target="_blank" class="fallback-link-btn" title="Search for ${escapeHtml(targetAuthor)} on ${lnk.label}">
          <i class="fa-solid ${lnk.icon}"></i> ${lnk.label}
        </a>
      `).join('')}
    </div>
  `;
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Kickstart application when DOM is ready
document.addEventListener('DOMContentLoaded', init);
