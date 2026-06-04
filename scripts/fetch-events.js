const fs = require('fs');
const path = require('path');

// Reference Current Date (defaults to Execution Date)
const START_DATE = new Date();

const BOOKSTORES = [
  { id: "strand-nyc", name: "The Strand Bookstore", address: "828 Broadway", city: "New York", state: "NY", zip: "10003", lat: 40.7332, lon: -73.9907, website: "https://www.strandbooks.com" },
  { id: "powells-portland", name: "Powell's City of Books", address: "1005 W Burnside St", city: "Portland", state: "OR", zip: "97209", lat: 45.5230, lon: -122.6814, website: "https://www.powells.com" },
  { id: "bookpeople-austin", name: "BookPeople", address: "603 N Lamar Blvd", city: "Austin", state: "TX", zip: "78703", lat: 30.2718, lon: -97.7537, website: "https://www.bookpeople.com" },
  { id: "tattered-denver", name: "Tattered Cover Book Store", address: "2526 E Colfax Ave", city: "Denver", state: "CO", zip: "80206", lat: 39.7523, lon: -105.0084, website: "https://www.tatteredcover.com" },
  { id: "harvard-boston", name: "Harvard Book Store", address: "1256 Massachusetts Ave", city: "Cambridge", state: "MA", zip: "02138", lat: 42.3734, lon: -71.1166, website: "https://www.harvard.com" },
  { id: "politics-dc", name: "Politics and Prose", address: "5015 Connecticut Ave NW", city: "Washington", state: "DC", zip: "20008", lat: 38.9619, lon: -77.0759, website: "https://www.politics-prose.com" },
  { id: "elliott-seattle", name: "Elliott Bay Book Company", address: "1521 10th Ave", city: "Seattle", state: "WA", zip: "98122", lat: 47.6146, lon: -122.3204, website: "https://www.elliottbaybook.com" },
  { id: "vromans-la", name: "Vroman's Bookstore", address: "695 E Colorado Blvd", city: "Pasadena", state: "CA", zip: "91101", lat: 34.1432, lon: -118.1317, website: "https://www.vromansbookstore.com" },
  { id: "citylights-sf", name: "City Lights Booksellers", address: "261 Columbus Ave", city: "San Francisco", state: "CA", zip: "94133", lat: 37.7976, lon: -122.4066, website: "https://www.citylights.com" },
  { id: "booksbooks-miami", name: "Books & Books", address: "265 Aragon Ave", city: "Coral Gables", state: "FL", zip: "33134", lat: 25.7503, lon: -80.2587, website: "https://booksandbooks.com" },
  { id: "parnassus-nashville", name: "Parnassus Books", address: "3900 Hillsboro Pike", city: "Nashville", state: "TN", zip: "37215", lat: 36.1042, lon: -86.8184, website: "https://www.parnassusbooks.net" },
  { id: "magers-minneapolis", name: "Magers & Quinn Booksellers", address: "3038 Hennepin Ave", city: "Minneapolis", state: "MN", zip: "55408", lat: 44.9482, lon: -93.3006, website: "https://www.magersandquinn.com" },
  { id: "square-oxford", name: "Square Books", address: "160 Courthouse Square", city: "Oxford", state: "MS", zip: "38655", lat: 34.3664, lon: -89.5186, website: "https://www.squarebooks.com" },
  { id: "booksmith-sf", name: "Booksmith", address: "1644 Haight St", city: "San Francisco", state: "CA", zip: "94117", lat: 37.7699, lon: -122.4502, website: "https://www.booksmith.com" },
  { id: "johnking-detroit", name: "John K. King Used & Rare Books", address: "901 W Lafayette Blvd", city: "Detroit", state: "MI", zip: "48226", lat: 42.3283, lon: -83.0573, website: "https://www.johnkingbooksdetroit.com" },
  { id: "writersblock-orlando", name: "Writer's Block Bookstore", address: "316 N Park Ave", city: "Winter Park", state: "FL", zip: "32789", lat: 28.5997, lon: -81.3512, website: "https://writersblockbookstore.com" },
  { id: "bookshop-santacruz", name: "Bookshop Santa Cruz", address: "1520 Pacific Ave", city: "Santa Cruz", state: "CA", zip: "95060", lat: 36.9723, lon: -122.0264, website: "https://www.bookshopsantacruz.com" },
  { id: "unabridged-chicago", name: "Unabridged Bookstore", address: "3251 N Broadway", city: "Chicago", state: "IL", zip: "60657", lat: 41.9381, lon: -87.6493, website: "https://www.unabridgedbookstore.com" },
  { id: "boulderbooks-boulder", name: "Boulder Book Store", address: "1107 Pearl St", city: "Boulder", state: "CO", zip: "80302", lat: 40.0177, lon: -105.2797, website: "https://www.boulderbookstore.net" },
  { id: "quailridge-raleigh", name: "Quail Ridge Books", address: "3801 Computer Dr", city: "Raleigh", state: "NC", zip: "27609", lat: 35.8197, lon: -78.6756, website: "https://www.quailridgebooks.com" },
  { id: "skylight-la", name: "Skylight Books", address: "1818 N Vermont Ave", city: "Los Angeles", state: "CA", zip: "90027", lat: 34.1038, lon: -118.2917, website: "https://www.skylightbooks.com" },
  { id: "lastbookstore-la", name: "The Last Bookstore", address: "453 S Spring St", city: "Los Angeles", state: "CA", zip: "90013", lat: 34.0477, lon: -118.2498, website: "https://www.lastbookstore.la" },
  { id: "acappella-atlanta", name: "A Cappella Books", address: "208 Haralson Ave NE", city: "Atlanta", state: "GA", zip: "30307", lat: 33.7594, lon: -84.3541, website: "https://www.acappellabooks.com" },
  { id: "bn-unionsq-nyc", name: "Barnes & Noble", address: "33 E 17th St", city: "New York", state: "NY", zip: "10003", lat: 40.7371, lon: -73.9903, website: "https://www.barnesandnoble.com" },
  { id: "bn-thegrove-la", name: "Barnes & Noble", address: "189 The Grove Dr", city: "Los Angeles", state: "CA", zip: "90036", lat: 34.0722, lon: -118.3582, website: "https://www.barnesandnoble.com" },
  { id: "bn-webster-chicago", name: "Barnes & Noble", address: "1441 W Webster Ave", city: "Chicago", state: "IL", zip: "60614", lat: 41.9218, lon: -87.6645, website: "https://www.barnesandnoble.com" },
  { id: "bn-prudential-boston", name: "Barnes & Noble", address: "800 Boylston St", city: "Boston", state: "MA", zip: "02199", lat: 42.3484, lon: -71.0825, website: "https://www.barnesandnoble.com" },
  { id: "bn-pacific-seattle", name: "Barnes & Noble", address: "600 Pine St", city: "Seattle", state: "WA", zip: "98101", lat: 47.6122, lon: -122.3351, website: "https://www.barnesandnoble.com" },
  { id: "bn-glendale-denver", name: "Barnes & Noble", address: "960 S Colorado Blvd", city: "Denver", state: "CO", zip: "80246", lat: 39.7001, lon: -104.9406, website: "https://www.barnesandnoble.com" },
  { id: "bn-lloyd-portland", name: "Barnes & Noble", address: "1317 Lloyd Center", city: "Portland", state: "OR", zip: "97232", lat: 45.5321, lon: -122.6534, website: "https://www.barnesandnoble.com" },
  { id: "bam-kennesaw-atlanta", name: "Books-A-Million", address: "4400 Cobb Pkwy NW", city: "Kennesaw", state: "GA", zip: "30152", lat: 34.0242, lon: -84.6190, website: "https://www.booksamillion.com" },
  { id: "bam-ftlauderdale-miami", name: "Books-A-Million", address: "1350 W Sunrise Blvd", city: "Fort Lauderdale", state: "FL", zip: "33311", lat: 26.1378, lon: -80.1601, website: "https://www.booksamillion.com" },
  { id: "fabled-la", name: "Fabled Fantasy Events", address: "1200 S Grand Ave", city: "Los Angeles", state: "CA", zip: "90015", lat: 34.0407, lon: -118.2690, website: "https://fabledfantasyevents.com" },
  { id: "thirdplace-lfp", name: "Third Place Books (Lake Forest Park)", address: "17171 Bothell Way NE", city: "Lake Forest Park", state: "WA", zip: "98155", lat: 47.7541, lon: -122.2781, website: "https://www.thirdplacebooks.com" },
  { id: "thirdplace-ravenna", name: "Third Place Books (Ravenna)", address: "6504 20th Ave NE", city: "Seattle", state: "WA", zip: "98115", lat: 47.6759, lon: -122.3061, website: "https://www.thirdplacebooks.com" },
  { id: "thirdplace-seward", name: "Third Place Books (Seward Park)", address: "5041 Wilson Ave S", city: "Seattle", state: "WA", zip: "98118", lat: 47.5562, lon: -122.2691, website: "https://www.thirdplacebooks.com" },
  { id: "sdcc-sandiego", name: "San Diego Comic-Con", address: "111 W Harbor Dr", city: "San Diego", state: "CA", zip: "92101", lat: 32.7068, lon: -117.1622, website: "https://www.comic-con.org" },
  { id: "nycc-nyc", name: "New York Comic Con", address: "655 W 34th St", city: "New York", state: "NY", zip: "10001", lat: 40.7578, lon: -74.0026, website: "https://www.newyorkcomiccon.com" },
  { id: "dragoncon-atlanta", name: "Dragon Con", address: "265 Peachtree St NE", city: "Atlanta", state: "GA", zip: "30303", lat: 33.7612, lon: -84.3861, website: "https://www.dragoncon.org" },
  { id: "eccc-seattle", name: "Emerald City Comic Con", address: "705 Pike St", city: "Seattle", state: "WA", zip: "98101", lat: 47.6116, lon: -122.3329, website: "https://www.emeraldcitycomiccon.com" }
];

