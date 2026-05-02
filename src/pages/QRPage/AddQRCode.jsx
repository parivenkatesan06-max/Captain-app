import React, { useState } from "react";
import { Form, Select } from "antd";
import { useMutation, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import ApiUtil from "../../utility/ApiUtil";
import endPoints from "../../utility/EndPoints";
import qrLabels from "./QRPage.labels.json";
import Button from "../../components/Button/Button";
import styles from "./QRPage.module.scss";
import { PATH } from "../../utility/constants";
import { getUserInfo } from "../../utility/userInfo";

const { Option } = Select;

// eslint-disable-next-line complexity
const AddQRCode = ({ selectedEntityConfig, form, setQrList, setShowToast, setToastMessage }) => {
    const [isFormValid, setIsFormValid] = useState(false);
    const [selectedEntityCode, setSelectedEntityCode] = useState(null);
    const qrApiUtil = new ApiUtil();
    const userInfo = getUserInfo();

    // Fetch entity details
    const fetchEntityDetails = () =>
        qrApiUtil.get(`${endPoints.clientEntity}?clientCode=${userInfo?.clientInfo?.clientCode}`);

    const { data: entityData, isLoading: entityLoading } = useQuery({
        queryKey: ["fetchEntityDetails"],
        queryFn: fetchEntityDetails,
    });

    // Fetch seat details with infinite scroll
    const fetchSeatDetails = ({ pageParam = 1 }) => {
        if (!selectedEntityCode) return Promise.resolve({ data: [] });
        const itemsPerPage = 10;
        return qrApiUtil.get(
            `${endPoints.seat}?entityCode=${selectedEntityCode}&page=${pageParam}&itemsPerPage=${itemsPerPage}`
        );
    };

    const { 
        data: seatData, 
        fetchNextPage, 
        hasNextPage, 
        isFetching: seatsFetching 
    } = useInfiniteQuery({
        queryKey: ["fetchSeatDetails", selectedEntityCode],
        queryFn: fetchSeatDetails,
        enabled: !!selectedEntityCode,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage?.data?.data?.length < 10 ? undefined : allPages.length + 1;
        },
    });

    const defaultEntityCode = entityData?.data?.data?.length > 0
        ? entityData.data.data[0].entityCode
        : selectedEntityConfig?.inputs?.entityCode?.defaultValue || "";

    // Mutation for generating QR code
    const triggerGenerateQRCode = useMutation({
        mutationFn: (data) => qrApiUtil.post(endPoints.qrCode, data),
        onSuccess: (data) => {
            const newGeneratedQR = data?.data?.data;
            // Ensure the QR code is properly formatted as a data URL
            if (newGeneratedQR?.qrcode && !newGeneratedQR.qrcode.startsWith("data:")) {
                newGeneratedQR.qrcode = `data:image/png;base64,${newGeneratedQR.qrcode}`;
            }
            setShowToast(true);
            setToastMessage(qrLabels?.successMessage);
            setTimeout(() => {
                setShowToast(false);
                setToastMessage(" ");
                form.resetFields();
            }, 3000);
            setQrList((prevList) => [...prevList, newGeneratedQR]);
        },
        onError: (error) => {
            const errorMessage = error?.response?.data?.errors[0].message
                ? qrLabels?.qrFailureError.replace("{message}", error?.response?.data?.errors[0].message)
                : qrLabels.updateFailed;
            setShowToast(true);
            setToastMessage(errorMessage);
        },
    });

    // Handle form change to validate fields and reset seats
    const handleFormChange = (changedValues, allValues) => {
        const allValuesArray = Object.values(allValues);
        const isValid = allValuesArray.every((value) => {
            return typeof value === "string"
                ? value.trim() !== ""
                : value !== undefined && value !== null;
        });
        setIsFormValid(isValid);

        if (changedValues.entityCode) {
            setSelectedEntityCode(changedValues.entityCode);
            form.setFieldsValue({ seatCode: "" }); // Reset seatCode when entity changes
        }
    };

    // Handle scroll event for infinite loading
    const handleScroll = (e) => {
        const target = e.target;
        if (
            !seatsFetching &&
            hasNextPage &&
            target.scrollTop + target.clientHeight >= target.scrollHeight - 10
        ) {
            fetchNextPage();
        }
    };

    // Handle QR code generation
    const handleGenerateQR = () => {
        const qrData = form.getFieldsValue();
        const { seatCode } = qrData;
        const dataWithRedirect = {
            ...qrData,
            clientCode: userInfo?.clientInfo?.clientCode,
            seatCode: seatCode,
            redirectUrl: `${window.location.origin}/${PATH.CONSUMER}/${PATH.HOMESCREEN}`,
        };
        triggerGenerateQRCode.mutate(dataWithRedirect);
        setIsFormValid(false);
    };

    // Flatten seat data from all pages
    const allSeats = seatData?.pages.flatMap((page) => page?.data?.data) || [];

    return (
        <div className={styles.formStyle}>
            <Form
                layout="vertical"
                form={form}
                onValuesChange={handleFormChange}
                initialValues={{
                    clientCode: userInfo?.clientInfo?.clientCode,
                    entityCode: defaultEntityCode,
                    seatCode: "",
                }}
            >
                <Form.Item
                    name="entityCode"
                    label="Screen Name"
                    rules={[{ required: true, message: "Please select a Screen Name" }]}
                >
                    <Select
                        placeholder="Select a Screen Name"
                        allowClear
                        style={{ width: "100%" }}
                        loading={entityLoading}
                    >
                        {entityData?.data?.data?.length > 0 ? (
                            entityData.data.data.map((entity) => (
                                <Option key={entity.entityCode} value={entity.entityCode}>
                                    {entity.entityName}
                                </Option>
                            ))
                        ) : (
                            <Option disabled value="">
                                {entityLoading ? "Select a Screen Name" : "No entities available"}
                            </Option>
                        )}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="seatCode"
                    label="Seat Number"
                    rules={[{ required: true, message: "Please select a seat number" }]}
                >
                    <Select
                        placeholder="Select a seat number"
                        allowClear
                        style={{ width: "60%" }}
                        disabled={!selectedEntityCode}
                        loading={seatsFetching}
                        onPopupScroll={handleScroll}
                    >
                        {allSeats.length > 0 ? (
                            allSeats.map((seat) => (
                                <Option key={seat.seatCode} value={seat.seatCode}>
                                    {seat.seatCode.slice(-2)}
                                </Option>
                            ))
                        ) : (
                            <Option disabled value="">
                                {seatsFetching
                                    ? "Select a seat number"
                                    : selectedEntityCode
                                        ? "No seats available"
                                        : "Select a Screen first"}
                            </Option>
                        )}
                    </Select>
                </Form.Item>
            </Form>

            <Button
                type="primary"
                onClick={handleGenerateQR}
                disabled={!isFormValid}
                label={qrLabels?.generateButtonLabel}
            />
        </div>
    );
};

export default AddQRCode;