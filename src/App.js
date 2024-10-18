import React, { useState, useEffect } from 'react';
import { fetchProducts, fetchCategories } from './services/productService';
import './App.css'; // Importiranje CSS-a

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState({ min: 0, max: Infinity });
  const [sortOption, setSortOption] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const priceRanges = [
    { label: 'All Prices', min: 0, max: Infinity },
    { label: '10$ - 50$', min: 10, max: 50 },
    { label: '50$ - 100$', min: 50, max: 100 },
    { label: '100$+', min: 100, max: Infinity }
  ];

  useEffect(() => {
    const loadProducts = async () => {
      const data = await fetchProducts();
      setProducts(data);
    };

    loadProducts();
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      const categoriesData = await fetchCategories();
      setCategories(categoriesData);
    };

    loadCategories();
  }, []);

  const handleCategoryChange = async (event) => {
    const category = event.target.value;
    setSelectedCategory(category);

    if (category === '') {
      const allProducts = await fetchProducts();
      setProducts(allProducts);
    } else {
      const response = await fetch(`https://dummyjson.com/products/category/${category}`);
      const data = await response.json();
      setProducts(data.products);
    }
  };

  const handlePriceChange = (event) => {
    const range = priceRanges[event.target.value];
    setSelectedPriceRange(range);
  };

  const filteredProducts = products.filter(
    product => product.price >= selectedPriceRange.min && product.price <= selectedPriceRange.max
  );

  const sortedProducts = [...filteredProducts];

  if (sortOption === 'price-asc') {
    sortedProducts.sort((a, b) => a.price - b.price);
  } else if (sortOption === 'price-desc') {
    sortedProducts.sort((a, b) => b.price - a.price);
  } else if (sortOption === 'name-asc') {
    sortedProducts.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortOption === 'name-desc') {
    sortedProducts.sort((a, b) => b.title.localeCompare(a.title));
  }

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const searchedProducts = sortedProducts.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtriraj proizvode koji već postoje u košarici
  const currentProducts = searchedProducts
    .filter(product => !cart.some(cartItem => cartItem.id === product.id))
    .slice(indexOfFirstProduct, indexOfLastProduct);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const addToCart = (product) => {
    setCart([...cart, product]);
    setProducts(products.filter(p => p.id !== product.id)); // Ukloni proizvod iz prikaza
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  return (
    <div>
      <h1>Product Catalog</h1>

      {/* Kontejner za sve kontrole */}
      <div className="controls-container">
        {/* Search bar */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search for products..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        {/* Dropdown za odabir kategorije */}
        <select value={selectedCategory} onChange={handleCategoryChange}>
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>

        {/* Dropdown za raspon cijena */}
        <select value={priceRanges.indexOf(selectedPriceRange)} onChange={handlePriceChange}>
          {priceRanges.map((range, index) => (
            <option key={index} value={index}>
              {range.label}
            </option>
          ))}
        </select>

        {/* Dropdown za sortiranje */}
        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
          <option value="">Sort by</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name-asc">Name: A to Z</option>
          <option value="name-desc">Name: Z to A</option>
        </select>
      </div>

      {/* Prikaz proizvoda na trenutnoj stranici */}
      <div className="product-grid">
        {currentProducts.map(product => (
          <div key={product.id} className="product-card" onClick={() => handleProductClick(product)}>
            <img src={product.thumbnail} alt={product.title} />
            <h3>{product.title}</h3>
            <p>{product.price} $</p>
            <p>{product.description.slice(0, 100)}...</p>
            <button onClick={() => addToCart(product)}>Add to Cart</button>
          </div>
        ))}
      </div>

      {/* Paginacija */}
      <div className="pagination">
        {Array.from({ length: Math.ceil(searchedProducts.length / productsPerPage) }, (_, index) => (
          <button key={index + 1} onClick={() => paginate(index + 1)} disabled={currentPage === index + 1}>
            {index + 1}
          </button>
        ))}
      </div>

      {/* Prikaz košarice */}
      <h2>Shopping Cart</h2>
      <button onClick={clearCart}>Clear Cart</button>
      <ul>
        {cart.map((product, index) => (
          <li key={index}>
            {product.title} - {product.price} $
          </li>
        ))}
      </ul>

      {/* Prikaz odabranog proizvoda */}
      {selectedProduct && (
        <div>
          <h2>{selectedProduct.title}</h2>
          <img src={selectedProduct.thumbnail} alt={selectedProduct.title} />
          <p>{selectedProduct.description}</p>
          <p>Price: {selectedProduct.price} $</p>
        </div>
      )}
    </div>
  );
}

export default App;
