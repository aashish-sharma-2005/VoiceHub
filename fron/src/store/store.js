import { configureStore } from "@reduxjs/toolkit";

import loginReducer from "./loginSlice";
import issuesReducer from "./issuesSlice";

const store = configureStore({
    reducer: {
        login: loginReducer,
        issues: issuesReducer,
    },
});

export default store;