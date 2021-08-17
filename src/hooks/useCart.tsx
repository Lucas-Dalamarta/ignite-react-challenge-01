import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { api } from '../services/api';
import { Product, Stock } from '../types';
import { constants } from '../util/constants';
import { errorMessages } from '../util/errorMessages';
interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem(constants.localStorageCartName);

    return storagedCart ? JSON.parse(storagedCart) : []
  });

  const prevCartRef = useRef<Product[]>()

  useEffect(() => { prevCartRef.current = cart })

  const cartPreviousValue = prevCartRef.current ?? cart

  useEffect(() => {
    if (cartPreviousValue !== cart) localStorage.setItem(constants.localStorageCartName, JSON.stringify(cart))
  }, [cart, cartPreviousValue])

  const addProduct = async (productId: number) => {
    try {
      const updatedCart = [...cart];
      const productExists = updatedCart.find(product => product.id === productId)
      const stockAmount = await api.get<Stock>(`/stock/${productId}`).then((result) => result.data.amount)
      
      const currentAmount = productExists ? productExists.amount : 0
      const finalAmount = currentAmount + 1

      if (finalAmount > stockAmount) {
        toast.error(errorMessages.productOutOfStockError)
        return
      }

      productExists ? (
        productExists.amount = finalAmount
      ) : (
        await api.get(`/products/${productId}`)
          .then(product => {
            return updatedCart.push({
              ...product.data,
              amount: 1
            })
          })
      )

      setCart(updatedCart)
      
    } catch {
      toast.error(errorMessages.addProductToCartError)
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const updatedCart = [...cart];
      const productIndex = updatedCart.findIndex(product => product.id === productId)

      if (productIndex >= 0) {
        updatedCart.splice(productIndex, 1)
        setCart(updatedCart)
      } else {
        throw Error()
      }
    } catch {
      toast.error(errorMessages.removeProductFromCartError)
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount <=0) return

      const stock = await api.get(`/stock/${productId}`)
      const stockAmount = stock.data.amount
      if (amount > stockAmount) {
        toast.error(errorMessages.productOutOfStockError)
        return
      }

      const updatedCart = [...cart];
      const productExists = updatedCart.find(product => product.id === productId)

      if (productExists) {
        productExists.amount = amount
        setCart(updatedCart)
      } else {
        throw Error()
      }
    } catch {
      toast.error(errorMessages.updateProductQuantityInCartError)
    }
  };

  return (
    <CartContext.Provider
      value={{ 
        cart, 
        addProduct, 
        removeProduct, 
        updateProductAmount 
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = (): CartContextData => useContext(CartContext);
