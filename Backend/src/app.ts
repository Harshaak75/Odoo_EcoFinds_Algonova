import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

//? Authentication Routes
import authRoute from "./Routes/Authentication/auth"

//? Buyer Routes
import buyerRoute from "./Routes/Buyer/buyerRoute";



dotenv.config();
const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

//* Buyer Route

// Authentication Routes Buyer

// POST   /api/auth/register      → Register new buyer
// POST   /api/auth/login         → Login buyer
// POST   /api/auth/logout        → Logout buyer
// GET    /api/auth/me            → Get logged-in buyer profile

app.use("/api/auth", authRoute);

// Product Routes Buyer

// GET    /api/products                 → Get all products (with pagination, filters, search)
// GET    /api/products/:id             → Get product details by ID
// GET    /api/categories               → Get all product categories
// GET    /api/products/category/:catId → Get products by category


//! /api/products?search=shoes&priceMin=500&priceMax=2000&sort=price_asc  used for filtering and searching products

app.use("/api/products", buyerRoute);
app.use("/api/products", buyerRoute); // categories
app.use("/api/products", buyerRoute);

// Cart Routes Buyer


// GET    /api/cart               → Get current buyer’s cart
// POST   /api/cart               → Add product to cart { productId, quantity }
// PUT    /api/cart/:itemId       → Update quantity of cart item
// DELETE /api/cart/:itemId       → Remove item from cart
// DELETE /api/cart               → Clear entire cart


app.use("/api/cart", buyerRoute);


// Buyrer Profile Routes

// GET    /api/users/me           → Get buyer profile (name, email, address, etc.)
// PUT    /api/users/me           → Update buyer profile


app.use("/api/users", buyerRoute);

// order Routes Buyer


app.get("/", (_req, res) => {
  res.json({ message: "Backend is running 🚀" });
});

export default app;
