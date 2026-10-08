import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const API_URL = "http://localhost:3000/api/auth";

const getStoredUser = () => {
    try {
        const user =
            localStorage.getItem("voicehub_user") ||
            sessionStorage.getItem("voicehub_user");

        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error("Error reading stored user:", error);
        return null;
    }
};

const getStoredToken = () => {
    return (
        localStorage.getItem("voicehub_token") ||
        sessionStorage.getItem("voicehub_token") ||
        null
    );
};

/*
 * LOGIN
 */
export const loginUser = createAsyncThunk(
    "login/loginUser",
    async (
        { email, password, rememberMe },
        { rejectWithValue }
    ) => {
        try {
            const response = await fetch(
                `${API_URL}/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(
                    data.message ||
                        "Login failed"
                );
            }

            if (!data.success || !data.token || !data.user) {
                return rejectWithValue(
                    "Invalid login response from server."
                );
            }

            /*
             * Clear old authentication data
             */
            localStorage.removeItem("voicehub_token");
            localStorage.removeItem("voicehub_user");

            sessionStorage.removeItem("voicehub_token");
            sessionStorage.removeItem("voicehub_user");

            /*
             * Remember me:
             * localStorage = stays after browser close
             * sessionStorage = removed when browser tab/session ends
             */
            const storage = rememberMe
                ? localStorage
                : sessionStorage;

            storage.setItem(
                "voicehub_token",
                data.token
            );

            storage.setItem(
                "voicehub_user",
                JSON.stringify(data.user)
            );

            return data;
        } catch (error) {
            console.error("Login error:", error);

            return rejectWithValue(
                "Unable to connect to server."
            );
        }
    }
);

/*
 * LOGOUT
 */
export const logout = createAsyncThunk(
    "login/logout",
    async () => {
        localStorage.removeItem("voicehub_token");
        localStorage.removeItem("voicehub_user");

        sessionStorage.removeItem("voicehub_token");
        sessionStorage.removeItem("voicehub_user");

        return true;
    }
);

const initialState = {
    user: getStoredUser(),
    token: getStoredToken(),
    isLogin: Boolean(
        getStoredUser() && getStoredToken()
    ),
    loading: false,
    error: null,
};

const loginSlice = createSlice({
    name: "login",

    initialState,

    reducers: {
        clearLoginError: (state) => {
            state.error = null;
        },

        updateUser: (state, action) => {
            state.user = action.payload;

            const token = state.token;

            if (token) {
                const storage = localStorage.getItem(
                    "voicehub_token"
                )
                    ? localStorage
                    : sessionStorage;

                storage.setItem(
                    "voicehub_user",
                    JSON.stringify(action.payload)
                );
            }
        },
    },

    extraReducers: (builder) => {
        builder

            /*
             * LOGIN PENDING
             */
            .addCase(
                loginUser.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )

            /*
             * LOGIN SUCCESS
             */
            .addCase(
                loginUser.fulfilled,
                (state, action) => {
                    state.loading = false;
                    state.isLogin = true;
                    state.token =
                        action.payload.token;
                    state.user =
                        action.payload.user;
                    state.error = null;
                }
            )

            /*
             * LOGIN FAILED
             */
            .addCase(
                loginUser.rejected,
                (state, action) => {
                    state.loading = false;
                    state.isLogin = false;
                    state.token = null;
                    state.user = null;
                    state.error =
                        action.payload ||
                        "Login failed";
                }
            )

            /*
             * LOGOUT
             */
            .addCase(
                logout.fulfilled,
                (state) => {
                    state.loading = false;
                    state.isLogin = false;
                    state.token = null;
                    state.user = null;
                    state.error = null;
                }
            );
    },
});

export const {
    clearLoginError,
    updateUser,
} = loginSlice.actions;

export default loginSlice.reducer;