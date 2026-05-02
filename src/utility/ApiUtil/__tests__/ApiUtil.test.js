import ApiUtil from "../ApiUtil"

jest.mock("axios", () => {
    return {
        create: () => {
            return {
                interceptors: {
                    request: { eject: jest.fn(), use: jest.fn() },
                    response: { eject: jest.fn(), use: jest.fn() },
                },
                get: () => {
                    return "getmock"
                },
                post: () => {
                    return "postmock"
                },
                delete: () => {
                    return "deletemock"
                },
                put: () => {
                    return "putmock"
                },
            }
        },
    }
})

describe("ApiUtil tests", () => {
    test("get method", async () => {
        const getMethod = new ApiUtil("https://jsonplaceholder.typicode.com/")
        await expect(getMethod.get("/posts")).resolves.toBe("getmock")
    })
    test("post method", async () => {
        const postMethod = new ApiUtil(
            "https://jsonplaceholder.typicode.com/",
            { accept: "application/json" }
        )
        await expect(postMethod.post("/posts")).resolves.toBe("postmock")
    })
    test("delete method", async () => {
        const deleteMethod = new ApiUtil(
            "https://jsonplaceholder.typicode.com/"
        )
        expect(deleteMethod.delete("/posts")).toBe("deletemock")
    })
    test("put method", async () => {
        const putMethod = new ApiUtil("https://jsonplaceholder.typicode.com/")
        expect(putMethod.put("/posts")).toBe("putmock")
    })
})
