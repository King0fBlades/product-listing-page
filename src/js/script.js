'use strict';

const apiUrl = 'https://fakestoreapi.com/products';

class App {
   constructor(productsContainer, priceCheckboxes, ratingCheckboxes) {
      this.productsContainer = productsContainer;
      this.priceCheckboxes = priceCheckboxes;
      this.ratingCheckboxes = ratingCheckboxes;
      this.products = [];
      this.filteredProducts = this.products;
 
      this.productsErrorContainer = document.getElementById('products-error-container');
      this.categoryList = document.querySelector('.category-list');
      this.mainMenu = document.querySelector('.main-navbar');
      this.mainBtn = document.querySelector('.main-button');
      this.filterBtn = document.querySelector('.filter-button');
      this.filterCloseBtn = document.querySelector('.filter-close-button');
      this.filterMenu = document.querySelector('.filter-menu');
      this.itemsCount = document.querySelector('.items-count');
      this.itemsTotal = document.querySelector('.items-total');
      this.loadMoreBtn = document.querySelector('.load-more-button');
      this.priceFilter = document.querySelector('#priceFilter');
      this.priceFilterCheckboxes = Array.from(document.querySelectorAll('input[name="priceFilter"]'));
      this.ratingFilterCheckboxes = Array.from(document.querySelectorAll('input[name="ratingFilter"]'));
      this.currentCategoryPageHeading = document.getElementById('current-category-page');
      this.sortOption = document.querySelector('#sortOptions');
 
      this.allProducts = [];
      this.loadedProductsCount = 0;
      this.allProductsCount = 0;
      this.productsPerLoad = 8;
      this.selectedCategory = 'all';
      this.selectedPriceFilters = [];
      this.selectedRatingFilters = [];
      this.isAnyCheckboxSelected = false;
      this.originalFilteredProducts = this.filterProductsByPriceAndRating(this.allProducts);
   
      this.initializeEventListeners();
      this.initializeApp();
   }

   

   initializeEventListeners() {
      this.priceFilterCheckboxes.forEach(checkbox => {
         checkbox.addEventListener('change', () => {
           this.selectedPriceFilters = this.getSelectedPriceFilter();
           this.updateFilterState();
           this.updateFilteredProducts();
         });
       });
     
       this.ratingFilterCheckboxes.forEach(checkbox => {
         checkbox.addEventListener('change', () => {
           this.selectedRatingFilters = this.getSelectedRatingFilter();
           this.updateFilterState();
           this.updateFilteredProducts();
         });
       });


      this.mainBtn.addEventListener('click', () => {
         this.toggleMainMenu();
      });
   
      this.filterBtn.addEventListener('click', () => {
         this.toggleFilterMenu();
      });
   
      this.filterCloseBtn.addEventListener('click', () => {
         this.filterMenu.classList.add('hidden');
      });

      this.loadMoreBtn.addEventListener('click', () => {
         this.loadProducts();
      });
   
      this.categoryList.addEventListener('click', (e) => {
        e.preventDefault();
        const categoryLink = e.target.closest('a');
        if (!categoryLink) return;
        this.selectedCategory = categoryLink.textContent.trim().toLowerCase();
        this.productsContainer.innerHTML = ''; // Clear existing products
        this.renderCategory(this.selectedCategory, this.productsPerLoad);
        this.updateCategoryHeading(this.selectedCategory);
      });

      this.mainMenu.addEventListener('click', (e) => {
         e.preventDefault();
         const categoryLink = e.target.closest('a');
         if (!categoryLink) return;
   
         const selectedCategory = categoryLink.getAttribute('data-category');
         if (selectedCategory) {
            this.selectedCategory = selectedCategory;
            this.productsContainer.innerHTML = '';
            this.getProductsLimit(this.productsPerLoad); 

            this.updateCategoryHeading(this.selectedCategory);
         }
      });

      this.sortOption.addEventListener('change', () => {
         this.handleSortOptionChange(this.allProducts);
      });

      this.productsContainer.addEventListener('click', (e) => {
        const addToCartButton = e.target.closest('[id^="add-to-cart-button-"]');
        const addToFavoriteButton = e.target.closest('[id^="add-to-favorite-button-"]');
        const productName = addToCartButton ? addToCartButton.dataset.productName : null || addToFavoriteButton ? addToFavoriteButton.dataset.productName : null;
    
        if (productName) {
            Swal.fire({
                title: 'Success!',
                text: `${productName} added to ${addToCartButton ? 'cart' : 'favorite'}`,
                icon: 'success',
                confirmButtonText: 'OK'
            });
          }
        });
    }

