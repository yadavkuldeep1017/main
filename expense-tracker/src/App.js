import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Purchase Tracker - Dahi and Other Items</h1>
      </header>
      <main>
        <section id="purchase-form">
          <h2>Record a New Purchase</h2>
          <form id="purchaseForm">
            <label for="purchaseDate">Purchase Date:</label>
            <input type="date" id="purchaseDate" required /><br />
            <label for="itemName">Name of Item:</label>
            <select id="itemName" required>
              <option value="Dahi">Dahi</option>
              <option value="Milk">Milk</option>
              <option value="Butter">Butter</option>
              <option value="Cheese">Cheese</option>
            </select><br />
            <label for="quantity">Quantity:</label>
            <input type="number" id="quantity" required /><br />
            <label for="price">Price/Payment Details:</label>
            <input type="number" id="price" step="0.01" required /><br />
            <label for="comment">Comment/Note:</label>
            <textarea id="comment"></textarea><br /> 
            <div className="button-container">
              <button id="save" type="submit">Save</button>
              <button id="cancel" type="reset">Cancel</button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default App;
