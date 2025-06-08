// Helper functions for working with notifications

/**
 * Creates a notification for a new product purchase
 * @param {Object} params - Parameters for the notification
 * @param {Function} createNotification - Function from useNotifications hook
 * @returns {Promise<Object>} - Result of the notification creation
 */
export const createPurchaseNotification = async (params, createNotification) => {
  const { userId, productName, orderId } = params;
  
  return await createNotification({
    user_id: userId,
    title: 'New Purchase',
    message: `Your purchase of ${productName} was successful!`,
    type: 'success',
    action_url: `/orders/${orderId}`,
    entity_type: 'order',
    entity_id: orderId
  });
};

/**
 * Creates a notification for a new product download
 * @param {Object} params - Parameters for the notification
 * @param {Function} createNotification - Function from useNotifications hook
 * @returns {Promise<Object>} - Result of the notification creation
 */
export const createDownloadNotification = async (params, createNotification) => {
  const { userId, productName, productId } = params;
  
  return await createNotification({
    user_id: userId,
    title: 'Product Downloaded',
    message: `You've successfully downloaded ${productName}.`,
    type: 'info',
    action_url: `/products/${productId}`,
    entity_type: 'product',
    entity_id: productId
  });
};

/**
 * Creates a notification for a payment method update
 * @param {Object} params - Parameters for the notification
 * @param {Function} createNotification - Function from useNotifications hook
 * @returns {Promise<Object>} - Result of the notification creation
 */
export const createPaymentMethodNotification = async (params, createNotification) => {
  const { userId, paymentType, last4 } = params;
  
  return await createNotification({
    user_id: userId,
    title: 'Payment Method Updated',
    message: `Your ${paymentType} ending in ${last4} has been added to your account.`,
    type: 'info',
    action_url: '/account/payment-methods',
    entity_type: 'payment_method'
  });
};

/**
 * Creates a notification for a subscription renewal
 * @param {Object} params - Parameters for the notification
 * @param {Function} createNotification - Function from useNotifications hook
 * @returns {Promise<Object>} - Result of the notification creation
 */
export const createSubscriptionRenewalNotification = async (params, createNotification) => {
  const { userId, subscriptionName, nextBillingDate, subscriptionId } = params;
  
  return await createNotification({
    user_id: userId,
    title: 'Subscription Renewed',
    message: `Your subscription to ${subscriptionName} has been renewed. Next billing date: ${nextBillingDate}.`,
    type: 'success',
    action_url: `/subscriptions/${subscriptionId}`,
    entity_type: 'subscription',
    entity_id: subscriptionId
  });
};

/**
 * Creates a notification for a subscription expiration warning
 * @param {Object} params - Parameters for the notification
 * @param {Function} createNotification - Function from useNotifications hook
 * @returns {Promise<Object>} - Result of the notification creation
 */
export const createSubscriptionExpirationNotification = async (params, createNotification) => {
  const { userId, subscriptionName, expirationDate, subscriptionId } = params;
  
  return await createNotification({
    user_id: userId,
    title: 'Subscription Expiring Soon',
    message: `Your subscription to ${subscriptionName} will expire on ${expirationDate}. Renew now to avoid service interruption.`,
    type: 'warning',
    action_url: `/subscriptions/${subscriptionId}`,
    entity_type: 'subscription',
    entity_id: subscriptionId
  });
};

/**
 * Creates a notification for a payment failure
 * @param {Object} params - Parameters for the notification
 * @param {Function} createNotification - Function from useNotifications hook
 * @returns {Promise<Object>} - Result of the notification creation
 */
export const createPaymentFailureNotification = async (params, createNotification) => {
  const { userId, paymentAmount, invoiceId } = params;
  
  return await createNotification({
    user_id: userId,
    title: 'Payment Failed',
    message: `Your payment of $${paymentAmount} failed to process. Please update your payment information.`,
    type: 'error',
    action_url: `/invoices/${invoiceId}`,
    entity_type: 'invoice',
    entity_id: invoiceId
  });
};

/**
 * Creates a notification for a new message
 * @param {Object} params - Parameters for the notification
 * @param {Function} createNotification - Function from useNotifications hook
 * @returns {Promise<Object>} - Result of the notification creation
 */
export const createNewMessageNotification = async (params, createNotification) => {
  const { userId, senderName, messageId } = params;
  
  return await createNotification({
    user_id: userId,
    title: 'New Message',
    message: `You have a new message from ${senderName}.`,
    type: 'info',
    action_url: `/messages/${messageId}`,
    entity_type: 'message',
    entity_id: messageId
  });
};

/**
 * Creates a notification for a product update
 * @param {Object} params - Parameters for the notification
 * @param {Function} createNotification - Function from useNotifications hook
 * @returns {Promise<Object>} - Result of the notification creation
 */
export const createProductUpdateNotification = async (params, createNotification) => {
  const { userId, productName, productId, version } = params;
  
  return await createNotification({
    user_id: userId,
    title: 'Product Updated',
    message: `${productName} has been updated to version ${version}. Download the latest version now.`,
    type: 'info',
    action_url: `/products/${productId}`,
    entity_type: 'product',
    entity_id: productId
  });
};
