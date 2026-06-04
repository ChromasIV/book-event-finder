# BookBound - Book Event Finder

A premium, interactive web application that helps book enthusiasts discover and search upcoming local literary events—including author signings, book clubs, book launches, poetry readings, and writing workshops. Filterable by coordinates, search radius, date ranges, and categories.

**Theme Version:** 1.2.0  
**Status:** Complete & Ready for local or GitHub Pages execution!

---

## 📚 Features

- **Cozy Midnight Library Aesthetics**: Immersive glassmorphic UI styled with deep indigo canvases, warm gilded copper accents, soft book shadows, and glowing lights.
- **Smart Geolocation**: Instantly queries browser location coordinates, maps to preset cities (NYC, Los Angeles, Chicago, Seattle, etc.), or accepts custom user-defined coordinates.
- **Haversine Distance Filter**: Calculates straight-line distance (in miles) in-browser dynamically from the base location using the Haversine mathematical formula. Adjustable via an interactive 10 to 500-mile slider.
- **Book Cover & Genre Integration**: Integrates real literary works (such as *The Familiar*, *Funny Story*, *Atomic Habits*, and *Onyx Storm*) with cover images pulled directly from the Open Library covers API.
- **Type Badges Toggles**: Easy multi-selection badge filters to isolate specific styles of events, including Signings, Launches, Book Clubs, Poetry readings, and Writing Workshops.
- **Automated Directions & Calendar Invites**:
  - Direct directions mapping from the user's base location to bookstore coordinates via **Google Maps Direction Routing API**.
  - One-click **Google Calendar Event Scheduling** with pre-filled times, description details, location coordinates, bookstore URLs, and book ISBNs.
- **Responsive Animations**: Beautiful rotating book-covers on hover and custom CSS page-flipping loaders during database fetches.

---

## 🏗️ Architecture

```
                                   +-----------------------+
                                   |     Fetch/Compile     |
                                   |  (scripts/fetch-events) |
                                   +-----------+-----------+
                                               |
                                               v (Runs on demand / CI)
                                   +-----------+-----------+
                                   |    docs/data/events.json|
                                   +-----------+-----------+
                                               |
                                               v (Loads into app.js)
+---------------------------------------------+----------------------------------------------+
| Client-Side Browser Workspace                                                              |
|                                                                                            |
|   /docs                                                                                    |
|     ├── data/events.json <------------ (Enriched list of events, bookstores, & book data)  |
|     ├── index.html <------------------ (Midnight Library Glassmorphic Dashboard layout)    |
|     ├── style.css <------------------- (Cozy responsive indigo/amber styling, page flip animation)|
|     └── app.js <---------------------- (Client-side geolocation, Haversine filters & mapping)|
|                                                                                            |
+--------------------------------------------------------------------------------------------+
```

---

## 🚀 Running Locally

### Prerequisites

- Node.js (v18 or higher is recommended)

### Setup & Run

1. Navigate to the project folder:
   ```bash
   cd book-event-finder
   ```
2. (Optional) Re-fetch or regenerate the event database:
   ```bash
   npm run fetch-data
   ```
   This will run `scripts/fetch-events.js` and build a fresh `docs/data/events.json` starting from June 4, 2026.
3. Start the local server:
   ```bash
   npm start
   ```
   This executes `http-server` pointing to the `/docs` directory.
4. Open [http://localhost:8080](http://localhost:8080) in your web browser.

---

## 🌐 Deployment to GitHub Pages

To host this project for free on GitHub Pages:

1. Push this folder to your GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initialize BookBound Event Finder"
   git remote add origin https://github.com/<your-username>/book-event-finder.git
   git push -u origin main
   ```
2. Navigate to your repository settings on GitHub.
3. Select **Pages** from the sidebar.
4. Set the Build and deployment source to **Deploy from a branch**.
5. Choose `main` as the source branch and set the target folder to `/docs`.
6. Click **Save**. Within a minute, your page will be live at `https://<your-username>.github.io/book-event-finder/`!
