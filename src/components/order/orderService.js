const orderModel = require('./orderModel');
const soldProductModel = require("../SoldProduct/SoldProduct");
const mongoose = require('mongoose');

const util = require("./orderUtil");

const dateFns = require("date-fns");

exports.get = async (id) => {
  try {
    const order = await orderModel.findById(id).lean();
    if (order === null) {
      return {mess: `Order id '${id}' not found`};
    }
    else {
      order.total_price = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_price);
      order.shipping_fee = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.shipping_fee);
    }
    return order;
  } catch (err) {
    throw err;
  }
};

exports.getAll = async (id) => {
  try {
    const orders = await orderModel.find({"customer.id":mongoose.Types.ObjectId.createFromHexString(id)}).sort( [['createdAt', 'descending']]).lean();
    orders.forEach(e => {
      e.total_price = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(e.total_price);
      e.shipping_fee = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(e.shipping_fee);
      e.name = e.customer.customer_name;
    })

    return orders;
  } catch (err) {
    throw err;
  }
};

exports.getSales = async () => {
  const orders = await orderModel.find().lean();

  const todaySales = util.getSalesByDay(orders);
  const thisMonthSales = util.getSalesByMonth(orders);
  const thisQuarterSales = util.getSalesByQuarter(orders);
  const thisYearSales = util.getSalesByYear(orders);

  return { todaySales, thisMonthSales, thisQuarterSales, thisYearSales };
}

exports.getSalesInLast10Days = async () => {
  const result = [];
  for (let i = 10; i > 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);


    const orders = await orderModel
    .find(
        {
          createdAt: {
            $gte: dateFns.startOfDay(new Date(d)),
            $lt: dateFns.endOfDay(new Date(d)),
          },
        },
        { _id: true }
    )
    .lean();

    result.push({
      sales: orders.length,
      date: new Date(d)
    })
  }

  return result;
};

exports.getTop10BestSeller = async () => {
  const soldProducts = await soldProductModel.find().lean();
  soldProducts.sort((a, b) => b.quantity * b.total_price - a.quantity * a.total_price);
  return soldProducts.slice(0, 10);
}

exports.insert = async (checkout, address, payment, message) => {
  try {
    const newOrder = new orderModel ({
      products: checkout.cart.products,
      total_price: checkout.subtotal_price + checkout.shipping_fee,
      status: "Đang chờ",
      shipping_fee: checkout.shipping_fee,
      address: address,
      customer: checkout.customer,
      payment: payment,
      note: message
    });

    await newOrder.save();
  } catch (err) {
    throw err;
  }
}

/**
 * Tim order bang id, update thong tin san pham ton tai trong database
 *
 * @param id
 * @param updateOrder
 * @returns {Promise<{order: model}>}
 */
exports.update = async (id, updateOrder) => {
  try {
    return await orderModel.findByIdAndUpdate(id, updateOrder,
        { new: true });
  } catch (err) {
    throw err;
  }
}

/**
 * Xoa san pham dang co trong database bang id
 *
 * @param id
 * @returns {Promise<{order: model}>}
 */
exports.delete = async (id) => {
  try {
    return await orderModel.findByIdAndDelete(id);
  } catch (err) {
    throw err;
  }
}