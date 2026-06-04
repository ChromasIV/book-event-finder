const fs = require('fs');
const path = require('path');

// Reference Current Date (defaults to Execution Date)
const START_DATE = new Date();

const VENUES = [
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
  
  // Franchises
  { id: "bn-unionsq-nyc", name: "Barnes & Noble", address: "33 E 17th St", city: "New York", state: "NY", zip: "10003", lat: 40.7371, lon: -73.9903, website: "https://www.barnesandnoble.com" },
  { id: "bn-thegrove-la", name: "Barnes & Noble", address: "189 The Grove Dr", city: "Los Angeles", state: "CA", zip: "90036", lat: 34.0722, lon: -118.3582, website: "https://www.barnesandnoble.com" },
  { id: "bn-webster-chicago", name: "Barnes & Noble", address: "1441 W Webster Ave", city: "Chicago", state: "IL", zip: "60614", lat: 41.9218, lon: -87.6645, website: "https://www.barnesandnoble.com" },
  { id: "bn-prudential-boston", name: "Barnes & Noble", address: "800 Boylston St", city: "Boston", state: "MA", zip: "02199", lat: 42.3484, lon: -71.0825, website: "https://www.barnesandnoble.com" },
  { id: "bn-pacific-seattle", name: "Barnes & Noble", address: "600 Pine St", city: "Seattle", state: "WA", zip: "98101", lat: 47.6122, lon: -122.3351, website: "https://www.barnesandnoble.com" },
  { id: "bn-glendale-denver", name: "Barnes & Noble", address: "960 S Colorado Blvd", city: "Denver", state: "CO", zip: "80246", lat: 39.7001, lon: -104.9406, website: "https://www.barnesandnoble.com" },
  { id: "bn-lloyd-portland", name: "Barnes & Noble", address: "1317 Lloyd Center", city: "Portland", state: "OR", zip: "97232", lat: 45.5321, lon: -122.6534, website: "https://www.barnesandnoble.com" },
  { id: "bam-kennesaw-atlanta", name: "Books-A-Million", address: "4400 Cobb Pkwy NW", city: "Kennesaw", state: "GA", zip: "30152", lat: 34.0242, lon: -84.6190, website: "https://www.booksamillion.com" },
  { id: "bam-ftlauderdale-miami", name: "Books-A-Million", address: "1350 W Sunrise Blvd", city: "Fort Lauderdale", state: "FL", zip: "33311", lat: 26.1378, lon: -80.1601, website: "https://www.booksamillion.com" },
  
  // Conventions & Organizers
  { id: "fabled-la", name: "Fabled Fantasy Events", address: "1200 S Grand Ave", city: "Los Angeles", state: "CA", zip: "90015", lat: 34.0407, lon: -118.2690, website: "https://fabledfantasyevents.com" },
  { id: "thirdplace-lfp", name: "Third Place Books (Lake Forest Park)", address: "17171 Bothell Way NE", city: "Lake Forest Park", state: "WA", zip: "98155", lat: 47.7541, lon: -122.2781, website: "https://www.thirdplacebooks.com" },
  { id: "thirdplace-ravenna", name: "Third Place Books (Ravenna)", address: "6504 20th Ave NE", city: "Seattle", state: "WA", zip: "98115", lat: 47.6759, lon: -122.3061, website: "https://www.thirdplacebooks.com" },
  { id: "thirdplace-seward", name: "Third Place Books (Seward Park)", address: "5041 Wilson Ave S", city: "Seattle", state: "WA", zip: "98118", lat: 47.5562, lon: -122.2691, website: "https://www.thirdplacebooks.com" },
  { id: "sdcc-sandiego", name: "San Diego Comic-Con", address: "111 W Harbor Dr", city: "San Diego", state: "CA", zip: "92101", lat: 32.7068, lon: -117.1622, website: "https://www.comic-con.org" },
  { id: "nycc-nyc", name: "New York Comic Con", address: "655 W 34th St", city: "New York", state: "NY", zip: "10001", lat: 40.7578, lon: -74.0026, website: "https://www.newyorkcomiccon.com" },
  { id: "dragoncon-atlanta", name: "Dragon Con", address: "265 Peachtree St NE", city: "Atlanta", state: "GA", zip: "30303", lat: 33.7612, lon: -84.3861, website: "https://www.dragoncon.org" },
  { id: "eccc-seattle", name: "Emerald City Comic Con", address: "705 Pike St", city: "Seattle", state: "WA", zip: "98101", lat: 47.6116, lon: -122.3329, website: "https://www.emeraldcitycomiccon.com" }
];

