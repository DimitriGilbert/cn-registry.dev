"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface Component {
	id: string;
	name: string;
	description: string;
	repoUrl?: string | null;
	websiteUrl?: string | null;
	installUrl?: string | null;
	installCommand?: string | null;
	tags?: string[] | null;
	status: string;
	createdAt: string;
	updatedAt: string;
	creator?: {
		id: string;
		name: string;
		username?: string | null;
		image?: string | null;
	} | null;
	categories?: Array<{
		id: string;
		name: string;
	} | null>;
	starsCount: number;
	githubUrl?: string | null;
	isStarred: boolean;
	forksCount: number;
	issuesCount: number;
	watchersCount: number;
	readme?: string | null;
	exampleCode?: string | null;
	previewUrl?: string | null;
}

interface CartContextType {
	cart: Component[];
	addToCart: (component: Component) => void;
	removeFromCart: (componentId: string) => void;
	clearCart: () => void;
	isInCart: (componentId: string) => boolean;
	getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "cn-registry-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
	const [cart, setCart] = useState<Component[]>([]);
	const [isLoaded, setIsLoaded] = useState(false);

	// Load cart from localStorage on mount
	useEffect(() => {
		try {
			const savedCart = localStorage.getItem(CART_STORAGE_KEY);
			if (savedCart) {
				const parsedCart = JSON.parse(savedCart);
				setCart(parsedCart);
			}
		} catch (error) {
			console.error("Failed to load cart from localStorage:", error);
		} finally {
			setIsLoaded(true);
		}
	}, []);

	// Save cart to localStorage whenever it changes
	useEffect(() => {
		if (isLoaded) {
			try {
				localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
			} catch (error) {
				console.error("Failed to save cart to localStorage:", error);
			}
		}
	}, [cart, isLoaded]);

	const addToCart = (component: Component) => {
		setCart((prevCart) => {
			// Check if component is already in cart
			const isAlreadyInCart = prevCart.some((item) => item.id === component.id);
			if (isAlreadyInCart) {
				return prevCart;
			}
			return [...prevCart, component];
		});
	};

	const removeFromCart = (componentId: string) => {
		setCart((prevCart) => prevCart.filter((item) => item.id !== componentId));
	};

	const clearCart = () => {
		setCart([]);
	};

	const isInCart = (componentId: string) => {
		return cart.some((item) => item.id === componentId);
	};

	const getCartTotal = () => {
		return cart.length;
	};

	const value: CartContextType = {
		cart,
		addToCart,
		removeFromCart,
		clearCart,
		isInCart,
		getCartTotal,
	};

	// Don't render until cart is loaded from localStorage
	if (!isLoaded) {
		return null;
	}

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
	const context = useContext(CartContext);
	if (context === undefined) {
		throw new Error("useCart must be used within a CartProvider");
	}
	return context;
}