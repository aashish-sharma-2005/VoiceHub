import { useState } from "react";
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    ImagePlus,
    MapPin,
    Send,
    Trash2,
    Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./CreateIssue.css";

function CreateIssue() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        location: "",
    });

    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =========================
    // Handle input
    // =========================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
    };

    // =========================
    // Handle image selection
    // =========================

    const handleImageChange = (e) => {
        const selectedFiles = Array.from(e.target.files);

        if (!selectedFiles.length) {
            return;
        }

        const remainingSlots = 5 - images.length;

        if (remainingSlots <= 0) {
            setError("You can upload a maximum of 5 images.");
            return;
        }

        const filesToAdd = selectedFiles.slice(0, remainingSlots);

        const invalidFiles = filesToAdd.filter(
            (file) =>
                ![
                    "image/jpeg",
                    "image/png",
                    "image/webp",
                ].includes(file.type)
        );

        if (invalidFiles.length > 0) {
            setError(
                "Only JPG, PNG, and WEBP images are allowed."
            );
            return;
        }

        const oversizedFiles = filesToAdd.filter(
            (file) => file.size > 5 * 1024 * 1024
        );

        if (oversizedFiles.length > 0) {
            setError(
                "Each image must be smaller than 5 MB."
            );
            return;
        }

        setImages((prev) => [
            ...prev,
            ...filesToAdd,
        ]);

        const newPreviews = filesToAdd.map((file) =>
            URL.createObjectURL(file)
        );

        setPreviews((prev) => [
            ...prev,
            ...newPreviews,
        ]);

        setError("");

        // Allow selecting the same file again later
        e.target.value = "";
    };

    // =========================
    // Remove image
    // =========================

    const removeImage = (index) => {
        URL.revokeObjectURL(previews[index]);

        setImages((prev) =>
            prev.filter((_, i) => i !== index)
        );

        setPreviews((prev) =>
            prev.filter((_, i) => i !== index)
        );
    };

    // =========================
    // Submit issue
    // =========================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        // Basic validation
        if (
            !formData.title.trim() ||
            !formData.description.trim() ||
            !formData.category ||
            !formData.location.trim()
        ) {
            setError(
                "Please fill in all required fields."
            );
            return;
        }

        // Get saved token
        const token =
            localStorage.getItem("voicehub_token") ||
            sessionStorage.getItem("voicehub_token");

        if (!token) {
            setError(
                "Please login before submitting an issue."
            );

            navigate("/login");
            return;
        }

        try {
            setLoading(true);

            // =========================
            // Create multipart form
            // =========================

            const data = new FormData();

            data.append(
                "title",
                formData.title.trim()
            );

            data.append(
                "description",
                formData.description.trim()
            );

            data.append(
                "category",
                formData.category
            );

            data.append(
                "location",
                formData.location.trim()
            );

            images.forEach((image) => {
                data.append("images", image);
            });

            // =========================
            // API request
            // =========================

            const response = await fetch(
                "http://localhost:3000/api/issues/",
                {
                    method: "POST",

                    headers: {
                        Authorization: `Bearer ${token}`,
                    },

                    body: data,
                }
            );

            const result = await response.json();

            if (!response.ok) {
                setError(
                    result.message ||
                        "Failed to submit issue."
                );
                return;
            }

            setSuccess(
                "Issue submitted successfully. It is now waiting for moderation."
            );

            // Clear form
            setFormData({
                title: "",
                description: "",
                category: "",
                location: "",
            });

            previews.forEach((preview) => {
                URL.revokeObjectURL(preview);
            });

            setImages([]);
            setPreviews([]);

            // Optional redirect after successful submission
            setTimeout(() => {
                navigate("/my-issues");
            }, 1500);
        } catch (error) {
            console.error(
                "Create issue error:",
                error
            );

            setError(
                "Unable to connect to the server."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-issue-page">

            {/* HEADER */}

            <div className="create-issue-header">

                <button
                    type="button"
                    className="back-button"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft size={19} />

                    <span>
                        Back
                    </span>
                </button>

                <div>
                    <h1>
                        Report an Issue
                    </h1>

                    <p>
                        Help your community identify and
                        resolve local problems.
                    </p>
                </div>

            </div>

            {/* MAIN */}

            <div className="create-issue-container">

                <form
                    className="create-issue-card"
                    onSubmit={handleSubmit}
                >

                    {/* FORM HEADING */}

                    <div className="form-section-heading">

                        <div className="section-heading-icon">
                            <AlertCircle size={21} />
                        </div>

                        <div>
                            <h2>
                                Issue Details
                            </h2>

                            <p>
                                Provide clear information about
                                the problem.
                            </p>
                        </div>

                    </div>

                    {/* ERROR */}

                    {error && (
                        <div className="form-alert error-alert">

                            <AlertCircle size={19} />

                            <span>
                                {error}
                            </span>

                        </div>
                    )}

                    {/* SUCCESS */}

                    {success && (
                        <div className="form-alert success-alert">

                            <CheckCircle2 size={19} />

                            <span>
                                {success}
                            </span>

                        </div>
                    )}

                    {/* TITLE */}

                    <div className="field-group">

                        <label htmlFor="title">
                            Issue Title
                            <span>*</span>
                        </label>

                        <input
                            id="title"
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g. Street lights not working in Sector 12"
                            maxLength={120}
                            required
                        />

                        <div className="field-footer">
                            <small>
                                Give your issue a clear and specific title.
                            </small>

                            <span>
                                {formData.title.length}/120
                            </span>
                        </div>

                    </div>

                    {/* CATEGORY */}

                    <div className="field-group">

                        <label htmlFor="category">
                            Category
                            <span>*</span>
                        </label>

                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        >
                            <option value="">
                                Select issue category
                            </option>

                            <option value="Roads & Transit">
                                Roads & Transit
                            </option>

                            <option value="Sanitation & Garbage">
                                Sanitation & Garbage
                            </option>

                            <option value="Environment & Parks">
                                Environment & Parks
                            </option>

                            <option value="Water & Electricity">
                                Water & Electricity
                            </option>

                            <option value="Other">
                                Other
                            </option>
                        </select>

                    </div>

                    {/* LOCATION */}

                    <div className="field-group">

                        <label htmlFor="location">
                            Location
                            <span>*</span>
                        </label>

                        <div className="location-input">

                            <MapPin size={20} />

                            <input
                                id="location"
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="e.g. Main Market, Sector 12"
                                required
                            />

                        </div>

                        <small className="field-help">
                            Enter the area, street, sector, landmark,
                            or other useful location details.
                        </small>

                    </div>

                    {/* DESCRIPTION */}

                    <div className="field-group">

                        <label htmlFor="description">
                            Description
                            <span>*</span>
                        </label>

                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe the issue clearly. Include useful details such as what happened, where it happened, and how it affects the community."
                            maxLength={2000}
                            rows={7}
                            required
                        />

                        <div className="field-footer">
                            <small>
                                Provide enough details to help moderators
                                understand the issue.
                            </small>

                            <span>
                                {formData.description.length}/2000
                            </span>
                        </div>

                    </div>

                    {/* IMAGES */}

                    <div className="field-group">

                        <div className="image-heading">

                            <div>
                                <label>
                                    Photos
                                    <span className="optional">
                                        Optional
                                    </span>
                                </label>

                                <small>
                                    Add up to 5 images. Maximum 5 MB each.
                                </small>
                            </div>

                            <span className="image-count">
                                {images.length}/5
                            </span>

                        </div>

                        {/* IMAGE PREVIEWS */}

                        {previews.length > 0 && (
                            <div className="image-preview-grid">

                                {previews.map(
                                    (preview, index) => (
                                        <div
                                            className="image-preview"
                                            key={preview}
                                        >

                                            <img
                                                src={preview}
                                                alt={`Issue ${index + 1}`}
                                            />

                                            <button
                                                type="button"
                                                className="remove-image"
                                                onClick={() =>
                                                    removeImage(index)
                                                }
                                                aria-label="Remove image"
                                            >
                                                <Trash2 size={17} />
                                            </button>

                                            <span>
                                                {index + 1}
                                            </span>

                                        </div>
                                    )
                                )}

                            </div>
                        )}

                        {/* UPLOAD */}

                        {images.length < 5 && (
                            <label
                                htmlFor="issue-images"
                                className="upload-box"
                            >

                                <div className="upload-icon">
                                    <ImagePlus size={25} />
                                </div>

                                <div>
                                    <strong>
                                        Add photos
                                    </strong>

                                    <p>
                                        JPG, PNG or WEBP
                                    </p>
                                </div>

                                <Upload size={19} />

                            </label>
                        )}

                        <input
                            id="issue-images"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            onChange={handleImageChange}
                            hidden
                        />

                    </div>

                    {/* INFORMATION */}

                    <div className="submission-info">

                        <AlertCircle size={18} />

                        <p>
                            Your issue will be reviewed by a moderator
                            before it becomes publicly visible.
                        </p>

                    </div>

                    {/* ACTIONS */}

                    <div className="form-actions">

                        <button
                            type="button"
                            className="cancel-button"
                            onClick={() => navigate(-1)}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="submit-issue-button"
                            disabled={loading}
                        >

                            {loading ? (
                                <>
                                    <span className="button-spinner"></span>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    Submit Issue
                                </>
                            )}

                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default CreateIssue;