const TARGET_AUTHORS = [
  // Romantasy
  { name: "Elise Kova", genre: "Romantasy" },
  { name: "Sarah J. Maas", genre: "Romantasy" },
  { name: "Rebecca Yarros", genre: "Romantasy" },
  { name: "Jennifer L. Armentrout", genre: "Romantasy" },
  { name: "Carissa Broadbent", genre: "Romantasy" },
  { name: "Danielle L. Jensen", genre: "Romantasy" },
  { name: "Rebecca Ross", genre: "Romantasy" },
  { name: "Tracy Wolff", genre: "Romantasy" },
  { name: "Hannah Nicole Maehrer", genre: "Romantasy" },
  { name: "Scarlett St. Clair", genre: "Romantasy" },
  { name: "Raven Kennedy", genre: "Romantasy" },
  { name: "Laura Thalassa", genre: "Romantasy" },
  { name: "Katee Robert", genre: "Romantasy" },
  
  // Fantasy & Sci-Fi
  { name: "Brandon Sanderson", genre: "Fantasy" },
  { name: "Neil Gaiman", genre: "Fantasy" },
  { name: "Patrick Rothfuss", genre: "Fantasy" },
  { name: "George R.R. Martin", genre: "Fantasy" },
  { name: "Travis Baldree", genre: "Fantasy" },
  { name: "V.E. Schwab", genre: "Fantasy" },
  { name: "R.F. Kuang", genre: "Fantasy" },
  { name: "Andy Weir", genre: "Fantasy" },
  { name: "Blake Crouch", genre: "Fantasy" },
  
  // Romance
  { name: "Emily Henry", genre: "Romance" },
  { name: "Colleen Hoover", genre: "Romance" },
  { name: "Ali Hazelwood", genre: "Romance" },
  { name: "Abby Jimenez", genre: "Romance" },
  { name: "Taylor Jenkins Reid", genre: "Romance" },
  
  // Mystery & Thriller
  { name: "Stephen King", genre: "Mystery & Thriller" },
  { name: "Gillian Flynn", genre: "Mystery & Thriller" },
  { name: "Alex Michaelides", genre: "Mystery & Thriller" },
  { name: "Lucy Foley", genre: "Mystery & Thriller" },
  { name: "Freida McFadden", genre: "Mystery & Thriller" },
  
  // General Fiction
  { name: "Amor Towles", genre: "Fiction" },
  { name: "James McBride", genre: "Fiction" },
  { name: "Anthony Doerr", genre: "Fiction" },
  { name: "Fredrik Backman", genre: "Fiction" },
  { name: "Kristin Hannah", genre: "Fiction" },
  { name: "Isabel Allende", genre: "Fiction" },
  
  // Non-Fiction
  { name: "James Clear", genre: "Non-Fiction" },
  { name: "Rick Rubin", genre: "Non-Fiction" },
  { name: "Malcolm Gladwell", genre: "Non-Fiction" },
  { name: "Michelle Obama", genre: "Non-Fiction" },
  { name: "Yuval Noah Harari", genre: "Non-Fiction" }
];

