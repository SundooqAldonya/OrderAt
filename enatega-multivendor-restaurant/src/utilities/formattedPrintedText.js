export const formattedPrintedText = (order, currency) => {
  console.log({ currency: order.currencySymbol })
  const address =
    order.shippingMethod === 'PICKUP'
      ? 'PICKUP'
      : `${order.deliveryAddress.label} ${order.deliveryAddress.details} ${order.deliveryAddress.deliveryAddress}`
  const {
    user: { email, phone },
    taxationAmount: tax,
    tipping: tip,
    paidAmount,
    orderAmount
  } = order
  const deliveryCharges = order.deliveryCharges
  // const currency = order.currencySymbol

  let itemsText = order.items
    .map(item => {
      const addons = item.addons
        .map(addon => {
          const options = addon.options.map(opt => opt.title).join(', ')
          return `  - ${addon.title}: ${options}`
        })
        .join('\n')
      const price = (
        item.variation.price +
        item.addons
          .map(addon => addon.options.reduce((sum, opt) => sum + opt.price, 0))
          .reduce((sum, val) => sum + val, 0)
      ).toFixed(2)
      return `${item.title}${
        item.variation.title ? ':' + item.variation.title : ''
      }\nQty: ${item.quantity}  Price: ${currency}${price}\n${addons}`
    })
    .join('\n\n')

  return `
  Orderat Business
  ------------------------------
  Contact Info
  Address: ${address}
  Email: ${email}
  Phone: ${phone}
  ------------------------------
  Items:
  ${itemsText}
  ------------------------------
  Tax: ${currency}${tax.toFixed(2)}
  Tip: ${currency}${tip.toFixed(2)}
  Delivery: ${currency}${deliveryCharges.toFixed(2)}
  Total: ${currency}${orderAmount.toFixed(2)}
  Paid: ${currency}${paidAmount.toFixed(2)}
  ------------------------------
  Thank you for your business!
  `
}
