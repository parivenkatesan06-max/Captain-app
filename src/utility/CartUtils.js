import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [orderReferenceNumber, setOrderReferenceNumber] = useState(null); // Added state to store orderReferenceNumber
    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = cartItems.reduce(
        (acc, item) => acc + item.offerPrice * item.quantity,
        0
    );
    const cgstRate = 0.09;
    const sgstRate = 0.09;
    const cgstAmount = totalPrice * cgstRate;
    const sgstAmount = totalPrice * sgstRate;
    const grandTotal = (totalPrice + cgstAmount + sgstAmount).toFixed(2);

    // Function to add an item to the cart
    const addToCart = (item, quantity) => {
        setCartItems((prev) => {
            const existingItem = prev.find((cartItem) => cartItem.menuId === item.menuId);
            let updatedCart;
            if (existingItem) {
                updatedCart = prev.map((cartItem) =>
                    cartItem.menuId === item.menuId
                        ? { ...cartItem, quantity: cartItem.quantity + quantity }
                        : cartItem
                );
            } else {
                updatedCart = [...prev, { ...item, quantity }];
            }
            return updatedCart;
        });
    };

    // Function to set the order reference number
    const setOrderReference = (referenceNumber) => {
        setOrderReferenceNumber(referenceNumber);
    };

    // Function to update the quantity of an item in the cart
    const updateQuantity = (id, quantity) => {
        setCartItems((prev) => {
            const updatedCart = prev.map((cartItem) =>
                cartItem.menuId === id ? { ...cartItem, quantity } : cartItem
            );
            return updatedCart;
        });
    };

    // Function to remove an item from the cart
    const removeFromCart = (id) => {
        setCartItems((prev) => {
            const updatedCart = prev.filter((cartItem) => cartItem.menuId !== id);
            return updatedCart;
        });
    };

    // Function to clear the entire cart
    const clearCart = () => {
        setCartItems([]);
    };

    // Timeout for inactivity to clear the cart
    useEffect(() => {
        let timeout;

        const resetTimeout = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                clearCart(); // Clear the cart after inactivity
            },  3 * 60 * 60 * 1000); // 5 minutes of inactivity
        };

        // Event listeners to detect user activity
        window.addEventListener("mousemove", resetTimeout);
        window.addEventListener("keydown", resetTimeout);
        window.addEventListener("scroll", resetTimeout);

        resetTimeout(); // Initialize the timeout

        return () => {
            // Cleanup event listeners and timeout
            clearTimeout(timeout);
            window.removeEventListener("mousemove", resetTimeout);
            window.removeEventListener("keydown", resetTimeout);
            window.removeEventListener("scroll", resetTimeout);
        };
    }, []);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                updateQuantity,
                removeFromCart,
                clearCart,
                totalItems,
                totalPrice,
                cgstAmount,
                sgstAmount,
                grandTotal,
                cgstRate,
                sgstRate,
                orderReferenceNumber, 
                setOrderReference,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
