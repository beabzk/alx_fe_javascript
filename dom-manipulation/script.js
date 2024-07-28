// API URL
const API_URL = 'https://jsonplaceholder.typicode.com/posts';

// Array to store quotes
let quotes = [];

// Function to load quotes from local storage
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    // Default quotes if none are stored
    quotes = [
      { id: 1, title: "Life isn't about getting and having", body: "It's about giving and being.", userId: 1 },
      { id: 2, title: "Whatever the mind of man can conceive and believe", body: "It can achieve.", userId: 2 },
      { id: 3, title: "Strive not to be a success", body: "But rather to be of value.", userId: 3 }
    ];
    saveQuotes();
  }
  populateCategories();
}

// Function to save quotes to local storage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Function to display a random quote
function showRandomQuote() {
  const filteredQuotes = filterQuotesByCategory();
  if (filteredQuotes.length === 0) {
    document.getElementById('quoteDisplay').innerHTML = "<p>No quotes in this category.</p>";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];
  document.getElementById('quoteDisplay').innerHTML = `<p>"${randomQuote.body}" - <em>User ${randomQuote.userId}</em></p>`;
  
  // Store last viewed quote in session storage
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));
}

// Function to create and add the form for new quotes
function createAddQuoteForm() {
  const formContainer = document.createElement('div');
  formContainer.innerHTML = `
    <input id="newQuoteTitle" type="text" placeholder="Enter a new quote title" />
    <input id="newQuoteBody" type="text" placeholder="Enter quote body" />
    <button onclick="addQuote()">Add Quote</button>
  `;
  document.body.appendChild(formContainer);
}

// Function to add a new quote
function addQuote() {
  const newQuoteTitle = document.getElementById('newQuoteTitle').value;
  const newQuoteBody = document.getElementById('newQuoteBody').value;
  
  if (newQuoteTitle && newQuoteBody) {
    const newQuote = { 
      id: quotes.length + 1, 
      title: newQuoteTitle, 
      body: newQuoteBody,
      userId: Math.floor(Math.random() * 10) + 1 // Random userId between 1 and 10
    };
    
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    alert('New quote added successfully!');
    document.getElementById('newQuoteTitle').value = '';
    document.getElementById('newQuoteBody').value = '';
  } else {
    alert('Please enter both quote title and body.');
  }
}

// Function to populate categories in the filter dropdown
function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  const categories = ['all', ...new Set(quotes.map(quote => `User ${quote.userId}`))];
  
  categoryFilter.innerHTML = ''; // Clear existing options
  
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category === 'all' ? 'All Users' : category;
    categoryFilter.appendChild(option);
  });
  
  // Restore last selected category
  const lastCategory = localStorage.getItem('lastCategory') || 'all';
  categoryFilter.value = lastCategory;
}

// Function to filter quotes based on selected category
function filterQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  localStorage.setItem('lastCategory', selectedCategory);
  showRandomQuote();
}

// Function to filter quotes by category
function filterQuotesByCategory() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  return selectedCategory === 'all' ? quotes : quotes.filter(quote => `User ${quote.userId}` === selectedCategory);
}

// Function to fetch quotes from the server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(`${API_URL}?_limit=100`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching quotes from server:', error);
    notifyUser('Failed to fetch quotes from server', 'error');
    return [];
  }
}

// Function to post a new quote to the server
async function postQuoteToServer(quote) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quote),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error posting quote to server:', error);
    notifyUser('Failed to post quote to server', 'error');
    return null;
  }
}

// Function to sync data with server
async function syncQuotes() {
  try {
    const serverQuotes = await fetchQuotesFromServer();
    
    // Simple conflict resolution: merge local and server quotes
    const mergedQuotes = mergeQuotes(quotes, serverQuotes);
    
    quotes = mergedQuotes;
    saveQuotes();
    populateCategories();
    
    // Notify user of sync
    notifyUser('Quotes synced with server');
  } catch (error) {
    console.error('Error syncing with server:', error);
    notifyUser('Failed to sync with server', 'error');
  }
}

// Function to merge local and server quotes
function mergeQuotes(localQuotes, serverQuotes) {
  const mergedQuotes = [...localQuotes];
  
  serverQuotes.forEach(serverQuote => {
    const existingIndex = mergedQuotes.findIndex(q => q.id === serverQuote.id);
    if (existingIndex !== -1) {
      // Conflict resolution: keep the quote with the longer body
      if (serverQuote.body.length > mergedQuotes[existingIndex].body.length) {
        mergedQuotes[existingIndex] = serverQuote;
      }
    } else {
      // Add new quote from server
      mergedQuotes.push(serverQuote);
    }
  });
  
  return mergedQuotes;
}

// Function to notify user of updates or conflicts
function notifyUser(message, type = 'info') {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.className = `notification ${type}`;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    document.body.removeChild(notification);
  }, 3000);
}

// Event listeners
document.getElementById('newQuote').addEventListener('click', showRandomQuote);
document.getElementById('syncQuotes').addEventListener('click', syncQuotes);

// Initialize the application
loadQuotes();
showRandomQuote();
createAddQuoteForm();

// Periodic sync (every 5 minutes)
setInterval(syncQuotes, 5 * 60 * 1000);

// Optional: Display last viewed quote from session storage on page load
const lastViewedQuote = sessionStorage.getItem('lastViewedQuote');
if (lastViewedQuote) {
  const quoteDisplay = document.getElementById('quoteDisplay');
  const quote = JSON.parse(lastViewedQuote);
  quoteDisplay.innerHTML = `<p>Last viewed quote: "${quote.body}" - <em>User ${quote.userId}</em></p>`;
}