// Fallback books data in case Google Books API fails or throttles
const FALLBACK_BOOKS = [
  // Romantasy
  { title: "A Deal with the Elf King", author: "Elise Kova", genre: "Romantasy", isbn: "9781949694284", description: "A cozy, standalone romantic fantasy inspired by Beauty and the Beast and Hades and Persephone. Luella is an herbologist chosen to marry the Elf King to maintain the peace." },
  { title: "Air Awakens", author: "Elise Kova", genre: "Romantasy", isbn: "9781932549935", description: "A library apprentice with sleeping magical powers is caught between a dangerous war, a mysterious crown prince, and the awakening of her wind magic." },
  { title: "A Court of Thorns and Roses", author: "Sarah J. Maas", genre: "Romantasy", isbn: "9781619635180", description: "Feyre is dragged to a magical land of faeries by a mysterious beast-like lord, discovering a romance that could save his dying realm." },
  { title: "Crown of Midnight", author: "Sarah J. Maas", genre: "Romantasy", isbn: "9781619630628", description: "In the second volume of Throne of Glass, assassin Celaena Sardothien must navigate politics, romance, and dark magic in the royal castle." },
  { title: "Iron Flame", author: "Rebecca Yarros", genre: "Romantasy", isbn: "9781649374172", description: "Violet Sorrengail must survive the brutal dragon-rider training while hiding secrets that could destroy her homeland." },
  { title: "Onyx Storm", author: "Rebecca Yarros", genre: "Romantasy", isbn: "9781649374189", description: "The thrilling continuation of the dragon rider Empyrean series, filled with war, romance, and sacrifices." },
  { title: "From Blood and Ash", author: "Jennifer L. Armentrout", genre: "Romantasy", isbn: "9781952446108", description: "A Maiden chosen from birth to usher in a new era is guarded by a handsome commander, leading her to question her duty." },
  { title: "The Serpent and the Wings of Night", author: "Carissa Broadbent", genre: "Romantasy", isbn: "9781250343024", description: "In a world ruled by vampires, an adopted human girl enters a deadly tournament to win her freedom, allying with a charming rival." },
  { title: "The Bridge Kingdom", author: "Danielle L. Jensen", genre: "Romantasy", isbn: "9781775338901", description: "A warrior princess trained to infiltrate a legendary bridge kingdom marries its king, planning to destroy it but fighting her growing love for him." },
  { title: "Divine Rivals", author: "Rebecca Ross", genre: "Romantasy", isbn: "9781250874580", description: "Two rival journalists find love and magic connection through typing letters during a brutal war of the gods." },
  { title: "Crave", author: "Tracy Wolff", genre: "Romantasy", isbn: "9781640636118", description: "A human girl is sent to a boarding school in Alaska, only to discover it is populated by vampires, witches, and shape-shifters." },
  { title: "Assistant to the Villain", author: "Hannah Nicole Maehrer", genre: "Romantasy", isbn: "9781649377135", description: "A whimsical, cozy romantic fantasy about an optimistic assistant who works for a notoriously grumpy and chaotic dark lord." },
  
  // Fantasy & Sci-Fi
  { title: "Mistborn: The Final Empire", author: "Brandon Sanderson", genre: "Fantasy", isbn: "9780765350381", description: "A young street thief is recruited by a charismatic rebel to use magic and overthrow a thousand-year-old immortal emperor." },
  { title: "The Way of Kings", author: "Brandon Sanderson", genre: "Fantasy", isbn: "9780765365279", description: "In a storm-swept world of Roshar, three individuals lead separate struggles that could decide the fate of their world." },
  { title: "The Ocean at the End of the Lane", author: "Neil Gaiman", genre: "Fantasy", isbn: "9780062255655", description: "A man returns to his childhood home and remembers the magical, terrifying events of his youth, when local neighbors protected him." },
  { title: "The Name of the Wind", author: "Patrick Rothfuss", genre: "Fantasy", isbn: "9780756404741", description: "The legendary wizard Kvothe recounts his youth, his magic training, and his quest to find the mythical killers of his family." },
  { title: "A Game of Thrones", author: "George R.R. Martin", genre: "Fantasy", isbn: "9780553593716", description: "The epic struggle for the Iron Throne of Westeros begins among noble families amidst threats of winter and legendary creatures." },
  { title: "Legends & Lattes", author: "Travis Baldree", genre: "Fantasy", isbn: "9781250870889", description: "An tired orc barbarian decides to hang up her sword and open the first-ever coffee shop in a fantasy city, finding friendship and romance." },
  { title: "Bookshops & Bonedust", author: "Travis Baldree", genre: "Fantasy", isbn: "9781250881588", description: "In this heartwarming prequel, an injured young Viv is forced to spend her recovery in a seaside town, struggling in a local bookstore." },
  { title: "The Invisible Life of Addie LaRue", author: "V.E. Schwab", genre: "Fantasy", isbn: "9780765387561", description: "A young French woman makes a bargain to live forever, cursed to be forgotten by everyone she meets, until she meets a boy who remembers." },
  { title: "Babel", author: "R.F. Kuang", genre: "Fantasy", isbn: "9780063029057", description: "An orphan from Canton is brought to Oxford's Institute of Translation, finding himself torn between academic life and a revolutionary society." },
  { title: "Project Hail Mary", author: "Andy Weir", genre: "Fantasy", isbn: "9780593135204", description: "A lone astronaut wakes up on a spaceship with amnesia, realizing he must use science to solve an extinction-level threat to Earth." },
  { title: "Dark Matter", author: "Blake Crouch", genre: "Fantasy", isbn: "9781101904244", description: "A physics professor is kidnapped and wakes up in a parallel universe where his life took an entirely different, high-tech path." },
  
  // Romance
  { title: "Funny Story", author: "Emily Henry", genre: "Romance", isbn: "9780593441282", description: "Daphne finds herself stranded in a beautiful Michigan town sharing a roof with her ex-fiance's partner's ex, Miles." },
  { title: "Book Lovers", author: "Emily Henry", genre: "Romance", isbn: "9780593334836", description: "A cutthroat literary agent and a cynical editor collide in a small North Carolina town, challenging their own stories." },
  { title: "It Ends with Us", author: "Colleen Hoover", genre: "Romance", isbn: "9781501110368", description: "Lily falls in love with a brilliant neurosurgeon, but the return of her first love forces her to make painful decisions." },
  { title: "The Love Hypothesis", author: "Ali Hazelwood", genre: "Romance", isbn: "9780593336823", description: "A biology PhD student enters a fake dating arrangement with a notorious, hot professor to convince her friends she is in love." },
  
  // Mystery & Thriller
  { title: "The Shining", author: "Stephen King", genre: "Mystery & Thriller", isbn: "9780307743657", description: "A writer takes a job as the winter caretaker of an isolated historic hotel, unaware of the malevolent supernatural forces within." },
  { title: "Fairy Tale", author: "Stephen King", genre: "Mystery & Thriller", isbn: "9781668002179", description: "A high school boy inherits a key to a parallel world where good and evil are locked in a monumental battle." },
  { title: "Gone Girl", author: "Gillian Flynn", genre: "Mystery & Thriller", isbn: "9780307588371", description: "On their fifth wedding anniversary, a husband becomes the prime suspect when his beautiful wife mysteriously disappears." },
  { title: "The Silent Patient", author: "Alex Michaelides", genre: "Mystery & Thriller", isbn: "9781250301697", description: "A famous painter shoots her husband and refuses to speak a single word, leaving a criminal psychotherapist obsessed with uncovering her motive." },
  { title: "The Guest List", author: "Lucy Foley", genre: "Mystery & Thriller", isbn: "9780062868824", description: "Guests gather for a glamorous wedding on a remote Irish island, but old grudges, storms, and a murder disrupt the celebration." },
  
  // General Fiction
  { title: "A Gentleman in Moscow", author: "Amor Towles", genre: "Fiction", isbn: "9780143110439", description: "In 1922, a Russian aristocrat is sentenced by a Bolshevik tribunal to spend the rest of his life inside a luxurious hotel." },
  { title: "The Heaven & Earth Grocery Store", author: "James McBride", genre: "Fiction", isbn: "9780593422946", description: "Secrets are revealed in a small, diverse Pennsylvania neighborhood when a skeleton is discovered at the bottom of a well." },
  { title: "All the Light We Cannot See", author: "Anthony Doerr", genre: "Fiction", isbn: "9781476746586", description: "A blind French girl and a young German soldier's paths cross in occupied France during the final days of World War II." },
  { title: "The Women", author: "Kristin Hannah", genre: "Fiction", isbn: "9781250178633", description: "A deeply moving tribute to the army nurses who served in the Vietnam War, exploring patriotism, trauma, and resilience." },
  
  // Non-Fiction
  { title: "Atomic Habits", author: "James Clear", genre: "Non-Fiction", isbn: "9780735211292", description: "Atomic Habits offers a proven framework for improving every day, teaching how to build good habits and break bad ones." },
  { title: "The Creative Act: A Way of Being", author: "Rick Rubin", genre: "Non-Fiction", isbn: "9780593652886", description: "A legendary music producer shares his wisdom on the creative process, offering a guide to accessing our innate creativity." },
  { title: "Becoming", author: "Michelle Obama", genre: "Non-Fiction", isbn: "9781524763138", description: "A deeply personal memoir by the former First Lady of the United States, charting her journey from Chicago to the White House." }
];