const CURATED_BOOKS = [
  {
    title: "The Familiar",
    author: "Leigh Bardugo",
    genre: "Fantasy",
    coverId: "14210344", // Open Library Cover ID
    description: "In the Spanish Golden Age, a kitchen maid with secret, magical talents finds herself caught in a deadly game of ambition, heresy, and romance as she is thrust into the path of the Inquisition.",
    isbn: "9781250333858"
  },
  {
    title: "Funny Story",
    author: "Emily Henry",
    genre: "Romance",
    coverId: "14299833",
    description: "A shimmering, delightful story about Daphne, who finds herself stranded in a beautiful Michigan town sharing a roof with her ex-fiance's new partner's ex, Miles. Together, they hatch a plan.",
    isbn: "9780593441282"
  },
  {
    title: "Iron Flame",
    author: "Rebecca Yarros",
    genre: "Fantasy",
    coverId: "13975730",
    description: "The second year at Basgiath War College begins, and the stakes have never been higher. Violet Sorrengail knows she must survive the brutal training while hiding a secret that could break the kingdom.",
    isbn: "9781649374172"
  },
  {
    title: "Table for Two",
    author: "Amor Towles",
    genre: "Fiction",
    coverId: "14123512",
    description: "A collection of six stories set in New York City at the turn of the millennium and a novella set in Golden Age Hollywood, exploring the chance encounters and decisions that shape our lives.",
    isbn: "9780593296370"
  },
  {
    title: "The Women",
    author: "Kristin Hannah",
    genre: "Historical Fiction",
    coverId: "14013442",
    description: "A deeply moving tribute to the army nurses who served in the Vietnam War, exploring the patriotism, trauma, and resilience of the women who volunteered to save lives in a war-torn country.",
    isbn: "9781250178633"
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    genre: "Non-Fiction",
    coverId: "10565261",
    description: "No matter your goals, Atomic Habits offers a proven framework for improving every day. Learn practical strategies to build good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.",
    isbn: "9780735211292"
  },
  {
    title: "The Creative Act: A Way of Being",
    author: "Rick Rubin",
    genre: "Non-Fiction",
    coverId: "13426117",
    description: "A legendary music producer shares his wisdom on the creative process, offering a beautiful, philosophical guide to accessing our innate creativity and finding art in the everyday moments of life.",
    isbn: "9780593652886"
  },
  {
    title: "Bookshops & Bonedust",
    author: "Travis Baldree",
    genre: "Fantasy",
    coverId: "13838150",
    description: "In this heartwarming prequel to Legends & Lattes, an injured young Viv is forced to spend her recovery in a sleepy seaside town, where she stumbles into a struggling bookstore and its colorful owner.",
    isbn: "9781250881588"
  },
  {
    title: "The Wager",
    author: "David Grann",
    genre: "History",
    coverId: "13433550",
    description: "A thrilling, true story of shipwreck, mutiny, and survival in the 18th century, charting the harrowing journey of a British vessel lost on a desolate island off Cape Horn.",
    isbn: "9780385534260"
  },
  {
    title: "The Anxious Generation",
    author: "Jonathan Haidt",
    genre: "Non-Fiction",
    coverId: "14123514",
    description: "An investigation into how the transition from a 'play-based childhood' to a 'phone-based childhood' has contributed to the epidemic of mental illness among teenagers, and what parents and schools can do.",
    isbn: "9780593655030"
  },
  {
    title: "James",
    author: "Percival Everett",
    genre: "Fiction",
    coverId: "14123518",
    description: "A brilliant, subversive reimagining of Adventures of Huckleberry Finn, told from the perspective of the enslaved Jim. Rich with humor, danger, and philosophical depth.",
    isbn: "9780385550369"
  },
  {
    title: "You Are Here",
    author: "David Nicholls",
    genre: "Romance",
    coverId: "14299839",
    description: "A warm, witty, and moving love story about two lonely people who find themselves embarking on a long-distance walking journey across the gorgeous, rain-swept English countryside.",
    isbn: "9780063353596"
  },
  {
    title: "Onyx Storm",
    author: "Rebecca Yarros",
    genre: "Fantasy",
    coverId: "14389129",
    description: "The thrilling continuation of the Empyrean series. Violet Sorrengail must prepare for an all-out war as the dark forces gather on the borders of Navarre, risking everything she loves.",
    isbn: "9781649374189"
  },
  {
    title: "The Wind Knows My Name",
    author: "Isabel Allende",
    genre: "Historical Fiction",
    coverId: "13565129",
    description: "This powerful novel weaves together the stories of a young boy escaping Nazi-occupied Europe and a girl fleeing violence in El Salvador, exploring the sacrifices parents make and the endurance of love.",
    isbn: "9780593598108"
  },
  {
    title: "Clear Thinking",
    author: "Shane Parrish",
    genre: "Non-Fiction",
    coverId: "13912150",
    description: "The creator of Farnam Street gives you the tools to recognize and overcome your cognitive biases, think clearly under pressure, and make smarter, more deliberate decisions in work and life.",
    isbn: "9780593545195"
  },
  {
    title: "The Heaven & Earth Grocery Store",
    author: "James McBride",
    genre: "Fiction",
    coverId: "13636512",
    description: "In a small, diverse neighborhood in Pottstown, Pennsylvania in the 1920s and 30s, the discovery of a skeleton at the bottom of a well reveals secrets long kept by Jewish and Black residents.",
    isbn: "9780593422946"
  },
  {
    title: "The Ocean at the End of the Lane",
    author: "Neil Gaiman",
    genre: "Fantasy",
    coverId: "8281512",
    description: "A man returns to his childhood home and remembers the magical, terrifying events of his youth, when a family living down the lane protected him from dark, ancient forces.",
    isbn: "9780062255655"
  },
  {
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    genre: "History",
    coverId: "9283151",
    description: "A fascinating sweep through the history of human evolution, examining how biology, culture, and cognitive revolutions have shaped human societies and our relationship with the planet.",
    isbn: "9780062316097"
  },
  {
    title: "All the Light We Cannot See",
    author: "Anthony Doerr",
    genre: "Historical Fiction",
    coverId: "8185521",
    description: "A stunningly beautiful Pulitzer Prize-winning novel about a blind French girl and a young German soldier whose paths collide in occupied France during the devastating final days of World War II.",
    isbn: "9781476746586"
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    genre: "Fantasy",
    coverId: "8355215",
    description: "Bilbo Baggins, a quiet and home-loving hobbit, is swept into a dangerous quest by the wizard Gandalf and a company of dwarves to reclaim their treasure from the fierce dragon Smaug.",
    isbn: "9780345339683"
  },
  {
    title: "A Deal with the Elf King",
    author: "Elise Kova",
    genre: "Romantasy",
    description: "A cozy, standalone romantic fantasy inspired by Beauty and the Beast and Hades and Persephone. Luella is an herbologist chosen to marry the Elf King to maintain the peace.",
    isbn: "9781949694284"
  },
  {
    title: "Air Awakens",
    author: "Elise Kova",
    genre: "Romantasy",
    description: "A library apprentice with sleeping magical powers is caught between a dangerous war, a mysterious crown prince, and the awakening of her wind magic.",
    isbn: "9781932549935"
  },
  {
    title: "A Court of Thorns and Roses",
    author: "Sarah J. Maas",
    genre: "Romantasy",
    description: "Feyre is dragged to a magical land of faeries by a mysterious beast-like lord, discovering a romance that could save his dying realm.",
    isbn: "9781619635180"
  },
  {
    title: "From Blood and Ash",
    author: "Jennifer L. Armentrout",
    genre: "Romantasy",
    description: "A Maiden chosen from birth to usher in a new era is guarded by a handsome commander, leading her to question her duty and her desires.",
    isbn: "9781952446108"
  },
  {
    title: "The Serpent and the Wings of Night",
    author: "Carissa Broadbent",
    genre: "Romantasy",
    description: "In a world ruled by vampires, an adopted human girl enters a deadly tournament of the gods to win her freedom, allying with a charming rival.",
    isbn: "9781250343024"
  },
  {
    title: "The Bridge Kingdom",
    author: "Danielle L. Jensen",
    genre: "Romantasy",
    description: "A warrior princess trained to infiltrate a legendary bridge kingdom marries its king, planning to destroy it but fighting her growing love for him.",
    isbn: "9781775338901"
  }
];

