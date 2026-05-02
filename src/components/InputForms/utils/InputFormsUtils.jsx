import React from "react"
import { Flex, Form, Input } from "antd"
import { InputNames } from "../InputForms"
import styles from "../inputForms.module.scss"
import { Link } from "react-router-dom"

const renderFormItems = (
    inputConfigs,
    form,
    handleConfirmPasswordChange,
    config,
    checked,
    forgotpassword
) => {
    return inputConfigs.map((input) => {
        // Define the extra content for the "Forgot Password?" link
        const extraContent =
            forgotpassword && input.name === InputNames.PASSWORD ? (
                <div style={{ textAlign: "right" }}>
                    <Link to="/forgot-password" className={styles.linkTab}>
                        Forgot Password?
                    </Link>
                </div>
            ) : null;

        return (
            <Form.Item
                key={input.id}
                name={input.name}
                label={input.label}
                required={false}
                className={styles.InputForms}
                rules={generateRules(input, form, config, checked)}
                extra={extraContent}
            >
                {input.name === InputNames.PASSWORD ||
            input.name === InputNames.CONFIRM_PASSWORD || input.name === InputNames.OLD_PASSWORD ? (
                        <Flex vertical>
                            <Input.Password
                                placeholder={input.placeholder}
                                onChange={handleConfirmPasswordChange}
                                className={styles.customInput}
                                onPaste={(e) => e.preventDefault()}
                                onCopy={(e) => e.preventDefault()}
                                style={{ flex: 1 }}
                            />
                        </Flex>
                    ) : (
                        <Input placeholder={input.placeholder} />
                    )}
            </Form.Item>
        )
    })
}

// Function to generate validation rules (unchanged)
const generateRules = (input, form, config, checked) => {
    const rules = []

    if (checked ? checked : input?.required) {
        rules.push({
            required: true,
            message: input.validationMessages?.required,
        })
    }

    if (input.inputConfig?.regexp) {
        rules.push({
            pattern: new RegExp(input?.inputConfig?.regexp),
            message: input.validationMessages.pattern,
        })
    }

    const minLengthRule = getMinLengthRule(input, form)
    if (minLengthRule) {
        rules.push(minLengthRule)
    }

    return rules
}

// getMinLengthRule function (unchanged)
const getMinLengthRule = (input, form) => {
    if (!input.inputConfig?.minLength) return null
    return {
        validator: async (_, value) => {
            const currentPassword = form.getFieldValue(InputNames.PASSWORD)
            if (
                input.name === InputNames.CONFIRM_PASSWORD &&
                value !== currentPassword
            ) {
                throw new Error(input.validationMessages.mismatch)
            }
            if (value && value.length < input.inputConfig.minLength) {
                throw new Error(
                    `Minimum length is ${input.inputConfig.minLength} characters`
                )
            }
        },
    }
}

export { renderFormItems }