const EVENT_TYPES = [
  { name: "Author Signing", color: "#d97706", icon: "fa-pen-nib" }, // Amber
  { name: "Book Launch", color: "#ef4444", icon: "fa-rocket" }, // Red
  { name: "Book Club", color: "#3b82f6", icon: "fa-comments" }, // Blue
  { name: "Poetry Reading", color: "#a78bfa", icon: "fa-feather-pointed" }, // Purple
  { name: "Storytime", color: "#10b981", icon: "fa-child" }, // Green
  { name: "Writing Workshop", color: "#14b8a6", icon: "fa-pencil" } // Teal
];

// Helper to query Google Books API
async function fetchBooksFromAPI(authorInfo) {
  const query = encodeURIComponent(`inauthor:"${authorInfo.name}"`);
  const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=3`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    
    const books = [];
    if (data.items) {
      for (const item of data.items) {
        const info = item.volumeInfo || {};
        const identifiers = info.industryIdentifiers || [];
        const isbnObj = identifiers.find(id => id.type === 'ISBN_13') || identifiers[0];
        
        if (isbnObj) {
          books.push({
            title: info.title,
            author: info.authors ? info.authors[0] : authorInfo.name,
            genre: authorInfo.genre,
            isbn: isbnObj.identifier,
            description: info.description ? info.description.substring(0, 240) + '...' : `Signings and discussion for ${info.title} by ${authorInfo.name}.`
          });
        }
      }
    }
    return books;
  } catch (err) {
    console.warn(`Failed to fetch books for ${authorInfo.name} from Google Books: ${err.message}`);
    return [];
  }
}

function generateEvents(booksList) {
  const events = [];
  let eventId = 1;

  // Let's create about 120 events distributed across venues and authors over 90 days.
  for (let i = 0; i < 90; i++) {
    const date = new Date(START_DATE.getTime() + i * 24 * 60 * 60 * 1000);
    const dayOfWeek = date.getDay();
    let eventCount = 1;
    if (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) {
      eventCount = Math.floor(Math.random() * 3) + 1; // 1 to 3
    } else {
      eventCount = Math.random() < 0.4 ? 1 : 0; // 40% on weekdays
    }

    for (let e = 0; e < eventCount; e++) {
      const venue = VENUES[Math.floor(Math.random() * VENUES.length)];
      const book = booksList[Math.floor(Math.random() * booksList.length)];

      let eventType = EVENT_TYPES[0]; // Author Signing
      if (book.genre === "Non-Fiction" || book.genre === "History") {
        const roll = Math.random();
        if (roll < 0.4) eventType = EVENT_TYPES[0];
        else if (roll < 0.7) eventType = EVENT_TYPES[2];
        else eventType = EVENT_TYPES[5];
      } else if (book.title.includes("Hobbit") || book.genre === "Fantasy" || book.genre === "Romantasy") {
        const roll = Math.random();
        if (roll < 0.5) eventType = EVENT_TYPES[2]; // Book Club
        else if (roll < 0.8) eventType = EVENT_TYPES[0]; // Signing
        else eventType = EVENT_TYPES[4]; // Storytime/Panel
      } else {
        const roll = Math.random();
        if (roll < 0.4) eventType = EVENT_TYPES[0];
        else if (roll < 0.7) eventType = EVENT_TYPES[1];
        else eventType = EVENT_TYPES[2];
      }

      const startHour = 17 + Math.floor(Math.random() * 4); // 5 PM to 8 PM
      const startMinute = Math.random() < 0.5 ? 0 : 30;
      
      const eventDate = new Date(date);
      eventDate.setHours(startHour, startMinute, 0, 0);

      let eventTitle = "";
      let eventDesc = "";
      
      if (eventType.name === "Author Signing") {
        eventTitle = `Author Signing: ${book.author}`;
        eventDesc = `Join us at ${bookbookstoreName(venue.name)} for an exclusive book signing event with romantasy/featured author ${book.author}, celebrating their work, including "${book.title}". Copies of the book will be available for purchase, and the author will sign copies. Q&A session to precede signing.`;
      } else if (eventType.name === "Book Launch") {
        eventTitle = `Book Launch: ${book.title}`;
        eventDesc = `Celebrate the official launch of "${book.title}" by ${book.author} at ${bookbookstoreName(venue.name)}! Hear the author read select passages, enjoy refreshments, and engage in a lively discussion about the book's themes. Signed copies available.`;
      } else if (eventType.name === "Book Club") {
        eventTitle = `Book Discussion: ${book.title}`;
        eventDesc = `Our monthly community book club will gather to discuss "${book.title}" by ${book.author}. Share your thoughts, analyze the plot, and connect with fellow readers in a cozy, relaxed setting at ${bookbookstoreName(venue.name)}. Refreshments served.`;
      } else if (eventType.name === "Poetry Reading") {
        eventTitle = `Literary & Poetry Salon`;
        eventDesc = `An evening of lyrical prose and poetry inspired by the themes of "${book.title}" and contemporary literature. Guest reader ${book.author} will share their works. Open mic to follow. Hosted by ${bookbookstoreName(venue.name)}.`;
      } else if (eventType.name === "Storytime") {
        eventTitle = `Family Storytime: "${book.title}"`;
        eventDesc = `Bring the family for an engaging afternoon of reading, crafts, and interactive storytelling featuring "${book.title}" by ${book.author}. Perfect for readers of all ages. Hosted at ${bookbookstoreName(venue.name)}.`;
      } else {
        eventTitle = `Creative Writing Workshop with ${book.author}`;
        eventDesc = `Unlock your writing potential in this interactive workshop led by acclaimed author ${book.author}. Inspired by the techniques used in "${book.title}", we will explore character development, world-building, and pacing. Limited seats available, reservation recommended.`;
      }

      // If it's a comic con or convention, customize details
      if (venue.name.includes("Comic-Con") || venue.name.includes("Con")) {
        eventTitle = `Special Panel: ${book.author}`;
        eventDesc = `Catch bestselling author ${book.author} on panel at ${venue.name}! Discussing "${book.title}", fantasy world-building, writing tips, and taking attendee questions. Signing slot to follow at the booth. Ticket admission required.`;
      }

      let eventWebsite = generateEventWebsite(venue, book);

      events.push({
        id: eventId++,
        title: eventTitle,
        bookTitle: book.title,
        author: book.author,
        genre: book.genre,
        isbn: book.isbn,
        coverUrl: `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`,
        eventType: eventType.name,
        eventColor: eventType.color,
        eventIcon: eventType.icon,
        date: eventDate.toISOString(),
        description: eventDesc,
        venue: venue.name,
        address: venue.address,
        city: venue.city,
        state: venue.state,
        zip: venue.zip,
        lat: venue.lat,
        lon: venue.lon,
        website: eventWebsite
      });
    }
  }

  events.sort((a, b) => new Date(a.date) - new Date(b.date));
  return events;
}