const EVENT_TYPES = [
  { name: "Author Signing", color: "#d97706", icon: "fa-pen-nib" }, // Amber
  { name: "Book Launch", color: "#ef4444", icon: "fa-rocket" }, // Red
  { name: "Book Club", color: "#3b82f6", icon: "fa-comments" }, // Blue
  { name: "Poetry Reading", color: "#a78bfa", icon: "fa-feather-pointed" }, // Purple
  { name: "Storytime", color: "#10b981", icon: "fa-child" }, // Green
  { name: "Writing Workshop", color: "#14b8a6", icon: "fa-pencil" } // Teal
];

function generateEvents() {
  const events = [];
  let eventId = 1;

  // Let's create about 120-150 events distributed across bookstores and authors over 90 days.
  for (let i = 0; i < 90; i++) {
    // Determine how many events happen on this day (0 to 3 events)
    // Weekends (Friday, Saturday, Sunday) get more events
    const date = new Date(START_DATE.getTime() + i * 24 * 60 * 60 * 1000);
    const dayOfWeek = date.getDay(); // 0 is Sunday, 6 is Saturday
    let eventCount = 1;
    if (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) {
      eventCount = Math.floor(Math.random() * 3) + 1; // 1 to 3
    } else {
      eventCount = Math.random() < 0.4 ? 1 : 0; // 40% chance of 1 event on weekdays
    }

    for (let e = 0; e < eventCount; e++) {
      // Pick a random bookstore
      const bookstore = BOOKSTORES[Math.floor(Math.random() * BOOKSTORES.length)];
      
      // Pick a random book
      const book = CURATED_BOOKS[Math.floor(Math.random() * CURATED_BOOKS.length)];

      // Pick an event type compatible with the book genre
      let eventType = EVENT_TYPES[0]; // Author Signing
      if (book.genre === "Non-Fiction" || book.genre === "History") {
        const roll = Math.random();
        if (roll < 0.4) eventType = EVENT_TYPES[0]; // Author Signing
        else if (roll < 0.7) eventType = EVENT_TYPES[2]; // Book Club
        else eventType = EVENT_TYPES[5]; // Writing Workshop
      } else if (book.title === "The Hobbit" || book.genre === "Fantasy") {
        const roll = Math.random();
        if (roll < 0.5) eventType = EVENT_TYPES[2]; // Book Club
        else if (roll < 0.8) eventType = EVENT_TYPES[0]; // Author Signing
        else eventType = EVENT_TYPES[4]; // Storytime (for fantasy fans/families)
      } else if (Math.random() < 0.2) {
        eventType = EVENT_TYPES[3]; // Poetry Reading
      } else {
        const roll = Math.random();
        if (roll < 0.4) eventType = EVENT_TYPES[0]; // Author Signing
        else if (roll < 0.7) eventType = EVENT_TYPES[1]; // Book Launch
        else eventType = EVENT_TYPES[2]; // Book Club
      }

      // Format time (mostly evening events, say between 5:00 PM and 8:00 PM)
      const startHour = 17 + Math.floor(Math.random() * 4); // 17, 18, 19, 20
      const startMinute = Math.random() < 0.5 ? 0 : 30;
      
      const eventDate = new Date(date);
      eventDate.setHours(startHour, startMinute, 0, 0);

      // Create a descriptions/titles based on event types
      let eventTitle = "";
      let eventDesc = "";
      
      if (eventType.name === "Author Signing") {
        eventTitle = `Author Signing: ${book.author}`;
        eventDesc = `Join us at ${bookbookstoreName(bookstore.name)} for an exclusive book signing event with the bestselling author ${book.author}, celebrating their work, including "${book.title}". Copies of the book will be available for purchase, and the author will sign personal copies. Q&A session to precede signing.`;
      } else if (eventType.name === "Book Launch") {
        eventTitle = `Book Launch: ${book.title}`;
        eventDesc = `Celebrate the official launch of "${book.title}" by ${book.author} at ${bookbookstoreName(bookstore.name)}! Hear the author read select passages, enjoy refreshments, and engage in a lively discussion about the book's themes. Signed copies available.`;
      } else if (eventType.name === "Book Club") {
        eventTitle = `Book Discussion: ${book.title}`;
        eventDesc = `Our monthly community book club will gather to discuss "${book.title}" by ${book.author}. Share your thoughts, analyze the plot, and connect with fellow readers in a cozy, relaxed setting at ${bookbookstoreName(bookstore.name)}. Refreshments served.`;
      } else if (eventType.name === "Poetry Reading") {
        eventTitle = `Literary & Poetry Salon`;
        eventDesc = `An evening of lyrical prose and poetry inspired by the themes of "${book.title}" and contemporary literature. Local poets and guest reader ${book.author} will share their works. Open mic to follow. Hosted by ${bookbookstoreName(bookstore.name)}.`;
      } else if (eventType.name === "Storytime") {
        eventTitle = `Family Storytime: "${book.title}"`;
        eventDesc = `Bring the kids for an engaging afternoon of reading, crafts, and interactive storytelling featuring "${book.title}" by ${book.author}. Perfect for readers of all ages. Hosted at ${bookbookstoreName(bookstore.name)}.`;
      } else {
        eventTitle = `Creative Writing Workshop with ${book.author}`;
        eventDesc = `Unlock your writing potential in this interactive workshop led by acclaimed author ${book.author}. Inspired by the techniques used in "${book.title}", we will explore character development, world-building, and pacing. Limited seats available, reservation recommended.`;
      }

      let eventWebsite = bookstore.website;
      if (book.author === "Elise Kova" && Math.random() < 0.6) {
        eventWebsite = "https://www.elisekova.com/events/";
      } else if (bookstore.name.includes("Fabled") && Math.random() < 0.7) {
        eventWebsite = "https://fabledfantasyevents.com";
      } else if (Math.random() < 0.35) {
        eventWebsite = `https://www.eventbrite.com/d/united-states/books--events/`;
      }

      events.push({
        id: eventId++,
        title: eventTitle,
        bookTitle: book.title,
        author: book.author,
        genre: book.genre,
        isbn: book.isbn,
        coverUrl: book.coverId ? `https://covers.openlibrary.org/b/id/${book.coverId}-L.jpg` : `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`,
        eventType: eventType.name,
        eventColor: eventType.color,
        eventIcon: eventType.icon,
        date: eventDate.toISOString(),
        description: eventDesc,
        venue: bookstore.name,
        address: bookstore.address,
        city: bookstore.city,
        state: bookstore.state,
        zip: bookstore.zip,
        lat: bookstore.lat,
        lon: bookstore.lon,
        website: eventWebsite
      });
    }
  }

  // Sort by date
  events.sort((a, b) => new Date(a.date) - new Date(b.date));
  return events;
}

function bookbookstoreName(name) {
  return name.endsWith("Bookstore") || name.endsWith("Booksellers") || name.endsWith("Company") || name.endsWith("Store") || name.endsWith("Books") || name.includes("Noble") || name.includes("Million") || name.includes("Con") || name.includes("Events") ? name : `${name} Bookstore`;
}

async function run() {
  console.log("Generating static book event database...");
  const events = generateEvents();
  
  const docsDataDir = path.join(__dirname, '..', 'docs', 'data');
  if (!fs.existsSync(docsDataDir)) {
    fs.mkdirSync(docsDataDir, { recursive: true });
  }

  const outputPath = path.join(docsDataDir, 'events.json');
  fs.writeFileSync(outputPath, JSON.stringify(events, null, 2), 'utf-8');
  console.log(`Successfully generated ${events.length} book events!`);
  console.log(`Database saved to: ${outputPath}`);
}

run();
