export function groupOrderItems(items, type = "variant") {
  const itemsMap = {};
  for (const item of items) {
    const variant = item.variant_id;
    const key =
      type === "product"
        ? variant.product_id._id.toString()
        : variant._id.toString();

    if (!itemsMap[key]) {
      itemsMap[key] = {
        variant,
        product: variant.product_id,
        attributes: variant.attributes,
        quantity: 0,
        price: item.price,
        subtotal: 0,
        total: 0,
      };
    }
    itemsMap[key].quantity += item.quantity;
    itemsMap[key].subtotal += item.price * item.quantity;
    itemsMap[key].total += item.price * item.quantity - (item.discount || 0);
  }
  return Object.values(itemsMap);
}

export function groupShopOrders(shopOrders, type = "variant") {
  return shopOrders.map((shopOrder) => {
    return {
      ...(shopOrder.toObject?.() ?? shopOrder),
      items: groupOrderItems(shopOrder.items, type),
    };
  });
}
