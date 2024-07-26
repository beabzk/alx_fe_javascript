let quotes = [];

// Function to load quotes from local storage
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    // Default quotes if none are stored
    quotes = [
      { text: "Be the change you wish to see in the world.", category: "Inspirational" },
      { text: "The only way to do great work is to love what you do.", category: "Motivational" },
      { text: "In three words I can sum up everything I've learned about life: it goes on.", category: "Life" }
    ];
    saveQuotes();
  }
}

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function showRandomQuote() {
  const quoteDisplay = document.getElementById('quoteDisplay');
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];
  quoteDisplay.innerHTML = `<p>"${randomQuote.text}" - <em>${randomQuote.category}</em></p>`;
  
  // Store last viewed quote in session storage
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));
}

// Function to create and add the form for new quotes
function createAddQuoteForm() {
  const formContainer = document.createElement('div');
  formContainer.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button onclick="addQuote()">Add Quote</button>
  `;
  document.body.appendChild(formContainer);
}

function addQuote() {
  const newQuoteText = document.getElementById('newQuoteText').value;
  const newQuoteCategory = document.getElementById('newQuoteCategory').value;
  
  if (newQuoteText && newQuoteCategory) {
    quotes.push({ text: newQuoteText, category: newQuoteCategory });
    saveQuotes();
    alert('New quote added successfully!');
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
  } else {
    alert('Please enter both quote text and category.');
  }
}

// Function to export quotes to JSON file
function exportQuotes() {
  const quotesJson = JSON.stringify(quotes, null, 2);
  const blob = new Blob([quotesJson], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Function to import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    alert('Quotes imported successfully!');
  };
  fileReader.readAsText(event.target.files[0]);
}

document.getElementById('newQuote').addEventListener('click', showRandomQuote);
document.getElementById('exportQuotes').addEventListener('click', exportQuotes);

// Initialize the application
loadQuotes();
showRandomQuote();
createAddQuoteForm();

// Display last viewed quote from session storage on page load
const lastViewedQuote = sessionStorage.getItem('lastViewedQuote');
if (lastViewedQuote) {
  const quoteDisplay = document.getElementById('quoteDisplay');
  const quote = JSON.parse(lastViewedQuote);
  quoteDisplay.innerHTML = `<p>Last viewed quote: "${quote.text}" - <em>${quote.category}</em></p>`;
}