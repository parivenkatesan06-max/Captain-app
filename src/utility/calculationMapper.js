const calculationConfig = {
    India: {
        cgstRate: 0.09,
        sgstRate: 0.09,
    },
};
  
const calculateTax = (subtotal, countryCode) => {
    const countryConfig = calculationConfig[countryCode];
  
    if (!countryConfig) {
        return {
            cgst: 0,
            sgst: 0,
            grandTotal: subtotal,
        };
    }
  
    const cgst = subtotal * countryConfig.cgstRate;
    const sgst = subtotal * countryConfig.sgstRate;
    const grandTotal = subtotal + cgst + sgst;
  
    return {
        cgst,
        sgst,
        grandTotal,
    };
};
  
export { calculateTax };
  