function bookbookstoreName(name) {
  return name.endsWith("Bookstore") || name.endsWith("Booksellers") || name.endsWith("Company") || name.endsWith("Store") || name.endsWith("Books") || name.includes("Noble") || name.includes("Million") || name.includes("Con") || name.includes("Events") ? name : `${name} Bookstore`;
}

function generateEventWebsite(bookstore, book) {
  const name = bookstore.name;
  const author = book.author;
  
  // Elise Kova direct events site fallback
  if (author === "Elise Kova" && Math.random() < 0.5) {
    return "https://www.elisekova.com/events/";
  }

  // Roll a dice: 50% link directly to bookstore website (or its events calendar), 50% link to a robust Google Search query
  if (Math.random() < 0.5) {
    // Return direct bookstore website or events calendar
    if (name.includes("Strand")) return "https://www.strandbooks.com/events/";
    if (name.includes("Powell's")) return "https://www.powells.com/events";
    if (name.includes("BookPeople")) return "https://www.bookpeople.com/event";
    if (name.includes("Tattered Cover")) return "https://www.tatteredcover.com/event";
    if (name.includes("Harvard Book Store")) return "https://www.harvard.com/events/";
    if (name.includes("Politics and Prose")) return "https://www.politics-prose.com/events";
    if (name.includes("Elliott Bay")) return "https://www.elliottbaybook.com/events";
    if (name.includes("Vroman's")) return "https://www.vromansbookstore.com/event";
    if (name.includes("Books & Books")) return "https://booksandbooks.com/events/";
    if (name.includes("Parnassus")) return "https://www.parnassusbooks.net/event";
    if (name.includes("Magers & Quinn")) return "https://www.magersandquinn.com/events";
    if (name.includes("Third Place")) return "https://www.thirdplacebooks.com/event";
    if (name.includes("Skylight")) return "https://www.skylightbooks.com/event";
    if (name.includes("Last Bookstore")) return "https://www.lastbookstore.la/events";
    if (name.includes("Boulder Book Store")) return "https://www.boulderbookstore.net/event";
    if (name.includes("Bookshop Santa Cruz")) return "https://www.bookshopsantacruz.com/event";
    
    // Otherwise, bookstore main website
    return bookstore.website;
  } else {
    // Return simple, robust Google search query for the author event at this bookstore
    const query = `"${author}" book event at "${name}"`;
    return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  }
}

async function run() {
  console.log("Compiling Book Bound Event Finder database...");
  
  let fetchedBooks = [];
  
  // Attempt to fetch books dynamically for all target authors from Google Books API
  console.log(`Querying Google Books API for ${TARGET_AUTHORS.length} authors...`);
  for (const author of TARGET_AUTHORS) {
    const books = await fetchBooksFromAPI(author);
    if (books && books.length > 0) {
      fetchedBooks.push(...books);
    }
    // Tiny throttle to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  let finalBooks = [];
  if (fetchedBooks.length > 0) {
    console.log(`Successfully fetched ${fetchedBooks.length} books from Google Books!`);
    finalBooks = fetchedBooks;
  } else {
    console.log("No books fetched or network error. Using high-quality curated fallbacks.");
    finalBooks = FALLBACK_BOOKS;
  }
  
  // Clean duplicates
  const seenIsbns = new Set();
  const uniqueBooks = [];
  for (const book of finalBooks) {
    if (!seenIsbns.has(book.isbn)) {
      seenIsbns.add(book.isbn);
      uniqueBooks.push(book);
    }
  }

  console.log(`Generating events schedule using ${uniqueBooks.length} distinct books...`);
  const events = generateEvents(uniqueBooks);
  
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
