// eSewa Configuration
import crypto from 'crypto'

export const esewaConfig = {
  // eSewa test environment URLs
  paymentUrl: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
  verificationUrl: "https://uat.esewa.com.np/epay/transrec",
  
  // Test merchant credentials for eSewa test environment
  merchantId: "EPAYTEST",
  secretKey: "8gBm/:&EnhH.1/q",
  
  // Default URLs (will be overridden by environment variables)
  successUrl: "https://developer.esewa.com.np/success",
  failureUrl: "https://developer.esewa.com.np/failure",
}

// Generate eSewa payment signature
export const generateEsewaSignature = (totalAmount, transactionUuid, productCode) => {
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`
  
  const hash = crypto.createHmac('sha256', esewaConfig.secretKey)
    .update(message)
    .digest('base64')
  
  return hash
}

// Verify eSewa payment signature
export const verifyEsewaSignature = (totalAmount, transactionUuid, productCode, receivedSignature) => {
  const expectedSignature = generateEsewaSignature(totalAmount, transactionUuid, productCode)
  return expectedSignature === receivedSignature
}

// Generate eSewa payment form data
export const generateEsewaFormData = (amount, transactionUuid, productCode, successUrl, failureUrl) => {
  const taxAmount = Math.round(amount * 0.1) // 10% tax
  const totalAmount = amount + taxAmount
  
  const signature = generateEsewaSignature(totalAmount, transactionUuid, productCode)
  
  return {
    amount: amount.toString(),
    failure_url: failureUrl,
    product_delivery_charge: "0",
    product_service_charge: "0",
    product_code: productCode,
    signature: signature,
    signed_field_names: "total_amount,transaction_uuid,product_code",
    success_url: successUrl,
    tax_amount: taxAmount.toString(),
    total_amount: totalAmount.toString(),
    transaction_uuid: transactionUuid
  }
}