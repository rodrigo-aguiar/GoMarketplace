import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const cachedProducts = await AsyncStorage.getItem(
        '@GoMarketplace:cartProducts',
      );

      if (cachedProducts) {
        setProducts(JSON.parse(cachedProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      setProducts([
        ...products,
        {
          id: product.id,
          title: product.title,
          image_url: product.image_url,
          price: product.price,
          quantity: 1,
        },
      ]);

      await AsyncStorage.setItem(
        '@GoMarketplace:cartProducts',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      setProducts(
        products.map(product => {
          if (product.id === id) {
            return {
              id: product.id,
              title: product.title,
              image_url: product.image_url,
              price: product.price,
              quantity: product.quantity + 1,
            };
          }

          return product;
        }),
      );

      await AsyncStorage.setItem(
        '@GoMarketplace:cartProducts',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const cartProducts = products.map(product => {
        if (product.id === id) {
          return {
            id: product.id,
            title: product.title,
            image_url: product.image_url,
            price: product.price,
            quantity: product.quantity - 1,
          };
        }

        return product;
      });
      setProducts(cartProducts.filter(({ quantity }) => quantity > 0));

      await AsyncStorage.setItem(
        '@GoMarketplace:cartProducts',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
