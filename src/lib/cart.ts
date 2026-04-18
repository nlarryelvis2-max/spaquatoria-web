"use client";

import { products } from "./data";

export interface CartItem {
  productId: string;
  volumeId: string;
  quantity: number;
}

const CART_KEY = "cart";

function notify() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cart-updated"));
  }
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(CART_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveCart(cart: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addToCart(productId: string, volumeId: string): void {
  const cart = getCart();
  const idx = cart.findIndex(
    (i) => i.productId === productId && i.volumeId === volumeId
  );
  if (idx >= 0) {
    cart[idx].quantity += 1;
  } else {
    cart.push({ productId, volumeId, quantity: 1 });
  }
  saveCart(cart);
  notify();
}

export function removeFromCart(productId: string, volumeId: string): void {
  const cart = getCart();
  const idx = cart.findIndex(
    (i) => i.productId === productId && i.volumeId === volumeId
  );
  if (idx >= 0) {
    cart[idx].quantity -= 1;
    if (cart[idx].quantity <= 0) {
      cart.splice(idx, 1);
    }
    saveCart(cart);
    notify();
  }
}

export function deleteFromCart(productId: string, volumeId: string): void {
  const cart = getCart().filter(
    (i) => !(i.productId === productId && i.volumeId === volumeId)
  );
  saveCart(cart);
  notify();
}

export function clearCart(): void {
  localStorage.removeItem(CART_KEY);
  notify();
}

export function getCartCount(): number {
  return getCart().reduce((sum, i) => sum + i.quantity, 0);
}

export function getCartTotal(): number {
  const cart = getCart();
  let total = 0;
  for (const item of cart) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) continue;
    const volume = product.volumes.find((v) => v.id === item.volumeId);
    if (!volume) continue;
    total += volume.retailPrice * item.quantity;
  }
  return total;
}
