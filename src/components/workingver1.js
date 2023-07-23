import React, { useState } from 'react';
import './css/landing.css';

function Landing() {
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');
    const [calculateAspect, setCalculateAspect] = useState(true);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [originalAspectRatio, setOriginalAspectRatio] = useState(1);
    const [imageUploaded, setImageUploaded] = useState(false);

    const handleImageUpload = (event) => {
        const fileInput = event.target;
        const files = fileInput.files;

        if (!files || files.length === 0) {
            setImageUploaded(false);
            return;
        }

        setImageUploaded(true);

        // Convert files to an array and store in state
        const filesArray = Array.from(files);
        setUploadedFiles(filesArray);

        // Handle each file in the files array
        for (let i = 0; i < filesArray.length; i++) { // Use filesArray instead of files
            const file = filesArray[i]; // Use filesArray instead of files
            const reader = new FileReader();

            reader.onload = function (event) {
                const img = new Image();
                img.onload = function () {
                    // Check the aspect ratio and set the initial width and height accordingly
                    const originalAspectRatio = img.width / img.height;
                    setOriginalAspectRatio(originalAspectRatio);

                    if (calculateAspect) {
                        setWidth(img.width);
                        setHeight(img.height);
                    }
                };
                img.src = event.target.result;
            };

            reader.readAsDataURL(file);
        }
    };

    const handleResize = () => {
        const widthValue = parseInt(width, 10);
        const heightValue = parseInt(height, 10);

        if (isNaN(widthValue) || isNaN(heightValue)) {
            alert('Please enter valid width and height values.');
            return;
        }

        if (uploadedFiles.length === 0) {
            alert('Please upload an image.');
            return;
        }

        // Handle each file in the uploadedFiles array
        for (let i = 0; i < uploadedFiles.length; i++) {
            const file = uploadedFiles[i];
            const reader = new FileReader();

            reader.onload = function (event) {
                const img = new Image();
                img.onload = function () {
                    let resizedWidth = widthValue;
                    let resizedHeight = heightValue;

                    if (calculateAspect) {
                        // Calculate the aspect ratio
                        const aspectRatio = img.width / img.height;
                        if (widthValue && !heightValue) {
                            resizedHeight = Math.round(widthValue / aspectRatio);
                        } else if (!widthValue && heightValue) {
                            resizedWidth = Math.round(heightValue * aspectRatio);
                        }
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = resizedWidth;
                    canvas.height = resizedHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, resizedWidth, resizedHeight);
                    const resizedImageURL = canvas.toDataURL('image/jpeg', 1.0);

                    // Call the download function with the resizedImageURL
                    downloadResizedImage(resizedImageURL, i);
                };

                img.src = event.target.result;
            };

            reader.readAsDataURL(file);
        }
    };

    const handleWidthChange = (event) => {
        const widthValue = parseInt(event.target.value, 10);
        if (!isNaN(widthValue) && widthValue > 0) {
            setWidth(widthValue);

            if (calculateAspect) {
                const aspectRatio = height ? height / widthValue : 1;
                // Calculate the perfect height based on the original aspect ratio
                const perfectHeight = Math.round(widthValue / originalAspectRatio);
                setHeight(perfectHeight);
            }
        }
    };

    const handleHeightChange = (event) => {
        const heightValue = parseInt(event.target.value, 10);
        if (!isNaN(heightValue) && heightValue > 0) {
            setHeight(heightValue);
            if (calculateAspect) {
                const aspectRatio = width ? width / heightValue : 1;
                // Calculate the perfect width based on the original aspect ratio
                const perfectWidth = Math.round(heightValue * originalAspectRatio);
                setWidth(perfectWidth);
            }
        }
    };

    const handleAspectCheckboxChange = (event) => {
        setCalculateAspect(event.target.checked);
    };

    // Event handler for drag and drop
    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const files = event.dataTransfer.files;

        if (!files || files.length === 0) {
            setImageUploaded(false);
            return;
        }

        setImageUploaded(true);

        // Handle each file in the files array
        const filesArray = Array.from(files);
        setUploadedFiles(filesArray);

        for (let i = 0; i < filesArray.length; i++) {
            const file = filesArray[i];
            const reader = new FileReader();

            reader.onload = function (event) {
                const img = new Image();
                img.onload = function () {
                    // Check the aspect ratio and set the initial width and height accordingly
                    const originalAspectRatio = img.width / img.height;
                    setOriginalAspectRatio(originalAspectRatio);

                    if (calculateAspect) {
                        setWidth(img.width);
                        setHeight(img.height);
                    }
                };
                img.src = event.target.result;
            };

            reader.readAsDataURL(file);
        }
    };

    const downloadResizedImage = (url, index) => {
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `resized_image_${index}.jpg`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    // Prevent default behavior on dragover to enable drop
    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    return (
        <>
            <section className='landing'>
                <div className='container-fluid'>
                    <div className='landing-content'>
                        <input
                            id='widthInput'
                            type='number'
                            placeholder='put your width in pixels'
                            value={width}
                            onChange={handleWidthChange}
                            disabled={!imageUploaded}
                        />
                        <input
                            id='heightInput'
                            type='number'
                            placeholder='put your height in pixels'
                            value={height}
                            onChange={handleHeightChange}
                            disabled={!imageUploaded}
                        />

                        <div
                            id='fileInput'
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragEnter={handleDragOver}
                            onDragLeave={handleDragOver}
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('fileInput').click();
                            }}
                        >
                            <input
                                type='file'
                                name='img'
                                multiple
                                style={{ display: 'none' }}
                                onChange={handleImageUpload}
                            />
                            <p>Drag &amp; Drop or Click to Upload Images</p>
                        </div>

                        <label>
                            Calculate Aspect Ratio:
                            <input
                                type='checkbox'
                                checked={calculateAspect}
                                onChange={handleAspectCheckboxChange}
                                disabled={!imageUploaded}
                            />
                        </label>

                        <button className='resize-btn' onClick={handleResize} disabled={!imageUploaded}>
                            Resize and Download
                        </button>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Landing;
