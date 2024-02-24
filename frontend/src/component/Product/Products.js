import React, { Fragment, useEffect, useState } from "react";
import "./Products.css";
import { useSelector, useDispatch } from "react-redux";
import { clearErrors, getProduct } from "../../actions/productAction";
import Loader from "../layout/Loader/Loader";
import ProductCard from "../Home/ProductCard";
import Pagination from "react-js-pagination";
import Slider from "@material-ui/core/Slider";
import { useAlert } from "react-alert";
import Typography from "@material-ui/core/Typography";
import MetaData from "../layout/MetaData";

const categories = ["Veg", "Non Veg", "Beverage"];

const Products = ({ match }) => {
  const dispatch = useDispatch();
  const alert = useAlert();

  const [currentPage, setCurrentPage] = useState(1);
  const [priceFilter, setPriceFilter] = useState([25, 150]);
  const [category, setCategory] = useState("");
  const [priceChanged, setPriceChanged] = useState(false); // New state to track if price has changed

  const {
    products,
    loading,
    error,
    productsCount,
    resultPerPage,
    filteredProductsCount,
  } = useSelector((state) => state.products);

  const keyword = match.params.keyword;

  useEffect(() => {
    // Fetch products when the component mounts
    dispatch(getProduct(keyword, currentPage, priceFilter, category));
  }, [dispatch, keyword]);

  useEffect(() => {
    // Fetch products when price filter changes
    if (priceChanged) {
      dispatch(getProduct(keyword, currentPage, priceFilter, category));
      setPriceChanged(false); // Reset priceChanged state after fetching products
    }
  }, [dispatch, keyword, currentPage, priceFilter, category, priceChanged]);

  const setCurrentPageNo = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const priceHandler = (event, newPrice) => {
    // Update the price filter state without fetching products immediately
    setPriceFilter(newPrice);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Set priceChanged state to true to trigger fetching products
    setPriceChanged(true);
  };

  return (
    <Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Fragment>
          <MetaData title="PRODUCTS -- TMP Online" />
          <h2 className="productsHeading">Products</h2>

          <div className="products">
            {products &&
              products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
          </div>

          <div className="filterBox">
            <Typography>Price</Typography>
            <form onSubmit={handleSubmit}>
              <Slider
                value={priceFilter}
                onChange={priceHandler}
                valueLabelDisplay="auto"
                aria-labelledby="range-slider"
                min={25}
                max={150}
              />
              <div className="price-inputs">
                <span>From</span>
                <input
                  type="number"
                  value={priceFilter[0]}
                  onChange={(e) => setPriceFilter([e.target.value, priceFilter[1]])}
                />
                <span>To</span>
                <input
                  type="number"
                  value={priceFilter[1]}
                  onChange={(e) => setPriceFilter([priceFilter[0], e.target.value])}
                />
              </div>
              <button type="submit">Apply</button>
            </form>

            <Typography>Categories</Typography>
            <ul className="categoryBox">
              {categories.map((category) => (
                <li
                  className="category-link"
                  key={category}
                  onClick={() => setCategory(category)}
                >
                  {category}
                </li>
              ))}
            </ul>
          </div>
          {resultPerPage < filteredProductsCount && (
            <div className="paginationBox">
              <Pagination
                activePage={currentPage}
                itemsCountPerPage={resultPerPage}
                totalItemsCount={productsCount}
                onChange={setCurrentPageNo}
                nextPageText="Next"
                prevPageText="Prev"
                firstPageText="1st"
                lastPageText="Last"
                itemClass="page-item"
                linkClass="page-link"
                activeClass="pageItemActive"
                activeLinkClass="pageLinkActive"
              />
            </div>
          )}
        </Fragment>
      )}
    </Fragment>
  );
};

export default Products;
