// API URL
const API_URL = 'https://dummyjson.com/quotes';

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
      { id: 1, quote: "Life isn't about getting and having, it's about giving and being.", author: "Kevin Kruse" },
      { id: 2, quote: "Whatever the mind of man can conceive and believe, it can achieve.", author: "Napoleon Hill" },
      { id: 3, quote: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" }
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
  document.getElementById('quoteDisplay').innerHTML = `<p>"${randomQuote.quote}" - <em>${randomQuote.author}</em></p>`;
  
  // Store last viewed quote in session storage
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));
}

// Function to create and add the form for new quotes
function createAddQuoteForm() {
  const formContainer = document.createElement('div');
  formContainer.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteAuthor" type="text" placeholder="Enter quote author" />
    <button onclick="addQuote()">Add Quote</button>
  `;
  document.body.appendChild(formContainer);
}

// Function to add a new quote
function addQuote() {
  const newQuoteText = document.getElementById('newQuoteText').value;
  const newQuoteAuthor = document.getElementById('newQuoteAuthor').value;
  
  if (newQuoteText && newQuoteAuthor) {
    const newQuote = { 
      id: quotes.length + 1, 
      quote: newQuoteText, 
      author: newQuoteAuthor 
    };
    
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    alert('New quote added successfully!');
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteAuthor').value = '';
  } else {
    alert('Please enter both quote text and author.');
  }
}

// Function to populate categories in the filter dropdown
function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  const categories = ['all', ...new Set(quotes.map(quote => quote.author))];
  
  categoryFilter.innerHTML = ''; // Clear existing options
  
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category === 'all' ? 'All Authors' : category;
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
  return selectedCategory === 'all' ? quotes : quotes.filter(quote => quote.author === selectedCategory);
}

// Function to sync data with server
async function syncWithServer() {
  try {
    const response = await fetch(`${API_URL}?limit=100`);
    const data = await response.json();
    const serverQuotes = data.quotes;  // Access the quotes array from the response
    
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
      // Conflict resolution: keep the quote with the longer text
      if (serverQuote.quote.length > mergedQuotes[existingIndex].quote.length) {
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
document.getElementById('syncQuotes').addEventListener('click', syncWithServer);

// Initialize the application
loadQuotes();
showRandomQuote();
createAddQuoteForm();

// Periodic sync (every 5 minutes)
setInterval(syncWithServer, 5 * 60 * 1000);

// Optional: Display last viewed quote from session storage on page load
const lastViewedQuote = sessionStorage.getItem('lastViewedQuote');
if (lastViewedQuote) {
  const quoteDisplay = document.getElementById('quoteDisplay');
  const quote = JSON.parse(lastViewedQuote);
  quoteDisplay.innerHTML = `<p>Last viewed quote: "${quote.quote}" - <em>${quote.author}</em></p>`;
}