import crypto from 'crypto';

// eSewa test credentials
const secretKey = "8gBm/:&EnhH.1/q";

// Test case from eSewa documentation
const testCases = [
  {
    name: "eSewa Example",
    totalAmount: 110,
    transactionUuid: "241028",
    productCode: "EPAYTEST",
    expectedSignature: "i94zsd3oXF6ZsSr/kGqT4sSzYQzjj1W/waxjWyRwaME="
  },
  {
    name: "Documentation Example",
    totalAmount: 100,
    transactionUuid: "11-201-13",
    productCode: "EPAYTEST",
    expectedSignature: "Result4Ov7pCI1zIOdwtV2BRMUNjz1upIlT/COTxfLhWvVurE="
  }
];

function generateSignature(totalAmount, transactionUuid, productCode) {
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  
  console.log('\n=== Generating Signature ===');
  console.log('Message:', message);
  console.log('Secret Key:', secretKey);
  
  const hash = crypto.createHmac('sha256', secretKey)
    .update(message)
    .digest('base64');
  
  console.log('Generated Signature:', hash);
  
  return hash;
}

console.log('Testing eSewa Signature Generation\n');
console.log('='.repeat(60));

testCases.forEach((testCase, index) => {
  console.log(`\nTest Case ${index + 1}: ${testCase.name}`);
  console.log('-'.repeat(60));
  
  const signature = generateSignature(
    testCase.totalAmount,
    testCase.transactionUuid,
    testCase.productCode
  );
  
  const matches = signature === testCase.expectedSignature;
  
  console.log('\nExpected:', testCase.expectedSignature);
  console.log('Got:     ', signature);
  console.log('Match:   ', matches ? '✅ YES' : '❌ NO');
  
  if (!matches) {
    console.log('\n⚠️  Signature mismatch! Check:');
    console.log('   1. Secret key is correct');
    console.log('   2. Message format is exact');
    console.log('   3. No extra spaces or characters');
  }
});

console.log('\n' + '='.repeat(60));
console.log('\nTest your own values:');
console.log('-'.repeat(60));

// Test with custom values
const customAmount = 1100; // 1000 + 100 tax
const customUuid = crypto.randomUUID();
const customProductCode = "EPAYTEST";

console.log('\nCustom Test:');
console.log('Amount:', customAmount);
console.log('UUID:', customUuid);
console.log('Product Code:', customProductCode);

const customSignature = generateSignature(customAmount, customUuid, customProductCode);

console.log('\nGenerated form data:');
console.log(JSON.stringify({
  amount: "1000",
  tax_amount: "100",
  total_amount: customAmount.toString(),
  transaction_uuid: customUuid,
  product_code: customProductCode,
  product_service_charge: "0",
  product_delivery_charge: "0",
  success_url: "http://localhost:5000/api/esewa/success",
  failure_url: "http://localhost:5000/api/esewa/failure",
  signed_field_names: "total_amount,transaction_uuid,product_code",
  signature: customSignature
}, null, 2));

console.log('\n' + '='.repeat(60));