    handleSortOptionChange(products) {
      console.log("Sorting option changed");
      const selectedSortOption = this.sortOption.value;
      console.log("Selected sort option:", selectedSortOption);
      let sortedProducts = this.filterProductsByPriceAndRating(this.allProducts);
      
      switch (selectedSortOption) {
        case "a_z":
          sortedProducts.sort((a, b) => a.title.localeCompare(b.title));
          console.log("Sorted A-Z");
          break;
        case "z_a":
          sortedProducts.sort((a, b) => b.title.localeCompare(a.title));
          console.log("Sorted Z-A");
          break;
        case "price_low_to_high":
          sortedProducts.sort((a, b) => a.price - b.price);
          console.log("Sorted price low to high");
          break;
        case "price_high_to_low":
          sortedProducts.sort((a, b) => b.price - a.price);
          console.log("Sorted price high to low");
          break;
        case "rating_low_to_high":
          sortedProducts.sort((a, b) => a.rating.rate - b.rating.rate);
          console.log("Sorted rating low to high");
          break;
        case "rating_high_to_low":
          sortedProducts.sort((a, b) => b.rating.rate - a.rating.rate);
          console.log("Sorted rating high to low");
          break;
        default:
          break;
      }
      
      this.renderProducts(sortedProducts)
      console.log('Sorted products:', sortedProducts);
    }
   
  
    sortProducts(compareFunction) {
      let sortedProducts = this.filterProductsByPriceAndRating(this.allProducts);
      filteredProducts.sort(compareFunction);
      this.filteredProducts.sort(compareFunction);
    }
   

   updateFilteredProducts() {
      this.selectedPriceFilters = this.getSelectedPriceFilter();
      this.selectedRatingFilters = this.getSelectedRatingFilter();
      this.updateFilterState();
    
      if (this.isAnyCheckboxSelected) {
        let filteredProducts = this.filterProductsByPriceAndRating(this.allProducts);
    
        switch (this.sortOption.value) {
          case "a_z":
            filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
            break;
          case "z_a":
            filteredProducts.sort((a, b) => b.title.localeCompare(a.title));
            break;
          case "price_low_to_high":
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
          case "price_high_to_low":
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
          case "rating_low_to_high":
            filteredProducts.sort((a, b) => a.rating.rate - b.rating.rate);
            break;
          case "rating_high_to_low":
            filteredProducts.sort((a, b) => b.rating.rate - a.rating.rate);
            break;
          default:
            break;
        }

        this.filteredProducts = filteredProducts;
        this.renderProducts(this.filteredProducts);
        console.log('Filtered products:', this.filteredProducts);
      } else {
        this.filteredProducts = this.originalFilteredProducts;
        this.renderProducts(this.filteredProducts);
        console.log('Original filtered products:', this.filteredProducts);
      }
    }

    updateProductDisplay() {
      this.productsContainer.innerHTML = '';
      this.filteredProducts.forEach((product, index) => {
         this.productsContainer.innerHTML += this.renderProducts(product, index);
      });
   }
    
   

    updateCategoryHeading(category) {
      if (category === 'all') {
         this.currentCategoryPageHeading.innerText = 'All products';
      } else {
         this.currentCategoryPageHeading.innerText = category.charAt(0).toUpperCase() + category.slice(1);
      }
   }
   
  

