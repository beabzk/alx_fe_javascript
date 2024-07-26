let quotes = [
    { text: "Be the change you wish to see in the world.", category: "Inspirational" },
    { text: "The only way to do great work is to love what you do.", category: "Motivational" },
    { text: "In three words I can sum up everything I've learned about life: it goes on.", category: "Life" }
  ];
  
  function showRandomQuote() {
    const quoteDisplay = document.getElementById('quoteDisplay');
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    quoteDisplay.innerHTML = `<p>"${randomQuote.text}" - <em>${randomQuote.category}</em></p>`;
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
      alert('New quote added successfully!');
      document.getElementById('newQuoteText').value = '';
      document.getElementById('newQuoteCategory').value = '';
    } else {
      alert('Please enter both quote text and category.');
    }
  }
  
  // Event listener for the "Show New Quote" button
  document.getElementById('newQuote').addEventListener('click', showRandomQuote);
  
  // Initial quote display
  showRandomQuote();
  
  // Create and add the form for new quotes
  createAddQuoteForm();