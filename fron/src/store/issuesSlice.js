import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getPublicIssues, voteIssue } from "../services/issueService";

/*
 * Get all public issues
 */
export const fetchPublicIssues = createAsyncThunk(
    "issues/fetchPublicIssues",
    async (_, { rejectWithValue }) => {
        try {
            const response = await getPublicIssues();

            const data =
                response?.issues ||
                response?.data?.issues ||
                response?.data ||
                response ||
                [];

            if (!Array.isArray(data)) {
                return rejectWithValue(
                    "Invalid issues data received from server."
                );
            }

            return {
                issues: data,
                total:
                    response?.total ??
                    data.length,
            };
        } catch (error) {
            return rejectWithValue(
                error?.message ||
                "Failed to fetch public issues."
            );
        }
    }
);

/*
 * Vote on an issue
 */
export const submitIssueVote = createAsyncThunk(
    "issues/submitIssueVote",
    async (
        { issueId, vote },
        { rejectWithValue }
    ) => {
        try {
            const response = await voteIssue(
                issueId,
                vote
            );

            return {
                issueId,
                vote,
                response,
            };
        } catch (error) {
            return rejectWithValue({
                issueId,
                message:
                    error?.message ||
                    "Failed to submit vote.",
            });
        }
    }
);

const initialState = {
    issues: [],
    total: 0,

    loading: false,
    error: null,

    votingIds: [],
};

const issuesSlice = createSlice({
    name: "issues",

    initialState,

    reducers: {
        clearIssuesError: (state) => {
            state.error = null;
        },

        clearIssues: (state) => {
            state.issues = [];
            state.total = 0;
            state.error = null;
        },

        /*
         * Update one issue inside Redux
         */
        updateIssue: (state, action) => {
            const updatedIssue = action.payload;

            const index = state.issues.findIndex(
                (issue) =>
                    issue._id === updatedIssue._id
            );

            if (index !== -1) {
                state.issues[index] = {
                    ...state.issues[index],
                    ...updatedIssue,
                };
            }
        },
    },

    extraReducers: (builder) => {
        builder

            /*
             * FETCH ISSUES
             */
            .addCase(
                fetchPublicIssues.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )

            .addCase(
                fetchPublicIssues.fulfilled,
                (state, action) => {
                    state.loading = false;

                    state.issues =
                        action.payload.issues;

                    state.total =
                        action.payload.total;

                    state.error = null;
                }
            )

            .addCase(
                fetchPublicIssues.rejected,
                (state, action) => {
                    state.loading = false;

                    state.error =
                        action.payload ||
                        "Failed to fetch issues.";
                }
            )

            /*
             * VOTE START
             */
            .addCase(
                submitIssueVote.pending,
                (state, action) => {
                    const issueId =
                        action.meta.arg.issueId;

                    if (
                        !state.votingIds.includes(
                            issueId
                        )
                    ) {
                        state.votingIds.push(
                            issueId
                        );
                    }
                }
            )

            /*
             * VOTE SUCCESS
             */
            .addCase(
                submitIssueVote.fulfilled,
                (state, action) => {
                    const {
                        issueId,
                        response,
                    } = action.payload;

                    state.votingIds =
                        state.votingIds.filter(
                            (id) =>
                                id !== issueId
                        );

                    const updatedIssue =
                        response?.issue;

                    if (!updatedIssue) {
                        return;
                    }

                    const index =
                        state.issues.findIndex(
                            (issue) =>
                                issue._id ===
                                issueId
                        );

                    if (index !== -1) {
                        state.issues[index] = {
                            ...state.issues[index],

                            upvotes:
                                updatedIssue.upvotes,

                            downvotes:
                                updatedIssue.downvotes,

                            userVote:
                                updatedIssue.userVote,
                        };
                    }
                }
            )

            /*
             * VOTE FAILED
             */
            .addCase(
                submitIssueVote.rejected,
                (state, action) => {
                    const issueId =
                        action.payload?.issueId ||
                        action.meta.arg.issueId;

                    state.votingIds =
                        state.votingIds.filter(
                            (id) =>
                                id !== issueId
                        );
                }
            );
    },
});

export const {
    clearIssuesError,
    clearIssues,
    updateIssue,
} = issuesSlice.actions;

export default issuesSlice.reducer;