import React, { forwardRef, useImperativeHandle, useState } from "react"
import { Checkbox, ConfigProvider, Form } from "antd"
import designPatterns from "../../styles/base/_variables.module.scss"
import { renderFormItems } from "./utils/InputFormsUtils"
import styles from "./inputForms.module.scss"
import stylesVariable from "../../styles/base/_stylesVariable.module.scss"

// Define an enum for input names to avoid magic strings
export const InputNames = {
    PASSWORD: "password",
    CONFIRM_PASSWORD: "confirmPassword",
    OLD_PASSWORD:"oldPassword"
}

const InputForms = forwardRef(
    ({ config, onValuesChange, onCheckboxChange, initialValues, forgotpassword }, ref) => {
        const [form] = Form.useForm()
        const [checked, setChecked] = useState(false)

        const handleConfirmPasswordChange = () => {
            const password = form.getFieldValue(InputNames.PASSWORD)
            const confirmPassword = form.getFieldValue(
                InputNames.CONFIRM_PASSWORD
            )

            if (confirmPassword) {
                if (confirmPassword !== password) {
                    form.setFields([
                        {
                            name: InputNames.CONFIRM_PASSWORD,
                            errors: [
                                config.inputs[InputNames.CONFIRM_PASSWORD]
                                    .validationMessages.mismatch,
                            ],
                        },
                    ])
                } else {
                    form.setFields([
                        { name: InputNames.CONFIRM_PASSWORD, errors: [] },
                    ])
                }
            } else {
                form.setFields([
                    { name: InputNames.CONFIRM_PASSWORD, errors: [] },
                ])
            }
        }

        const validateAndCheck = async () => {
            try {
                const values = await form?.validateFields()
                return values
            } catch (errorInfo) {
                console.log("Failed:", errorInfo)
                return null
            }
        }

        // Expose both validateAndCheck and resetFields functions to the parent component
        useImperativeHandle(ref, () => ({
            validateAndCheck,
            resetFields: () => form.resetFields(),
            setFieldsValue: (value) => form.setFieldsValue(value),
            getFieldsValue: () => form.getFieldsValue()
        }))

        const handleFormChange = (_, allValues) => {
            if (onValuesChange) {
                onValuesChange(allValues);
            }
        };

        const inputConfigs = Object.values(config.inputs)

        const CheckBox = () => {
            const onCheckboxChangeInternal = (e) => {
                setChecked(e.target.checked)
                if (onCheckboxChange) {
                    onCheckboxChange(e.target.checked)
                }
            }
            return (
                <ConfigProvider
                    theme={{
                        cssVar: true,
                        token: {
                            colorBorder: designPatterns.buttonPrimary,
                            colorBorderChecked: designPatterns.buttonPrimary,
                            colorPrimary: designPatterns.buttonPrimary,
                            colorText: designPatterns.textPrimary,
                        },
                    }}
                >
                    {config?.checkboxText && (
                        <Checkbox
                            checked={checked}
                            onChange={onCheckboxChangeInternal}
                            className={styles.checkboxText}
                        >
                            <span>
                                {config?.checkboxText?.beforeText}
                                <a
                                    href="https://www.trinogenz.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        color: designPatterns.buttonPrimary,
                                    }}
                                >
                                    {config?.checkboxText?.hrefText}
                                </a>
                            </span>
                        </Checkbox>
                    )}
                </ConfigProvider>
            )
        }

        return (
            <ConfigProvider
                theme={{
                    cssVar: true,
                    token: {
                        colorBorder: designPatterns.bgPrimary,
                        colorTextPlaceholder:
                            designPatterns.placeholderTextPrimary,
                        colorText: designPatterns.textPrimary,
                        colorPrimary: designPatterns.bgPrimary,
                    },
                }}
            >
                <Form 
                    form={form} 
                    name="dynamic_rule" 
                    layout="vertical" 
                    initialValues={initialValues} 
                    onValuesChange={handleFormChange}
                    style={{width:stylesVariable.widthCentPercent}} 
                >
                    {renderFormItems(
                        inputConfigs,
                        form,
                        handleConfirmPasswordChange,
                        config,
                        checked,
                        forgotpassword
                    )}
                    {CheckBox()}
                </Form>
            </ConfigProvider>
        )
    }
)

InputForms.displayName = "TextField"
export default InputForms
