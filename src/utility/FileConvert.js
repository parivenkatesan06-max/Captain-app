import * as XLSX from "xlsx"

/**
 * Convert an Excel file to JSON
 * @param {File} file - The Excel file to be converted
 * @returns {Promise<Array>} - A promise that resolves to a JSON array
 */
const convertExcelToJson = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            const binaryData = e.target.result

            try {
                // Read the Excel file using xlsx library
                const workbook = XLSX.read(binaryData, { type: "binary" })

                // Get the first sheet name and sheet data
                const sheetName = workbook.SheetNames[0]
                const sheet = workbook.Sheets[sheetName]

                // Convert the sheet to JSON
                const jsonData = XLSX.utils.sheet_to_json(sheet)

                resolve(jsonData)
            } catch (error) {
                reject("Error processing the Excel file: " + error.message)
            }
        }

        reader.onerror = (error) => {
            reject("File reader error: " + error.message)
        }

        reader.readAsBinaryString(file)
    })
}

/**
 * Convert JSON data to an Excel file and download it
 * @param {Array} jsonData - The JSON data to be converted to Excel
 * @param {string} fileName - The desired filename for the Excel file
 */
const convertJsonToExcel = (jsonData, fileName) => {
    // Create a worksheet from JSON data
    const worksheet = XLSX.utils.json_to_sheet(jsonData)

    // Create a new workbook
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")

    // Write the workbook to a file
    XLSX.writeFile(workbook, fileName)
}

export { convertExcelToJson, convertJsonToExcel }
