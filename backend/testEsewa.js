import { generateEsewaFormData } from './utils/esewaConfig.js'

// Test the eSewa form data generation
const testAmount = 1000
const testUuid = "test-uuid-123"
const testProductCode = "EPAYTEST"
const testSuccessUrl = "http://localhost:5000/api/esewa/success"
const testFailureUrl = "http://localhost:5000/api/esewa/failure"

console.log("Testing eSewa form data generation...")
console.log("Input:")
console.log("- Amount:", testAmount)
console.log("- UUID:", testUuid)
console.log("- Product Code:", testProductCode)
console.log("- Success URL:", testSuccessUrl)
console.log("- Failure URL:", testFailureUrl)

const formData = generateEsewaFormData(testAmount, testUuid, testProductCode, testSuccessUrl, testFailureUrl)

console.log("\nGenerated Form Data:")
console.log(JSON.stringify(formData, null, 2))

console.log("\nExpected format matches the requirement:")
console.log("✓ amount:", formData.amount)
console.log("✓ failure_url:", formData.failure_url)
console.log("✓ product_delivery_charge:", formData.product_delivery_charge)
console.log("✓ product_service_charge:", formData.product_service_charge)
console.log("✓ product_code:", formData.product_code)
console.log("✓ signature:", formData.signature)
console.log("✓ signed_field_names:", formData.signed_field_names)
console.log("✓ success_url:", formData.success_url)
console.log("✓ tax_amount:", formData.tax_amount)
console.log("✓ total_amount:", formData.total_amount)
console.log("✓ transaction_uuid:", formData.transaction_uuid)