   async renderCategory(category, limit) {
    try {
      const filteredCategoryData = this.allProducts.filter(product => {
        return category === 'all' || product.category === category;
      });

      this.itemsTotal.innerText = filteredCategoryData.length;
      this.itemsCount.innerText = filteredCategoryData.length;
      this.renderProducts(filteredCategoryData);
      console.log("All products:", this.allProductsCount, this.allProducts);
      console.log(filteredCategoryData);  

      if (filteredCategoryData.length < this.productsPerLoad || filteredCategoryData.length === this.allProductsCount) {
        this.loadMoreBtn.style.display = 'none';
      } else {
        this.loadMoreBtn.style.display = 'block';
      }
    } catch (error) {
      console.error(error);
    }
  }

   async loadProducts() {
      this.loadedProductsCount += this.productsPerLoad;
      this.productsContainer.innerHTML = '';
  
      if (this.selectedCategory === 'all') {
         if (this.loadedProductsCount >= this.allProductsCount) {
            this.loadMoreBtn.style.display = 'none';
         }
         await this.getProductsLimit(this.loadedProductsCount);
      } else {
         try {
            const res = await fetch(apiUrl + `/category/${this.selectedCategory}?limit=${this.loadedProductsCount}`);
            const categoryData = await res.json();
  
            this.itemsTotal.innerText = categoryData.length;
            this.itemsCount.innerText = categoryData.length;
            this.renderProducts(categoryData);
  
            if (categoryData.length < this.productsPerLoad || categoryData.length === this.allProductsCount) {
            this.loadMoreBtn.style.display = 'none';
            } else {
            this.loadMoreBtn.style.display = 'block';
            }
         } catch (error) {
            console.error(error);
         }
      }
   }
   

  renderCategories(categories) {
    this.categoryList.innerHTML = categories.map(category => `
      <li class="py-1">
        <a href="" class="relative group">
          ${category.charAt(0).toUpperCase() + category.slice(1)}
          <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-black group-hover:w-full group-hover:transition-all"></span>
        </a>
      </li>
    `).join('');
  }

  renderProducts(products) {
      let productsHTML = '';
      products.forEach((product, index) => {
      productsHTML += `
          <div class=" justify-between flex-col border p-5 rounded-lg">
            <div class="group relative">
               <div class="aspect-h-1 aspect-w-1 max-h-[500px] min-h-[400px] w-full overflow-hidden rounded-md bg-white flex items-center lg:aspect-none group-hover:opacity-75 lg:h-80">
               <img src="${product.image}" class="h-full w-full object-contain bg-white object-center">
               </div>

               <div class="mt-4 flex flex-col justify-start">
                  <div>
                    <h3 class="text-xl font-semibold text-gray-700">
                      <a href="#">
                      <span aria-hidden="true" class="absolute inset-0"></span>
                      ${product.title}
                      </a>
                    </h3>
                    <p class="mt-1 text-sm text-gray-500">
                      ${product.description.slice(0, 100) + '...'}
                    </p>
                  </div>  
               </div>
            </div>

            <div class="flex gap-2 flex-col justify-between mt-2">
              <div class="flex flex-row justify-between">
                <div class="flex items-center mt-1">
                  <svg class="w-4 h-4 text-yellow-300 mr-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
                    <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                  </svg>
                    <p class="ml-2 text-md font-bold text-gray-500">${product.rating.rate}</p>
                  </div>
                  <div>
                    <p class="text-xl font-medium text-gray-900 mt-1">
                    $${product.price}
                    </p>
                  </div>
                </div>
                <div>
                  <button 
                    type="button" 
                    data-product-name="${product.title}" 
                    id="add-to-cart-button-${index}"
                    class="flex gap-2 justify-center font-semibold w-full px-2 py-2 border-2 hover:border-gray-400 rounded-md bg-gray-200"
                  >
                    Add to cart
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </svg>
                  </button>
                </div>
                <div>
                  <button
                    type="button" 
                    id="add-to-favorite-button-${index}"
                    data-product-name="${product.title}"
                    class="flex gap-2 justify-center font-semibold w-full px-2 py-2 border-2 hover:border-gray-400 rounded-md bg-gray-50"
                  >
                    Favorite
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </button>
                </div>
              </div>
          </div>
        `;
      this.productsContainer.innerHTML = productsHTML;
    });
  }

