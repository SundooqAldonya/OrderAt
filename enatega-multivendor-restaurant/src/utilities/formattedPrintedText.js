export const formattedPrintedText = (order, currency) => {
  // console.log({ currency: order.currencySymbol })
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
  اوردرات
  ------------------------------
  معلومات التوصيل
  العنوان: ${address}
  الايميل: ${email}
  التليفون: ${phone}
  ------------------------------
  المنتج:
  ${itemsText}
  ------------------------------
  الضريبة: ${currency}${tax.toFixed(2)}
  قيمة التوصيل: ${currency}${deliveryCharges.toFixed(2)}
  القيمة: ${currency}${orderAmount.toFixed(2)}
  دفع: ${currency}${paidAmount.toFixed(2)}
  ------------------------------
  شكرا للتعاون مع أوردارات
  `
}
