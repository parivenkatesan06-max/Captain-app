import React, { useState } from "react"
import { Typography, Modal, Flex } from "antd"
import Button from "../../components/Button/Button"
import styles from "./QRList.module.scss"
import qrPagelabels from "./QRPage.labels.json"
import { jsPDF } from "jspdf"
import stylesVariable from "../../styles/base/_stylesVariable.module.scss"
import html2canvas from "html2canvas"

const { Title } = Typography

const QRList = ({ qrList, onDeleteClick, labels, userInfo, clientInfo }) => {
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [previewData, setPreviewData] = useState(null)

    // Handle Preview and Open Modal
    const handlePreview = (list) => {
        setPreviewData(list)
        setIsModalVisible(true)
    }

    // Handle Download After Preview
    const handleDownload = (qrcode, clientName, seatCode) => {
        const doc = new jsPDF();
        const margin = 10;
        const printableContent = document.getElementById("printable");
    
        if (printableContent) {
            // Convert the content (including SVGs) to a base64 image using html2canvas
            html2canvas(printableContent, {
                scale: 1, 
                logging: false,
                useCORS: true,
            }).then((canvas) => {
                const imgData = canvas.toDataURL("image/png");
    
                // Get the full width and height of the page
                const pageWidth = doc.internal.pageSize.width;
                const pageHeight = doc.internal.pageSize.height;
    
                // Set the image size to 75% of the page's width and 50% of the page's height, with margins
                const imgWidth = (pageWidth * 0.75) - 2 * margin; // 75% of the page width minus margins
                const imgHeight = (pageHeight * 0.5) - 2 * margin; // 50% of the page height minus margins
    
                // Calculate the position to center the image
                const centerX = (pageWidth - imgWidth) / 2; // Center horizontally
                const centerY = (pageHeight - imgHeight) / 2; // Center vertically
    
                // Clear any previous content and add the image to the PDF
                doc.addImage(imgData, "PNG", centerX, centerY, imgWidth, imgHeight);
                doc.save(`${seatCode}-QRCode.pdf`);
    
                setIsModalVisible(false); // Close the modal after downloading
            });
        }
    }
    
    return (
        <Flex gap={16} className={styles.qrGridContainer}>
            {qrList?.length > 0 &&
                qrList.map((list, index) => {
                    return (
                        <div key={index} className={styles.listQRInfo}>
                            <div className={styles.hotelInfo}>
                                <Title level={5}>{labels?.qrCodeTitle}</Title>
                            </div>
                            <img
                                src={list.qrcode}
                                alt="QR code"
                                className={styles.qrImage}
                                id="qr-code"
                            />
                            <div className={styles.tableInfo}>
                                <Title level={5}>{list.seatCode}</Title>
                            </div>
                            <div className={styles.modal} id="notPrintable">
                                <div className={styles.editDownload}>
                                    <Button
                                        type="primary"
                                        label={qrPagelabels?.DeleteButtonLabel}
                                        onClick={() => onDeleteClick(list)}
                                        style={{ minWidth: stylesVariable.qrListMinWidth }}                                    
                                    />
                                    <Button
                                        type="primary"
                                        label={qrPagelabels?.downloadButtonLabel}
                                        style={{ minWidth: stylesVariable.qrListMinWidth }}                                        
                                        onClick={() => handlePreview(list)}
                                    />
                                </div>
                            </div>
                        </div>
                    )
                })}

            {/* Preview Modal */}
            {previewData && (
                <Modal
                    title={qrPagelabels?.previewTitle}
                    open={isModalVisible}
                    onCancel={() => setIsModalVisible(false)}
                    footer={[
                        <div className={styles.modalFooter} key="footer">
                            <Button
                                key="download"
                                type="primary"
                                label={qrPagelabels?.downloadButtonLabel}
                                onClick={() =>
                                    handleDownload(
                                        previewData.qrcode,
                                        userInfo.clientName,
                                        previewData.seatCode
                                    )
                                }
                            />
                            <Button
                                key="cancel"
                                label={qrPagelabels?.cancelButtonLabel}
                                onClick={() => setIsModalVisible(false)}
                            />
                        </div>
                    ]}
                >
                    <Flex vertical align="center" className={styles.previewContent} id="printable">
                        <div
                            className={styles.companyDetails}
                        >
                            <img src={clientInfo?.logo_url} alt="logo" className={styles.logoImage} />
                            <div className={styles.address}>
                                {clientInfo?.address}
                            </div>
                            <div className={styles.contactInfo}>
                                {clientInfo?.phone_no} | {clientInfo?.email}
                            </div>
                        </div>
                        <img
                            src={previewData.qrcode}
                            alt="QR code"
                            className={styles.qrImage}
                        />
                        <div className={styles.tableInfo}>
                            <Title level={5}>{previewData.seatCode}</Title>
                        </div>
                    </Flex>
                </Modal>
            )}
        </Flex>
    )
}

export default QRList