    toggleMainMenu() {
      this.toggleMenu(this.mainMenu);
  }

    toggleFilterMenu() {
      this.toggleMenu(this.filterMenu);
  }

    toggleMenu(menu) {
      menu.classList.toggle('hidden');
   }
 
    getSelectedPriceFilter() {
      return this.priceFilterCheckboxes
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);
   }
  
    getSelectedRatingFilter() {
      return this.ratingFilterCheckboxes
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);
  }
  
  updateFilterState() {
      this.isAnyCheckboxSelected = this.selectedPriceFilters.length > 0 || this.selectedRatingFilters.length > 0;
  }
  
  async initializeApp() {
    await this.getCategoriesData();
    await this.getProductsLimit(this.productsPerLoad);
    this.originalFilteredProducts = this.filterProductsByPriceAndRating(this.allProducts);
    this.updateFilterState();
    this.handleSortOptionChange(this.allProducts);
  }
  
  async getCategoriesData() {
  try {
    const res = await fetch(apiUrl);
    if (!res.ok) {
      // Handle error
    }
    const products = await res.json();

    this.allProductsCount = products.length;
    this.itemsTotal.innerText = this.allProductsCount;

    const allCategories = products.map(product => product.category);
    const uniqueCategories = [
      "All",
      ...allCategories.filter((product, index) => allCategories.indexOf(product) === index)
    ];

    this.renderCategories(uniqueCategories);
  } catch (error) {
    console.error(error);
  }
}
  
    async getProductsLimit(limit) {
      try {
         let url = apiUrl;
         if (this.selectedCategory !== 'all') {
            url += `/category/${this.selectedCategory}`;
         }
         url += `?limit=${limit}`;
   
         const res = await fetch(url);
         const products = await res.json();
   
         this.loadedProductsCount = products.length;
         this.allProducts = products;
         this.originalFilteredProducts = this.filterProductsByPriceAndRating(products);
         this.itemsTotal.innerText = this.allProductsCount;
         this.renderProducts(products);
   
         if (this.loadedProductsCount < this.productsPerLoad || this.loadedProductsCount === this.allProductsCount) {
            this.loadMoreBtn.style.display = 'none';
         } else {
            this.loadMoreBtn.style.display = 'block';
         }
      } catch (error) {
         console.error(error);
      }
   }
   

    filterProductsByPriceAndRating(products) {
      let filteredProducts = products.slice();
  
      if (this.selectedPriceFilters.length) {
        filteredProducts = filteredProducts.filter((product) => {
          const price = product.price;
          return this.selectedPriceFilters.some((filter) => {
            if (filter === 'under_100' && price < 100) {
              return true;
            } else if (filter === '100_to_199' && price >= 100 && price < 200) {
              return true;
            } else if (filter === 'above_200' && price >= 200) {
              return true;
            }
            return false;
          });
        });
      }
  
      if (this.selectedRatingFilters.length) {
        filteredProducts = filteredProducts.filter((product) => {
          const rating = product.rating.rate;
          return this.selectedRatingFilters.some((filter) => {
            if (filter === 'under_1' && rating < 1) {
              return true;
            } else if (filter === '1_to_1.9' && rating >= 1 && rating < 2) {
              return true;
            } else if (filter === '2_to_2.9' && rating >= 2 && rating < 3) {
              return true;
            } else if (filter === '3_to_3.9' && rating >= 3 && rating < 4) {
              return true;
            } else if (filter === 'above_4' && rating >= 4) {
              return true;
            }
            return false;
          });
        });
      }
  
      return filteredProducts;
    }
}

 
document.addEventListener('DOMContentLoaded', () => {
   const productsContainer = document.getElementById('products-container');
   const priceFilterCheckboxes = Array.from(document.querySelectorAll('input[name="priceFilter"]'));
   const ratingFilterCheckboxes = Array.from(document.querySelectorAll('input[name="ratingFilter"]'));
 
   const app = new App(productsContainer, priceFilterCheckboxes, ratingFilterCheckboxes);
});
 