export const constants = {
  localStorageCartName : '@RocketShoes:cart',
  textContent: {
    rocketShoes: 'Rocketshoes',
    addToCart: 'ADICIONAR AO CARRINHO',
    myCart: 'Meu carrinho',
    finishOrder: 'Finalizar Pedido',
    cartHeaders : {
      product: 'PRODUTO',
      quantity: 'QTD',
      subtotal: 'SUBTOTAL'
    },
    total: 'TOTAL',
    cartSize: (quantity: number) => quantity === 1 ? `${quantity} item` : `${quantity} itens`
  }
}

