// import React from "react";

// const getFileType = (fileName) => {
//   const ext = fileName.split(".").pop().toLowerCase();
//   if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
//   if (["pdf"].includes(ext)) return "pdf";
//   if (["txt"].includes(ext)) return "txt";
//   if (["doc", "docx"].includes(ext)) return "word";
//   if (["ppt", "pptx"].includes(ext)) return "ppt";
//   return "other";
// };

// const FilePreview = ({ file }) => {
//   if (!file) return null;

//   const fileUrl = `http://localhost:5000/uploads/${file}`;
//   const fileType = getFileType(file);

//   const containerStyle = {
//     // border: "1px solidrgb(82, 222, 234)",
//     borderRadius: "10px",
//     padding: "5px 18px",
//     maxWidth: "380px",
//     // boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
//     margin: "16px 0",
//     fontFamily: "'Inter', sans-serif",
//     backgroundColor: "#5da9bc",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "space-between",
//     transition: "box-shadow 0.3s ease",
//   };

//   const imageStyle = {
//     maxWidth: "100%",
//     borderRadius: "8px",
//     display: "block",
//     margin: "0 auto",
//   };

//   const fileNameStyle = {
//     flex: 1,
//     overflow: "hidden",
//     textOverflow: "ellipsis",
//     whiteSpace: "nowrap",
//     fontSize: "15px",
//     color: "#333",
//   };

//   const downloadIconStyle = {
//     fontSize: "20px",
//     color: "#007bff",
//     cursor: "pointer",
//     textDecoration: "none",
//     padding: "8px",
//     borderRadius: "6px",
//     transition: "background-color 0.2s ease",
//   };

//   const iconHoverStyle = {
//     backgroundColor: "#f0f0f0",
//   };

//   const handleMouseEnter = (e) => {
//     Object.assign(e.target.style, iconHoverStyle);
//   };

//   const handleMouseLeave = (e) => {
//     e.target.style.backgroundColor = "transparent";
//   };

//   if (fileType === "image") {
//     return (
//       <div style={containerStyle}>
//         <img src={fileUrl} alt="Uploaded" style={imageStyle} />
//       </div>
//     );
//   }

//   return (
//     <div style={containerStyle}>
//       <span style={fileNameStyle}>📎 {file}</span>
//       <a
//         href={fileUrl}
//         download
//         style={downloadIconStyle}
//         title="Download"
//         rel="noopener noreferrer"
//         onMouseEnter={handleMouseEnter}
//         onMouseLeave={handleMouseLeave}
//       >
//         📥
//       </a>
//     </div>
//   );
// };

// export default FilePreview;
import React from "react";
import "./FilePreview.css"; // Import CSS

const getFileType = (fileName) => {
  const ext = fileName.split(".").pop().toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
  if (["pdf"].includes(ext)) return "pdf";
  if (["txt"].includes(ext)) return "txt";
  if (["doc", "docx"].includes(ext)) return "word";
  if (["ppt", "pptx"].includes(ext)) return "ppt";
  return "other";
};

const FilePreview = ({ file }) => {
  if (!file) return null;

  const fileUrl = `http://localhost:5000/uploads/${file}`;
  const fileType = getFileType(file);

  if (fileType === "image") {
    return (
      <div className="file-preview-container">
        <img src={fileUrl} alt="Uploaded" className="file-preview-image" />
      </div>
    );
  }

  return (
    <div className="file-preview-container">
      <span className="file-preview-name">📎 {file}</span>
      <a
        href={fileUrl}
        download
        className="file-download-icon"
        title="Download"
        rel="noopener noreferrer"
      >
        📥
      </a>
    </div>
  );
};

export default FilePreview;
