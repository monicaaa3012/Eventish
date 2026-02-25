// eSewa Configuration
import crypto from 'crypto'

export const esewaConfig = {
  // eSewa test environment URLs
  paymentUrl: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
  verificationUrl: "https://uat.esewa.com.np/api/epay/transaction/status/",
  
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
  
  console.log('=== Generating eSewa Signature ===')
  console.log('Message:', message)
  console.log('Secret Key:', esewaConfig.secretKey)
  
  const hash = crypto.createHmac('sha256', esewaConfig.secretKey)
    .update(message)
    .digest('base64')
  
  console.log('Generated Signature:', hash)
  console.log('==================================')
  
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
  
  console.log('=== Generating eSewa Form Data ===')
  console.log('Amount:', amount)
  console.log('Tax Amount:', taxAmount)
  console.log('Total Amount:', totalAmount)
  console.log('Transaction UUID:', transactionUuid)
  console.log('Product Code:', productCode)
  console.log('Success URL:', successUrl)
  console.log('Failure URL:', failureUrl)
  
  const signature = generateEsewaSignature(totalAmount, transactionUuid, productCode)
  
  const formData = {
    amount: amount.toString(),
    tax_amount: taxAmount.toString(),
    total_amount: totalAmount.toString(),
    transaction_uuid: transactionUuid,
    product_code: productCode,
    product_service_charge: "0",
    product_delivery_charge: "0",
    success_url: successUrl,
    failure_url: failureUrl,
    signed_field_names: "total_amount,transaction_uuid,product_code",
    signature: signature
  }
  
  console.log('Generated Form Data:', formData)
  console.log('===================================')
  
  return formData
}

// Check transaction status with eSewa API
export const checkTransactionStatus = async (productCode, transactionUuid, totalAmount) => {
  try {
    const url = `${esewaConfig.verificationUrl}?product_code=${productCode}&total_amount=${totalAmount}&transaction_uuid=${transactionUuid}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`eSewa API returned status ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error checking transaction status:', error)
    throw error
  }
}